"""
Rich Text Format (RTF) TiddlyWeb Serializer
"""

EXTENSION_TYPES = {
        'rtf': 'text/rtf'
        }

SERIALIZERS = {
        'text/rtf': ['rtf', 'text/rtf; charset=utf-8']
        }

def init(config):
    config['extension_types'].update(EXTENSION_TYPES)
    config['serializers'].update(SERIALIZERS)

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.model.policy import Policy

class RTFDocument():
    """
    Help generate RTF document strings
    """
    size = {'h1':'44','h2':'32'}

    def prolog(self):
        return "{\\rtf1\\ansi\n"

    def heading(self, title, level='h1'):
        if not title:
	    return ''
	return "{\\pard \\fs"+self.size[level]+" "+title+"\\par}\\line\n"

    def end(self):
        return "}\n"


class Serialization(SerializationInterface):
    """
    Serialize entities and collections to and from
    textual representations. This is primarily used
    by the text Store.
    """

    def __init__(self, type):
        if hasattr(SerializationInterface, '__init__'):
            SerializationInterface.__init__(self, type)
	self.doc = RTFDocument()

    def list_recipes(self, recipes):
        """
        Return a linefeed separated list of recipe names.
        """
        return self.list_items('Recipes', recipes)

    def list_bags(self, bags):
        """
        Return a linefeed separated list of recipe names.
        """
        return self.list_items('Bags', bags)

    def list_tiddlers(self, bag):
        """
        List the tiddlers in a bag as text.
        """
        if bag.revbag:
	    list = "\\line\n".join(
                    ["%s:%s" % (tiddler.title, tiddler.revision)
                        for tiddler in bag.gen_tiddlers()])
        else:
            list = "\\line\n".join([
                tiddler.title for tiddler in bag.gen_tiddlers()])
	return self.doc.prolog() + list + self.doc.end()

    def list_items(self, name, items):
        return self.doc.prolog() + self.doc.heading(name,'h1') + "\\line\n".join([item.name for item in items]) + self.doc.end()

    def tiddler_as(self, tiddler):
        """
        Represent a tiddler as a text string: headers, blank line, text.
        """
        return self.doc.prolog() + self.doc.heading(tiddler.title) + self.html_to_rtf(tiddler.text) + self.doc.end()

    def html_to_rtf(self, text):
	if not text:
		return ''
	return text

