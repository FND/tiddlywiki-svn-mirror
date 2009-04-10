"""
WSGI Middleware apps that haven't gotten around
to being extracted to their own modules.
"""

import logging
import time
import urllib

from tiddlyweb.model.policy import UserRequiredError, ForbiddenError
from tiddlyweb.store import Store
from tiddlyweb.web.http import HTTP403, HTTP302
from tiddlyweb.web.util import server_base_url

from tiddlyweb import __version__ as VERSION


class Header(object):
    """
    If REQUEST_METHOD is HEAD, change it to GET and
    consume the output for lower requests.
    """

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        if environ['REQUEST_METHOD'] == 'HEAD':
            environ['REQUEST_METHOD'] = 'GET'
            output = self.application(environ, start_response)
            return []
        else:
            return self.application(environ, start_response)


class HTMLPresenter(object):
    """
    Take the core app output, if tiddlyweb.title is set
    in environ and we appear to be using a browser,
    add some HTML framework.
    """

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        output = self.application(environ, start_response)
        if 'tiddlyweb.title' in environ and 'Mozilla' in environ['HTTP_USER_AGENT']:
            output = ''.join(output)
            return [self._header(environ), output, self._footer(environ)]
        return output

    def _header(self, environ):
        """
        Wrap the HTML in an HTML header.
        """
        css = ''
        if environ['tiddlyweb.config'].get('css_uri', ''):
            css = '<link rel="stylesheet" href="%s" type="text/css" />' % \
                    environ['tiddlyweb.config']['css_uri']
        try:
            links = '\n'.join(environ['tiddlyweb.links'])
        except KeyError:
            links = ''
        header_extra = self.header_extra(environ)
        return """
<html>
<head>
<title>TiddlyWeb - %s</title>
%s
%s
</head>
<body>
<div id="header">
<h1>%s</h1>
%s
</div>
<div id="content">
""" % (environ['tiddlyweb.title'], css, links, environ['tiddlyweb.title'], header_extra)

    def _footer(self, environ):
        """
        Wrap the HTML with an HTML footer.
        """
        footer_extra = self.footer_extra(environ)
        return """
</div>
<div id="footer">
%s
<div id="badge">This is <a href="http://tiddlyweb.peermore.com/">TiddlyWeb</a> %s</div>
<div id="usergreet">User %s.</div>
</div>
</body>
</html>
""" % (footer_extra, VERSION, environ['tiddlyweb.usersign']['name'])

    # XXX: to make these stackable this can't just
    # be a method, we need some kind of registry.

    def header_extra(self, environ):
        """
        Override this in plugins to add to the header.
        """
        return ''

    def footer_extra(self, environ):
        """
        Override this in plugins to add to the footer.
        """
        return ''


class SimpleLog(object):
    """
    WSGI Middleware to write a very simple log to stdout.

    Borrowed from Paste Translogger
    """

    format = ('%(REMOTE_ADDR)s - %(REMOTE_USER)s [%(time)s] '
            '"%(REQUEST_METHOD)s %(REQUEST_URI)s %(HTTP_VERSION)s" '
            '%(status)s %(bytes)s "%(HTTP_REFERER)s" "%(HTTP_USER_AGENT)s"')

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        req_uri = urllib.quote(environ.get('SCRIPT_NAME', '')
                + environ.get('PATH_INFO', ''))
        if environ.get('QUERY_STRING'):
            req_uri += '?'+environ['QUERY_STRING']

        def replacement_start_response(status, headers, exc_info=None):
            bytes = None
            for name, value in headers:
                if name.lower() == 'content-length':
                    bytes = value
            self.write_log(environ, req_uri, status, bytes)
            return start_response(status, headers, exc_info)

        return self.application(environ, replacement_start_response)

    def write_log(self, environ, req_uri, status, bytes):
        """
        Print the log info out in a formatted for to stdout.
        """
        environ['REMOTE_USER'] = None
        try:
            environ['REMOTE_USER'] = environ['tiddlyweb.usersign']['name']
        except KeyError:
            pass
        if bytes is None:
            bytes = '-'
        log_format = {
                'REMOTE_ADDR': environ.get('REMOTE_ADDR') or '-',
                'REMOTE_USER': environ.get('REMOTE_USER') or '-',
                'REQUEST_METHOD': environ['REQUEST_METHOD'],
                'REQUEST_URI': req_uri,
                'HTTP_VERSION': environ.get('SERVER_PROTOCOL'),
                'time': time.strftime('%d/%b/%Y:%H:%M:%S ', time.localtime()),
                'status': status.split(None, 1)[0],
                'bytes': bytes,
                'HTTP_REFERER': environ.get('HTTP_REFERER', '-'),
                'HTTP_USER_AGENT': environ.get('HTTP_USER_AGENT', '-'),
                }
        message = self.format % log_format
        logging.info(message)


class StoreSet(object):
    """
    WSGI Middleware that sets our choice of Store (tiddlyweb.store) in the environment.
    Eventually this can be used to configure the store per instance.
    """

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        database = Store(environ['tiddlyweb.config']['server_store'][0], environ)
        environ['tiddlyweb.store'] = database
        return self.application(environ, start_response)


class EncodeUTF8(object):
    """
    WSGI Middleware to ensure that the content we send out the pipe is encoded
    as UTF-8. Within the application content is _unicode_ (i.e. not encoded).
    """

    def __init__(self, application):
        self.application = application

    def _encoder(self, string):
        # if we are currently unicode, encode to utf-8
        if type(string) == unicode:
            string = string.encode('utf-8')
        return string

    def __call__(self, environ, start_response):
        return [self._encoder(output) for output in self.application(environ, start_response)]


class PermissionsExceptor(object):
    """
    Trap permissions exceptions and turn them into HTTP
    exceptions so the errors are propagated to client
    code.
    """

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        try:
            output = self.application(environ, start_response)
            return output
        except ForbiddenError, exc:
            raise HTTP403(exc)
        except UserRequiredError, exc:
            # We only send to the challenger on a GET
            # request. Otherwise we're in for major confusion
            # on dealing with redirects and the like in
            # scripts and javascript, where follow
            # behavior is inconsistent.
            if environ['REQUEST_METHOD'] == 'GET':
                url = self._challenge_url(environ)
                raise HTTP302(url)
            raise HTTP403(exc)

    def _challenge_url(self, environ):
        """
        Generate the URL of the challenge system
        so that GET requests are redirected to the
        right place.
        """
        script_name = environ.get('SCRIPT_NAME', '')
        query_string = environ.get('QUERY_STRING', None)
        redirect = script_name
        if query_string:
            redirect += '?%s' % query_string
        redirect = urllib.quote(redirect)
        return '%s/challenge?tiddlyweb_redirect=%s' % (server_base_url(environ), redirect)
