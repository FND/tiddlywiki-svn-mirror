"""
TBD
"""

from tiddlyweb.serializations.text import Serialization as Text

class Serialization(Text):
	"""
	TBD
	"""
	def tiddler_as(self, tiddler):
		"""
		TBD
		"""
		if not tiddler.text:
			tiddler.text = ""
		return tiddler.text
