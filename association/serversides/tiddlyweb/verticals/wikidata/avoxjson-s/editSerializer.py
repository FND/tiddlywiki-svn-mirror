import urllib
import logging

import jinja2

from jinja2 import Environment, FunctionLoader

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.serializations.html import Serialization as HTML_Serializer
from tiddlyweb.model.bag import Bag


EXTENSION_TYPES = { 'edit': 'text/x-edit-html' }
SERIALIZERS = {
    'text/x-edit-html': ['editSerializer', 'text/html; charset=UTF-8']
}

templates_dir = 'templates'


def init(config):
    config['extension_types'].update(EXTENSION_TYPES)
    config['serializers'].update(SERIALIZERS)


class Serialization(HTML_Serializer):

    def __init__(self, environ=None):
        if environ is None:
            environ = {}
        self.environ = environ
        self.template_env = Environment(loader=FunctionLoader(_generate_template))

    def tiddler_as(self, tiddler):
        bag = Bag('tmpbag', tmpbag=True)
        bag.add_tiddler(tiddler)
        template = self.template_env.get_template("editCompany.html")
        return template.render(tiddler=tiddler)


def _generate_template(name):
    components = ["header.html", name, "footer.html"]
    return "%s\n%s\n%s" % tuple(_get_template(name) for name in components)


def _get_template(name):
    filepath = "%s/%s" % (templates_dir, name)
    f = open(filepath)
    contents = f.read()
    f.close() # XXX: not required?
    return contents
