"""
Present or validate a form for getting a username
and password.
"""

import logging
import templating

from tiddlyweb.web.challengers import ChallengerInterface
from tiddlyweb.web.util import server_host_url, make_cookie
from tiddlyweb.model.user import User
from tiddlyweb.store import NoUserError


class Challenger(ChallengerInterface):
    """
    A simple challenger that asks the user, by form, for their
    username and password and validates it against the user
    database. If it is good, a cookie is sent to the client which
    is later used by the simple_cookie credentials extractor.
    """

    def challenge_get(self, environ, start_response):
        """
        Respond to a GET request by sending a form.
        """
        redirect = (environ['tiddlyweb.query'].
                get('tiddlyweb_redirect', ['/'])[0])
        template = templating.generate_template(["login_form.html"])
    
        start_response('200 OK', [
            ('Content-Type', 'text/html'),
            ('Pragma', 'no-cache')
            ])

        commonVars = templating.getCommonVars(environ)
        return template.render(redirect=redirect, commonVars=commonVars)

    def challenge_post(self, environ, start_response):
        """
        Respond to a POST by processing data sent from a form.
        The form should include a username and password. If it
        does not, send the form aagain. If it does, validate
        the data.
        """
        query = environ['tiddlyweb.query']
        redirect = query.get('tiddlyweb_redirect', ['/'])[0]

        try:
            username = query['username'][0]
            password = query['password'][0]
            return self._validate_and_redirect(environ, start_response,
                    username, password, redirect)
        except KeyError:
            template = templating.generate_template(["login_form.html"])
        
            start_response('401 Unauthorized', [
                ('Content-Type', 'text/html')
                ])

            commonVars = templating.getCommonVars(environ)
            return template.render(redirect=redirect, commonVars=commonVars, error=True)

    def _validate_and_redirect(self, environ, start_response, username,
            password, redirect):
        """
        Check a username and password. If valid, send a cookie
        to the client. If it is not, send the form again.
        """
        status = '401 Unauthorized'
        try:
            store = environ['tiddlyweb.store']
            secret = environ['tiddlyweb.config']['secret']
            cookie_age = environ['tiddlyweb.config'].get('cookie_age', None)
            user = User(username)
            user = store.get(user)
            if user.check_password(password):
                uri = '%s%s' % (server_host_url(environ), redirect)
                cookie_header_string = make_cookie('tiddlyweb_user',
                        user.usersign, mac_key=secret,
                        path=self._cookie_path(environ), expires=cookie_age)
                logging.debug('303 to %s', uri)
                start_response('303 Other',
                        [('Set-Cookie', cookie_header_string),
                            ('Location', uri.encode('utf-8')),
                            ('Pragma', 'no-cache')])
                return [uri]
        except KeyError:
            pass
        except NoUserError:
            logging.debug('NoUserError for: '+username)
            pass
        template = templating.generate_template(["login_form.html"])
        
        start_response(status, [
            ('Content-Type', 'text/html'),
            ('Pragma', 'no-cache')
            ])

        commonVars = templating.getCommonVars(environ)
        return template.render(redirect=redirect, commonVars=commonVars, error=True)
