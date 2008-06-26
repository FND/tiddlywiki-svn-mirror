"""
Functions and Classes for running the TiddlyWeb
web server.
"""
import os
import sys
import selector
import time
import urllib

from tiddlyweb.web.negotiate import Negotiate
from tiddlyweb.web.extractor import UserExtract
from tiddlyweb.auth import PermissionsExceptor, ForbiddenError
from tiddlyweb.web.http import HTTPExceptor
from tiddlyweb.store import Store

from tiddlyweb.config import config

def load_app(host, port, map, wrappers=[]):
    """
    Create our application from a series of layers. The innermost
    layer is a selector application based on url map in map. This
    is surround by wrappers, which either set something in the 
    environment or modify the request, or transform output.
    """
    config['server_host'] = dict(scheme='http', host=host, port=port)
    app = selector.Selector(mapfile=map)
    if wrappers:
        for wrapper in wrappers:
            app = wrapper(app)
    return app

def start_simple(filename, hostname, port):
    """
    Start a wsgiref.simple_server to run our app.

    Provides the simplest base for testing, debugging
    and development.
    """
    os.environ = {}
    from wsgiref.simple_server import WSGIServer, WSGIRequestHandler
    httpd = WSGIServer((hostname, port), WSGIRequestHandler)
    httpd.set_app(default_app(hostname, port, filename))
    print "Serving HTTP on %s port %s ..." % httpd.socket.getsockname()
    httpd.serve_forever()

def start_cherrypy(filename, hostname, port):
    """
    Start a cherrypy webserver to run our app.
    
    Here for sake of testing %2F handling as well as
    seeing what happens in a threaded environment.
    """
    os.environ = {}
    from cherrypy import wsgiserver
    server = wsgiserver.CherryPyWSGIServer((hostname, port),
            default_app(hostname, port, filename))
    try:
        print "Starting CherryPy"
        server.start()
    except KeyboardInterrupt:
        server.stop()

def default_app(hostname, port, filename):
    """
    The pointer to our url map, plus the list of middleware 
    wrappers which we require.

    Eventually these should come from configuration. For now it
    is static, and consists of:

    === The following wrap above the core app ===
    PermissionsExceptor: Watch for permissions exceptions
                         and handle them according to authentication
                         handling rules.
    HTTPExceptor: trap exceptions raised deeper in the code. 
                  Most of the time we hope these are HTTP
                  related, and we can send them on as such.
    StoreSet: set tiddlyweb.store in the environment to be a 
              tiddlyweb.store object.
    UserExtract: Attemp to get a usersign from the request.
    Negotiate: do content negotiation, setting tiddlyweb.type to
                the preferred Accept type, or to Content-Type (if
                this is not a GET).
    === The following do things to the result  ===
    EncodeUTF8: encode internal unicode data as UTF-8 output.
    SimpleLog: write a log of activity
    """
    return load_app(hostname, port, filename, [Negotiate, UserExtract, StoreSet, Configurator, PermissionsExceptor, HTTPExceptor, EncodeUTF8, SimpleLog])

class Configurator(object):
    """
    Stub WSGI Middleware to handle setting a config dict
    for every request.
    """
    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response, exc_info=None):
        environ['tiddlyweb.config'] = config
        return self.application(environ, start_response)

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

    def __call__(self, environ, start_response, exc_info=None):
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
        if bytes is None:
            bytes = '-'
        d = {
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
        message = self.format % d
        print message
        sys.stdout.flush()

class StoreSet(object):
    """
    WSGI Middleware that sets our choice of Store (tiddlyweb.store) in the environment.
    Eventually this can be used to configure the store per instance.
    """

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response, exc_info=None):
        db = Store(environ['tiddlyweb.config']['server_store'][0], environ)
        environ['tiddlyweb.store'] = db
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

    def __call__(self, environ, start_response, exc_info=None):
        return [self._encoder(x) for x in self.application(environ, start_response)]
