"""
TODO:
* module description
* tests
* support for tiddler sections
"""


import re

from datetime import datetime


class Tiddler(object):
	"""
	content unit
	""" # TODO

	standard_fields = [
		"title",
		"text",
		"created",
		"modified",
		"modifier",
		"tags"
	]

	_slices_pattern = r"(?:^([\'\/]{0,2})~?([\.\w]+)\:\1[\t\x20]*([^\n]+)[\t\x20]*$)|(?:^\|([\'\/]{0,2})~?([\.\w]+)\:?\4\|[\t\x20]*([^\n]+)[\t\x20]*\|$)" # tweaked version of TiddlyWiki core RegEx -- TODO: update to latest version
	_slices_pattern = re.compile(_slices_pattern, re.M + re.I)

	def __init__(self, title):
		"""
		initialize defaults

		@param title: tiddler name
		"""
		self.title = title
		self.text = None
		self.created = datetime.utcnow()
		self.modified = None
		self.modifier = None
		self.tags = []
		self.fields = {}

	def __repr__(self):
		"""
		use tiddler name in string representation
		"""
		return "%s %s" % (self.title, object.__repr__(self))

	def get_slices(self): # TODO: optional parameters for text and name?
		"""
		retrieve all slices from tiddler

		@return: slices dictionary
		"""
		slices = {}
		try:
			matches = _slices_pattern.findall(self.text)
		except TypeError: # empty tiddler
			return slices
		for match in matches:
			if match[1]: # colon notation
				slices[match[1]] = match[2]
			else: # table notation
				slices[match[4]] = match[5]
		return slices
