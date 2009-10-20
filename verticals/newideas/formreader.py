"""
A quick hack to parse CGI form fields into fields on a 
tiddler.

TODO:

    better bag name handling
    ensuring the bag exists
    redirect to somewhere useful

"""

from tiddlyweb.model.tiddler import Tiddler
from uuid import uuid4
from tiddlyweb.web.http import HTTP302
import re

SKIP_FIELDS = ['text', 'tags'] # add string fields that we don't want in the tiddler data
TARGET_BAG = 'ideas' # XXX this ought to come from the form. Existence assumed.


def init(config):
    config['selector'].add('/submit_form', POST=handler)

def create_tag_list(input_string):
    regex = '\[\[([^\]\]]+)\]\]|(\S+)'
    matches = re.findall(regex, input_string)
    tags = set()
    for bracketed, unbracketed in matches:
        tag = bracketed or unbracketed
        tags.add(tag)
    return list(tags)
    
def handler(environ, start_response):
    try:
        redirect = environ['tiddlyweb.query'].pop('redirect')[0]
    except KeyError:
        redirect = None
    input = environ['tiddlyweb.query']
    store = environ['tiddlyweb.store']
    extra = {}
    # deal with python cgi packaging
    for field in input:
        if field in SKIP_FIELDS:
            extra[field] = input[field][0]
            continue
        input[field] = input[field][0]

    # need this to come in on the form input
    tiddler_title = input.get('tiddler_title', None) or uuid4()

    tiddler = Tiddler(tiddler_title, TARGET_BAG) # XXX is this the bag you want?
    tiddler.tags = create_tag_list(extra['tags'])
    tiddler.text = extra['text']
    tiddler.fields = input

    store.put(tiddler)

    url = redirect or '/' # XXX replace with real url
    raise HTTP302(url) 
