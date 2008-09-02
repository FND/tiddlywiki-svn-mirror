"""
An extractor for looking at a cookie
named 'tiddlyweb_user'.
"""

import Cookie

from tiddlyweb.user import User
from tiddlyweb.store import NoUserError, StoreMethodNotImplemented
from tiddlyweb.web.extractors import ExtractorInterface
from sha import sha

class Extractor(ExtractorInterface):

    def extract(self, environ, start_response):
        try:
            user_cookie = environ['HTTP_COOKIE']
            cookie = Cookie.SimpleCookie()
            cookie.load(user_cookie)
            cookie_value = cookie['tiddlyweb_user'].value
            secret = environ['tiddlyweb.config']['secret']
            usersign, cookie_secret = cookie_value.split(':')
            store = environ['tiddlyweb.store']

            if cookie_secret == sha('%s%s' % (usersign, secret)).hexdigest():
                user = User(usersign)
                try:
                    store.get(user)
                except (StoreMethodNotImplemented, NoUserError):
                    pass
                return {"name": user.usersign, "roles": user.list_roles()}
        except KeyError:
            pass
        return False

