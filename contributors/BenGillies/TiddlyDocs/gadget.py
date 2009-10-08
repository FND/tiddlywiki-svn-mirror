"""
placeholder gadget for MyPage inclusion
"""



def get_gadget(environ, start_response):
    """
    return a simple page for gadget testing
    """
    gadget_page = '<html><head><title>MyDocs</title></head><body><a href="/doccollab/recipes/tiddlydocs/tiddlers.wiki" target="_blank">MyDocs</a></body></html>'
    start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
    return gadget_page

def init(config):
    config['selector'].add('/gadget', GET=get_gadget)

