"""
A simple logout plugin that works with the simple_cookie
extractor.
"""

import Cookie
import logging
import time


def logout(environ, start_response):
    """
    Break the web by allowing a logout on a GET request.
    And then break it further by sending a bad redirect.
    """
    uri = environ.get('HTTP_REFERER', '/')
    # uri += "?logout=1" # JRL: to prevent cacheing of logged-in version
    # commented out line above to try Vary: Cookie method instead
    path = environ.get('tiddlyweb.config', {}).get('server_prefix', '')
    cookie = Cookie.SimpleCookie()
    cookie['tiddlyweb_user'] = ''
    cookie['tiddlyweb_user']['path'] = '%s/' % path
    cookie['tiddlyweb_user']['expires'] = '%s' % (time.ctime(time.time()-6000))
    start_response('303 See Other', [
        ('Set-Cookie', cookie.output(header='')),
        #('Vary', 'Cookie'), JRL: one option
        ("Pragma", "no-cache"),
        ('Location', '/') # JRL: uri replaced with '/' until caching problem goes away - this is just to make the experience better
        ])
    return [uri]


def init(config):
    config['selector'].add('/logout', GET=logout)