"""
A suite of tools that make creating and handling plugins
in TiddlyWeb a bit more sensible.

Essentially this is a way to raise duplication to a common
core without encumbering the TiddlyWeb core.
"""

from tiddlyweb.model.policy import UserRequiredError


def entitle(title):
    """
    Decorator that sets tiddlyweb.title in environ.
    """
    def entangle(f):
        def entitle(environ, start_response, *args, **kwds):
            output = f(environ, start_response)
            environ['tiddlyweb.title'] = title
            return output
        return entitle
    return entangle


def do_html():
    """
    Decorator that makes sure we are sending text/html.
    """
    def entangle(f):
        def do_html(environ, start_response, *args, **kwds):
            output = f(environ, start_response)
            start_response('200 OK', [
                ('Content-Type', 'text/html; charset=UTF-8')
                ])
            return output
        return do_html
    return entangle


def require_role(role):
    """
    Decorator that requires the current user has role <role>.
    """
    role = unicode(role)
    def entangle(f):
        def require_role(environ, start_response, *args, **kwds):
            try:
                if role in environ['tiddlyweb.usersign']['roles']:
                    return f(environ, start_response)
                else:
                    raise(UserRequiredError, 'insufficient permissions')
            except KeyError:
                raise(UserRequiredError, 'insufficient permissions')
        return require_role
    return entangle
