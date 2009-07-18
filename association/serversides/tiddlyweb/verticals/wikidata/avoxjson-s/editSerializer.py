import urllib
import logging

from jinja2 import Environment as templating

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.model.bag import Bag

from wikidataSerializer import _generate_template


EXTENSION_TYPES = { 'edit': 'text/x-edit-html' }
SERIALIZERS = {
    'text/x-edit-html': ['editSerializer', 'text/html; charset=UTF-8']
}

templates_dir = 'templates'


def init(config):
    config['extension_types'].update(EXTENSION_TYPES)
    config['serializers'].update(SERIALIZERS)


class Serialization(SerializationInterface):

    def tiddler_as(self, tiddler):
        bag = Bag('tmpbag', tmpbag=True)
        bag.add_tiddler(tiddler)
        template = _generate_template("editCompany.html")
        return template.render(tiddler=tiddler)
