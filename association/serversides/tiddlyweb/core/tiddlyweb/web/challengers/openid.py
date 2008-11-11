"""
A very raw implementation of an openid
challenger that does checkid_setup.

Is OpenID 1.
"""
import cgi
import Cookie
import random
import urllib

from BeautifulSoup import BeautifulSoup
from sha import sha

import tiddlyweb.web.util as web
from tiddlyweb.web.challengers import ChallengerInterface


class Challenger(ChallengerInterface):
    """
    An OpenID challenger that asks the client for
    an openid and then follows the checkid_setup process
    to validate the ID. Once valid, a cookie is given
    to the browser which is later used by the simple_cookie
    credential extractor.
    """

    def challenge_get(self, environ, start_response):
        """
        Respond to a GET request. If there is no openid_mode,
        send a form to ask for an openid. If openid_mode was
        cancel, then the client cancelled the process somewhere
        in transit, in which case send the form again asking for
        another ID. If mod is id_res, then we have previously
        sent content a request to the OpenID server and now must
        handle the response.
        """
        redirect = environ['tiddlyweb.query'].get('tiddlyweb_redirect', ['/'])[0]
        openid_mode = environ['tiddlyweb.query'].get('openid.mode', [None])[0]

        if openid_mode:
            if openid_mode == 'id_res':
                return self._handle_server_response(environ, start_response)
            if openid_mode == 'cancel':
                return self._send_openid_form(
                        environ, start_response, redirect, message='Try a different OpenID?')
        return self._send_openid_form(environ, start_response, redirect)

    def challenge_post(self, environ, start_response):
        """
        Respond to a POST request. If the form has been filled out, we need
        to find the server and send the user to talk to it. Otherwise, ask
        the user to fill out the form again.
        """
        redirect = environ['tiddlyweb.query'].get('tiddlyweb_redirect', ['/'])[0]
        openid = environ['tiddlyweb.query'].get('openid', [''])[0]

        if len(openid):
            return self._find_speak_to_server(environ, start_response, redirect, openid)
        else:
            return self._send_openid_form(environ, start_response, redirect, message='Enter an OpenID')

    def _handle_server_response(self, environ, start_response):
        """
        The user has gone to their OpenID server and confirmed we can
        have accesss. We need to send a signed copy of the data we've
        recieved in a second request to the server, to confirm. If the
        response is 'is_valid: true' then we passed and we can send a
        cookie to the user.
        """
        request_info = environ['tiddlyweb.query']
        parsed_return_to = cgi.parse_qs(request_info['openid.return_to'][0])
        openid_server = parsed_return_to['openid_server'][0]
        redirect = parsed_return_to['tiddlyweb_redirect'][0]
        data = {
            'openid.mode': 'check_authentication',
            'openid.sig': request_info['openid.sig'][0],
            'openid.signed': request_info['openid.signed'][0],
            'openid.assoc_handle': request_info['openid.assoc_handle'][0],
            }
        for item in request_info['openid.signed'][0].split(','):
            if item == 'mode' or item == 'sig' or item == 'signed' or item == 'assoc_handle':
                continue
            key = 'openid.%s' % item
            try:
                data[key] = request_info[key][0]
            except KeyError:
                pass # signed key not in request
        post_data = urllib.urlencode(data)

        response = urllib.urlopen(openid_server, post_data).read()

        if 'is_valid:true' in response:
            usersign = parsed_return_to['usersign'][0]
            if 'http' in usersign:
                usersign = usersign.split('://', 2)[1]
            uri = '%s%s' % (web.server_host_url(environ), redirect)
            cookie = Cookie.SimpleCookie()
            secret = environ['tiddlyweb.config']['secret']
            secret_string = sha('%s%s' % (usersign, secret)).hexdigest()
            cookie['tiddlyweb_user'] = '%s:%s' % (usersign, secret_string)
            cookie['tiddlyweb_user']['path'] = '/'
            start_response('303 See Other', [
                ('Set-Cookie', cookie.output(header='')),
                ('Location', uri)
                ])
            return [uri]
        return self._send_openid_form(environ, start_response, redirect, status='401 Unauthorized', message=response)

    def _send_openid_form(self, environ, start_response, redirect, status='200 OK', message=''):
        """
        Send a form requesting an openid to the client.
        """
        start_response(status, [
            ('Content-Type', 'text/html')
            ])
        environ['tiddlyweb.title'] = 'OpenID Login'
        return [
"""
<pre>
%s
<form action="" method="POST">
OpenID: <input name="openid" size="60" />
<input type="hidden" name="tiddlyweb_redirect" value="%s" />
<input type="submit" value="submit" />
</form>
</pre>
""" % (message, redirect)]

    def _find_speak_to_server(self, environ, start_response, redirect, openid):
        """
        Search on the users provided OpenID page for the openid.server
        or openid.delegate and redirect the user there with proper
        parameters.
        """
        if not openid.startswith('http://'):
            openid = 'http://%s' % openid

        if openid.endswith('/'):
            openid = openid.rstrip('/')

        htmlpage = urllib.urlopen(openid).read()
        soup = BeautifulSoup(htmlpage)
        try:
            link = soup.find('link', rel='openid.server')['href']
        except TypeError:
            return self._send_openid_form(
                    environ, start_response, redirect,
                    message='Unable to find openid server')

        original_openid = openid
        try:
            openid = soup.find('link', rel='openid.delegate')['href']
        except TypeError:
            pass

        request_uri = '%s?openid.mode=checkid_setup&openid.identity=%s&openid.return_to=%s' \
                % (link, urllib.quote(openid),
                        urllib.quote(self._return_to(environ, redirect, link, original_openid)))

        start_response('303 See Other', [
            ('Location', request_uri)
            ])

        return []

    def _return_to(self, environ, redirect, link, usersign):
        """
        Generate the URL to which the user should return to after
        visiting their OpenID server.
        """
        return '%s/challenge/openid?nonce=%s&tiddlyweb_redirect=%s&openid_server=%s&usersign=%s' \
                % (web.server_host_url(environ), self._nonce(), redirect, link, usersign)

    def _nonce(self):
        """
        Generate a random string.
        """
        return ''.join([random.choice('ABCDEFGHIJHKLMNOPQRSTUVWXYZ') for x in xrange(8)])
