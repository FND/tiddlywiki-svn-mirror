"""
gadget for MyPage inclusion
"""
from tiddlyweb.web.http import HTTP403


def get_gadget(environ, start_response):
    """
    return a simple page for gadget testing
    """
    if getattr(environ['tiddlyweb.usersign'], 'roles', None):
        gadget_links = ['<a href="/%s/recipes/%s/tiddlers.wiki" target="_blank">%s Docs</a>' % (environ['tiddlyweb.config']['server_prefix'], role, role) for role in environ['tiddlyweb.usersign'].roles]
        gadget_page = '''<html>
        <head><title>MyDocs</title></head>
        <body>
        %s
        </body>
        </html>''' % '\n'.join(gadget_links)
        start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
        return gadget_page
    else:
        raise HTTP403()

def init(config):
    config['selector'].add('/gadget', GET=get_gadget)

