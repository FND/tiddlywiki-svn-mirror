import urllib
import logging

from jinja2 import Environment as templating

from tiddlyweb.serializations.html import Serialization as HTML_Serializer
from tiddlyweb.model.bag import Bag


EXTENSION_TYPES = { 'wd': 'text/html' }
SERIALIZERS = {
    'text/html': ['wikidataSerializer', 'text/html; charset=UTF-8']
}

templates_dir = 'templates'


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
        tiddlers = bag.list_tiddlers()
        template = _generate_template("collection.html")
        return template.render(tiddlers=tiddlers)

    def tiddler_as(self, tiddler):
        bag = Bag('tmpbag', tmpbag=True)
        bag.add_tiddler(tiddler)
        template = _generate_template("company.html")
        return template.render(tiddler=tiddler, maps_api_key=self.maps_api_key)


def _generate_template(name):
    components = ["header.html", name, "footer.html"]
    template = "%s\n%s\n%s" % tuple(_get_template(name) for name in components)
    return templating().from_string(template)


def _get_template(name):
    filepath = "%s/%s" % (templates_dir, name)
    f = open(filepath)
    contents = f.read()
    f.close() # XXX: not required?
    return contents
