from tiddlyweb.model.tiddler import Tiddler

from tiddlyweb.web.http import HTTP302

SKIP_FIELDS = [] # add string fields that we don't want in the tiddler data

def handler(environ, start_response):
    input = environ['tiddlyweb.query']
    store = environ['tiddlyweb.store']

    # deal with python cgi packaging
    for field in input:
        if field in SKIP_FIELDS:
            continue
        input[field] = input[field][0]

    # need this to come in on the form input
    avid = input['avid']

    tiddler = Tiddler(avid, 'avid') # XXX is this the bag you want?
    tiddler.fields = input

    store.put(tiddler)

    url = '/' # XXX replace with real url
    raise HTTP302(url) 


def init(config):
    config['selector'].add('/submit', POST=handler)
