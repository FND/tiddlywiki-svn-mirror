"""
Pure-store format serializer.
"""

from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.serializations.wiki import Serialization as WikiSerialization
from tiddlyweb.serializations.wiki import splitter

empty_html = "lib/pureStore.html"

class Serialization(WikiSerialization):
	def _split_empty_html(self):
		f = open(empty_html)
		store = f.read()
		f.close()
		store = unicode(wiki, "utf-8")
		return store.split(splitter)

