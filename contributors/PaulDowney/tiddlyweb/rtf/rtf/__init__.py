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
    size = {'h1':'44'}

    def prolog(self):
        return "{\\rtf1\\ansi\n"

    def h1(self, title):
	return "{\\pard \\fs"+self.size['h1']+" "+title+"\\par}\\line\n"

    def end(self):
        return "}\n"


class Serialization(SerializationInterface):
    """
    Serialize entities and collections to and from
    textual representations. This is primarily used
    by the text Store.
    """

    def list_recipes(self, recipes):
        """
        Return a linefeed separated list of recipe names.
        """
	doc = RTFDocument()
        return doc.prolog() + "\n".join([recipe.name for recipe in recipes]) + doc.end()

    def list_bags(self, bags):
        """
        Return a linefeed separated list of recipe names.
        """
	doc = RTFDocument()
        return doc.prolog() + doc.h1('Bags') + "\line\n".join([bag.name for bag in bags]) + doc.end()

    def list_tiddlers(self, bag):
        """
        List the tiddlers in a bag as text.
        """
	doc = RTFDocument()
        if bag.revbag:
	    list = " \line\n".join(
                    ["%s:%s" % (tiddler.title, tiddler.revision)
                        for tiddler in bag.gen_tiddlers()])
        else:
            list = " \line\n".join([
                tiddler.title for tiddler in bag.gen_tiddlers()])
	return doc.prolog() + list + doc.end()

    def tiddler_as(self, tiddler):
        """
        Represent a tiddler as a text string: headers, blank line, text.
        """
        if not tiddler.text:
            tiddler.text = ''
        return ('modifier: %s\ncreated: %s\nmodified: %s\ntype: '
                '%s\ntags: %s%s\n%s\n' %
                (tiddler.modifier, tiddler.created, tiddler.modified,
                    tiddler.type,
                    self.tags_as(tiddler.tags).replace('\n', '\\n'),
                    self.fields_as(tiddler), tiddler.text))

    def fields_as(self, tiddler):
        """
        Turn tiddler fields into strings in
        sort of a RFC 822 header form.
        """
        info = '\n'
        for key in tiddler.fields:
            if not key.startswith('server.'):
                value = unicode(tiddler.fields[key])
                info += '%s: %s\n' % (key, value.replace('\n', '\\n'))
        return info
