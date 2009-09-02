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

import html5lib
from html5lib import treebuilders, treewalkers, serializer
from html5lib.filters import sanitizer

class RTFDocument:
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

    def from_html(self, text):
        """
        Convert HTML to RTF string.
        """
        if not text:
                return ''

        p = html5lib.HTMLParser(tree=treebuilders.getTreeBuilder("dom"))
        dom_tree = p.parse(text)
        walker = treewalkers.getTreeWalker("dom")
        stream = walker(dom_tree)
        s = serializer.htmlserializer.HTMLSerializer(omit_optional_tags=False)
        output_generator = s.serialize(stream)
        rtf = ""
        for item in output_generator:
                rtf = rtf + "\n\\line : " + item
        
        return rtf


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
        title = "Tiddlers in Bag " + bag.name
        return self.doc.prolog() + self.doc.heading(title,'h1') + "".join(
                    ["{\\listtext \\'95} %s%s\\\n" % (item.title, ('',' Revision:'+"%d"%(item.revision))[bag.revbag]) 
                        for item in bag.gen_tiddlers()]
                ) + self.doc.end()

    def list_items(self, title, items):
        return self.doc.prolog() + self.doc.heading(title,'h1') + "".join(
                    ["{\\listtext \\'95} %s\\\n" % (item.name) for item in items]
                ) + self.doc.end()

    def tiddler_as(self, tiddler):
        """
        Represent a tiddler as a text string: headers, blank line, text.
        """
        return self.doc.prolog() + self.doc.heading(tiddler.title) + self.doc.from_html(tiddler.text) + self.doc.end()
