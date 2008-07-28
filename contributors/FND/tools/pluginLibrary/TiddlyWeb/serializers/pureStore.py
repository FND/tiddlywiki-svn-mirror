"""
Pure-store format serializer.
"""

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.serializations.wiki import Serialization as WikiSerialization

empty_html = "lib/pureStore.html"

class Serialization(WikiSerialization):
	def _split_empty_html(self):
		f = open(empty_html)
		wiki = f.read()
		f.close()
		wiki = unicode(wiki, "utf-8")
		return wiki.split(splitter)

