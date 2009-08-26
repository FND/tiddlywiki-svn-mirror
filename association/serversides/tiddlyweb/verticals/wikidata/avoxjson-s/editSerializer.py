import urllib
import logging
import templating

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.model.bag import Bag

EXTENSION_TYPES = { 'edit': 'text/x-edit-html' }
SERIALIZERS = {
    'text/x-edit-html': ['editSerializer', 'text/html; charset=UTF-8']
}

def init(config):
    config['extension_types'].update(EXTENSION_TYPES)
    config['serializers'].update(SERIALIZERS)


class Serialization(SerializationInterface):

    def tiddler_as(self, tiddler):
        bag = Bag('tmpbag', tmpbag=True)
        bag.add_tiddler(tiddler)
        template = templating.generate_template(["editCompany.html"])
        return template.render(tiddler=tiddler)
