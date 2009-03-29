"""
library translating between TiddlyWiki documents and Tiddler instances


+------------------+     +-----------------------+     +---------------------+
| TiddlyWiki       |     | tiddler element       |     | Tiddler             |
+------------------+     +-----------------------+     +---------------------+
| store area       |     | title (str)           |     | title (str)         |
|  +------------+  |     | text (str)            |     | text (str)          |
|  | tiddler    |  | <=> | created (timestamp)   | <=> | created (datetime)  |
|  | element    |  |     | modified (timestamp)  |     | modified (datetime) |
|  |            |  |     | modifier (str)        |     | modifier (str)      |
|  +------------+  |     | tags (bracketed list) |     | tags (list; str)    |
|  +------------+  |     | <custom> (str)        |     | fields (dict; str)  |
|  | tiddler    |  |     +-----------------------+     | <custom> (*)        |
+------------------+                                   +---------------------+

* timestamp: date string; YYYYMMDDHHMM format
* bracketed list: space-separated list; individual items optionally enclosed
  in double brackets


TODO:
* TiddlyWiki class
* convert tiddler timestamps
* convert store format before parsing
* investigate commonalities with TiddlyWeb (cf. ticket #995)
* extend Tiddler class (e.g. defaults, timestamp validation)
* split into separate modules
* make __init__.py provide API
* full CRUD API
* support for sections
"""


import re

import html5lib

from datetime import datetime


def get_tiddlers(document): # XXX: move into TiddlyWiki class
	"""
	retrieve tiddlers from TiddlyWiki document

	supports both legacy (pre-v2.2) and modern store formats

	Legacy format stores contents in encoded form while modern
	format uses a PRE element.
	In addition, legacy format uses a "tiddler" instead of the
	"title" attribute to store tiddler names.

	N.B.:
	While the new canonical store format was introduced in
	TiddlyWiki v2.2 final, various v2.2 beta releases are still
	using the legacy store format.
	However, this module determines the correct format based on
	the element structure.

	@param document: TiddlyWiki document (string or file-like object)
	@return: Tiddler instances
	"""
	return [_generate_tiddler(node) for node in _get_tiddler_elements(document)]


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

	def get_slices(self): # TODO: optional parameters for text and name?
		"""
		retrieve all slices from tiddler

		@return: slices dictionary
		"""
		slices = {}
		try:
			matches = self.__class__._slices_pattern.findall(self.text) # XXX: don't use __class__?
		except TypeError: # empty tiddler
			return slices
		for match in matches:
			if match[1]: # colon notation
				slices[match[1]] = match[2]
			else: # table notation
				slices[match[4]] = match[5]
		return slices

	def __repr__(self): # XXX: move below __init__?
		"""
		use tiddler name in string representation
		"""
		return self.title + object.__repr__(self) # XXX: insert separator?


def readBracketedList(string): # XXX: move into TiddlyWiki class?
	return string.split(" ") # TODO: proper implementation


def _get_tiddler_elements(document): # XXX: move into TiddlyWiki class
	"""
	retrieve tiddler elements from TiddlyWiki document

	@param document: TiddlyWiki document (string or file-like object)
	@return: element nodes
	"""
	tree = html5lib.treebuilders.getTreeBuilder("beautifulsoup") # TODO: avoid dependency
	parser = html5lib.HTMLParser(tree=tree)
	doc = parser.parse(document)
	store = doc.find("div", id="storeArea")
	return store.findChildren("div")


def _generate_tiddler(node): # XXX: move into TiddlyWiki class
	"""
	generate Tiddler instance from element node

	@param tiddler: element node
	@return: Tiddler instance
	"""
	tiddler = Tiddler(_get_title(node))
	for attr, value in node.attrs:
		if attr in Tiddler.standard_fields:
			if attr == "tags":
				value = readBracketedList(value)
			setattr(tiddler, attr, value)
		else: # extended field
			if not attr == "tiddler" or "title" in node.attrMap: # non-legacy attribute
				tiddler.fields[attr] = value
	tiddler.text = _get_text(node)
	return tiddler


def _get_title(tiddler): # XXX: move into TiddlyWiki class
	"""
	retrieve tiddler name from tiddler element

	@param tiddler: element node
	@return: tiddler name
	"""
	try: # legacy format
		return tiddler["tiddler"] # XXX: might happen to be an extended field!?
	except KeyError: # modern format
		return tiddler["title"]


def _get_text(tiddler): # XXX: move into TiddlyWiki class
	"""
	retrieve contents from tiddler element

	@param tiddler: element node
	@return: content string
	"""
	try: # modern format
		return tiddler.find("pre").contents[0] # XXX: use .string!?
	except AttributeError: # legacy format
		return _decodeLegacyText(tiddler.contents[0]) # XXX: use .string!?
	except IndexError: # empty tiddler
		return None


def _decodeLegacyText(text): # XXX: move into TiddlyWiki class
	"""
	decode tiddler text from legacy store format

	@param text (str): encoded contents
	@return (str): decoded contents
	"""
	return text.replace(r"\n", "\n").replace(r"\b", " "). \
		replace(r"\s", "\\").replace("\r", "")
