"""
gadget for MyPage inclusion
"""
from tiddlyweb.web.http import HTTP403


def get_gadget(environ, start_response):
    """
    return a simple page for gadget testing
    """
    if environ['tiddlyweb.usersign'].get('roles'):
        gadget_links = ['<a href="%s/recipes/%s/tiddlers.wiki" target="_blank">%s Docs</a>' % (environ['tiddlyweb.config']['server_prefix'], role, role) for role in environ['tiddlyweb.usersign']['roles']]
        gadget_page = '''<html>
        <head><title>MyDocs</title></head>
        <body style="color:#333333;font-family:Arial,Verdana,Helvetica,sans-serif;font-size:12px;">
        %s
        </body>
        </html>''' % '\n'.join(gadget_links)
        start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
        return gadget_page
    else:
        start_response('403 Forbidden', [('Content-Type', 'text/html; charset=utf-8')])
        gadget_page = '''<html>
        <head><title>MyDocs Forbidden</title></head>
        <body style="color:#333333;font-family:Arial,Verdana,Helvetica,sans-serif;font-size:12px;">
        Oops, you don't have access to MyDocs.  To request access please contact <a href="mailto:mypage@bt.com">mypage@bt.com</a>. Thank you
        </body>
        </html>'''
        return gadget_page

def init(config):
    config['selector'].add('/gadget', GET=get_gadget)

