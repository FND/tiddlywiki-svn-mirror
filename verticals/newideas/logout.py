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
    theheader = [
        ('Location', uri)
    ]
    path = environ.get('tiddlyweb.config', {}).get('server_prefix', '')
    
    for i in ["tiddlyweb_user","admin","group_id","group_name","region","user_id","user_name"]:
      cookie = Cookie.SimpleCookie()
      cookie[i] = ''
      cookie[i]['path'] = '%s/' % path
      cookie[i]['expires'] = '%s' % (time.ctime(time.time()-6000))
      theheader.append(('Set-Cookie', cookie.output(header='')))
    start_response('303 See Other', theheader)
    return [uri]


def init(config):
    config['selector'].add('/logout', GET=logout)
