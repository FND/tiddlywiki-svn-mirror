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

	def __repr__(self): # XXX: use __str__?
		"""
		represent a tiddler as text string

		format: headers, blank line, contents
		"""
		text = self.text or ""
		headers = []
		for field in self.__class__.standard_fields: # XXX: unnecessarily complex reference!? -- use of standard_fields obsolete due to special handling of individual fields?
			if field == "tags":
				headers.append("%s: %s" %
					(field, generate_bracketed_list(self.tags)))
			elif field in ("created", "modified"):
				try:
					timestamp = generate_tiddler_timestamp(getattr(self, field))
				except AttributeError: # not a date object
					timestamp = ""
				headers.append("%s: %s" % (field, timestamp))
			elif field != "text":
				value = getattr(self, field) or ""
				headers.append("%s: %s" % (field, value))
		for k, v in getattr(self, "fields", {}).items():
			headers.append("%s: %s" % (k, v))
		return "%s\n\n%s" % ("\n".join(headers), text)

	def get_slices(self): # TODO: optional parameters for text and name?
		"""
		retrieve all slices from tiddler contents

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


def generate_bracketed_list(items): # TODO: rename?
	"""
	return the bracketed-list serialization of a list of items

	a bracketed list is a space-separated list of items; individual items
	containing a space are enclosed in double brackets
	"""
	_list = []
	for item in items:
		if " " in item:
			item = "[[%s]]" % item
		_list.append(item)
	return " ".join(_list)


def generate_tiddler_timestamp(t): # TODO: rename?
	"""
	return the tiddler-timstamp serialization of a date

	timestamp format: YYYYMMDDhhmm
	"""
	return t.strftime("%Y%m%d%H%M")
