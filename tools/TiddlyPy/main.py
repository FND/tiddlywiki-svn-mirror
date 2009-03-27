"""
library translating between TiddlyWiki documents and Tiddler instances

TODO:
* retrieve all tiddler attributes
* TiddlyWiki class
* convert store format before parsing
* support for slices/sections
* investigate commonalities with TiddlyWeb (cf. ticket #995)
* extend Tiddler class (e.g. defaults, timestamp validation)
* full CRUD API
"""


import html5lib

from datetime import datetime


def get_tiddlers(document):
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
	"""
	# TODO
	# * documentation
	# * convert timestamps
	# * convert tags

	standard_fields = [ # XXX: rename? CamelCase?
		"title",
		"text",
		"created",
		"modified",
		"modifier",
		"tags"
	]

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


def readBracketedList(string):
	return string.split(" ") # TODO: proper implementation


def _get_tiddler_elements(document):
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


def _generate_tiddler(node):
	"""
	generate Tiddler instance from element node

	@param tiddler: element node
	@return: Tiddler instance
	"""
	tiddler = Tiddler(_get_title(node))
	for attr, value in node.attrs:
		if attr in Tiddler.standard_fields:
			if attr == "tags": # XXX: move into Tiddler class!?
				value = readBracketedList(value)
			tiddler.__setattr__(attr, value) # XXX: avoid __setattr__?
		else: # extended field (excluding legacy format's tiddler attribute)
			if not attr == "tiddler" or "title" in node.attrMap:
				tiddler.fields[attr] = value
	tiddler.text = _get_text(node)
	return tiddler


def _get_title(tiddler):
	"""
	retrieve tiddler name from tiddler element

	@param tiddler: element node
	@return: tiddler name
	"""
	try: # legacy format
		return tiddler["tiddler"] # XXX: might happen to be an extended field!?
	except KeyError: # modern format
		return tiddler["title"]


def _get_text(tiddler):
	"""
	retrieve contents from tiddler element

	@param tiddler: element node
	@return: content string
	"""
	try: # modern format
		return tiddler.find("pre").contents[0] # XXX: use .string!?
	except AttributeError: # legacy format
		return _decodeLegacyText(tiddler.contents[0]) # XXX: use .string!?


def _decodeLegacyText(text):
	"""
	decode tiddler text from legacy store format

	@param text (str): encoded contents
	@return (str): decoded contents
	"""
	return text.replace(r"\n", "\n").replace(r"\b", " "). \
		replace(r"\s", "\\").replace("\r", "")
