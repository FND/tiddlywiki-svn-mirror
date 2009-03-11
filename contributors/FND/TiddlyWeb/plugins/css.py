"""
serializer for serving tiddler contents as CSS
"""

from tiddlyweb.serializations.text import Serialization as Text

def init(config):
	# automatically extend configuration
	config["extension_types"].update({ "css": "text/css" })
	config["serializers"].update({ "text/css": [__name__, "text/css; charset=UTF-8"] })

class Serialization(Text):
	def tiddler_as(self, tiddler):
		if not tiddler.text:
			tiddler.text = ""
		return tiddler.text
