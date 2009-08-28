import urllib
import logging
import templating

from tiddlyweb.serializations.html import Serialization as HTML_Serializer
from tiddlyweb.model.bag import Bag

EXTENSION_TYPES = { 'wd': 'text/html' }
SERIALIZERS = {
    'text/html': ['wikidataSerializer', 'text/html; charset=UTF-8']
}


def init(config):
    config['extension_types'].update(EXTENSION_TYPES)
    config['serializers'].update(SERIALIZERS)


class Serialization(HTML_Serializer):

    def __init__(self, environ=None):
        self.environ = environ
        try:
            self.maps_api_key = environ['tiddlyweb.config']['maps_api_key']
        except TypeError, KeyError:
            self.maps_api_key = None

    def list_tiddlers(self, bag):
        logging.debug('in list_tiddlers')
        tiddlers = bag.list_tiddlers()
        template = templating.generate_template(["search.html", "collection.html"])
        return template.render(tiddlers=tiddlers)

    def tiddler_as(self, tiddler):
        logging.debug('in tiddler_as')
        bag = Bag('tmpbag', tmpbag=True)
        bag.add_tiddler(tiddler)
        template = templating.generate_template(["company.html"])
        return template.render(tiddler=tiddler, maps_api_key=self.maps_api_key)
