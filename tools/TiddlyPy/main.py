"""
library translating between TiddlyWiki documents and Tiddler objects
"""


import html5lib


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


def _get_tiddler_text(tiddler):
	"""
	retrieve contents from tiddler element

	supports both legacy (pre-v2.2) and modern store formats

	Legacy format stores contents in encoded form while modern
	format uses a PRE element.
	In addition, legacy format uses a "tiddler" instead of the
	"title" attribute to store tiddler names.

	N.B.:
	While the new canonical store format was introduced in
	TiddlyWiki v2.2 final, various v2.2 beta releases are still
	using the legacy store format.
	However, this function determines the correct format based on
	the element structure.

	@param tiddler: element node
	@return: content string
	"""
	try: # modern store format
		return tiddler.find("pre").contents[0] # XXX: use .string!?
	except AttributeError: # legacy store format
		return _decodeLegacyText(tiddler.contents[0]) # XXX: use .string!?


def _decodeLegacyText(text):
	"""
	decode tiddler text from legacy store format

	@param text (str): encoded contents
	@return (str): decoded contents
	"""
	return text.replace(r"\n", "\n").replace(r"\b", " "). \
		replace(r"\s", "\\").replace("\r", "")
