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
    cookie = Cookie.SimpleCookie()
    cookie['tiddlyweb_user'] = ''
    cookie['tiddlyweb_user']['path'] = '/'
    cookie['tiddlyweb_user']['expires'] = '%s' % (time.ctime(time.time()-6000))
    start_response('303 See Other', [
        ('Set-Cookie', cookie.output(header='')),
        ('Location', uri)
        ])
    return [uri]


def init(config):
    config['selector'].add('/logout', GET=logout)
