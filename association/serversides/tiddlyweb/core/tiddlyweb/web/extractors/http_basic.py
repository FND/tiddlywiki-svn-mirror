"""
A very simple extractor that looks at the HTTP Authorization
header and looks for Basic auth information therein.
"""

from base64 import b64decode

from tiddlyweb.web.extractors import ExtractorInterface
from tiddlyweb.model.user import User
from tiddlyweb.store import NoUserError, StoreMethodNotImplemented


class Extractor(ExtractorInterface):
    """
    An extractor for HTTP Basic Authentication. If there
    is an Authorization header attempt to get a username and
    password out of it. If the password is valid, return the
    user information.
    """

    def extract(self, environ, start_response):
        """
        Look in the request for an Authorization header.
        """
        user_info = environ.get('HTTP_AUTHORIZATION', None)
        if user_info is None:
            return False
        if user_info.startswith('Basic'):
            user_info = user_info.strip().split(' ')[1]
            candidate_username, password = b64decode(user_info).split(':')
            try:
                store = environ['tiddlyweb.store']
                user = User(candidate_username)
                user = store.get(user)
                if user.check_password(password):
                    return {"name": user.usersign, "roles": user.list_roles()}
            except (NoUserError, StoreMethodNotImplemented):
                pass
        return False
