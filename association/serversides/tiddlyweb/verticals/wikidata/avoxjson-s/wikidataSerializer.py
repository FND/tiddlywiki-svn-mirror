from jinja2 import Environment, FileSystemLoader
 
import logging, urllib, jinja2
 
from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.model.bag import Bag
from tiddlyweb.web.util import encode_name
 
 
EXTENSION_TYPES = { 'wd': 'text/x-wd-html' }
SERIALIZERS = {
        'text/x-wd-html': ['wikidataSerializer', 'text/html; charset=UTF-8']
        }

class Serialization(SerializationInterface):
 
    def __init__(self, environ=None):
        if environ is None:
            environ = {}
        self.environ = environ
        self._init()
 
    def _init(self):
        template_env = Environment(loader=FileSystemLoader('templates'))
        self.template = template_env.get_template('collection.html')
 
 
    def list_tiddlers(self, bag):
        tiddlers = bag.list_tiddlers()
        return self.template.render(tiddlers=tiddlers)



    def tiddler_as(self, tiddler):
        template_env = Environment(loader=FileSystemLoader('templates'))
        self.template = template_env.get_template('company.html')
        bag = Bag('tmpbag', tmpbag=True)
        bag.add_tiddler(tiddler)
        return self.template.render(tiddler=tiddler)
 
 
def init(config):
    config['extension_types'].update(EXTENSION_TYPES)
    config['serializers'].update(SERIALIZERS)
