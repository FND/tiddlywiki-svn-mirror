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
* convert store format before parsing
* investigate commonalities with TiddlyWeb (cf. ticket #995)
* make __init__.py provide API
* full CRUD functionality
"""

import html5lib

from datetime import datetime

from tiddler import Tiddler


def get_tiddlers(document): # TODO: move into TiddlyWiki class
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


def convert_tiddler_timestamp(t): # TODO: rename? move into TiddlyWiki class? -- XXX: private?
	"""
	convert tiddler timestamp to datetime object

	@param t: tiddler timestamp (YYYYMMDDhhmm format)
	@return: datetime object
	"""
	return datetime(int(t[0:4]), int(t[4:6]), int(t[6:8]),
		int(t[8:10]), int(t[10:12])) # TODO: use strptime?


def generate_tiddler_timestamp(t): # TODO: rename? move into TiddlyWiki class? -- XXX: private?
	"""
	convert datetime object to tiddler timestamp

	@param t: datetime object
	@return: tiddler timestamp (YYYYMMDDhhmm format)
	"""
	return t.strftime("%Y%m%d%H%M")


def read_bracketed_list(string): # TODO: move into TiddlyWiki class? -- XXX: private?
	"""
	retrieve items from bracketed list

	@param string: bracketed list
	@return: list of items
	"""
	return string.split(" ") # TODO: proper implementation


def _get_tiddler_elements(document): # TODO: move into TiddlyWiki class
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


def _generate_tiddler(node): # TODO: move into TiddlyWiki class
	"""
	generate Tiddler instance from element node

	@param tiddler: element node
	@return: Tiddler instance
	"""
	tiddler = Tiddler(_get_title(node))
	for attr, value in node.attrs:
		if attr in Tiddler.standard_fields:
			if attr == "created" or attr == "modified":
				value = convert_tiddler_timestamp(value)
			elif attr == "tags":
				value = read_bracketed_list(value)
			setattr(tiddler, attr, value)
		else: # extended field
			if not attr == "tiddler" or "title" in node.attrMap: # non-legacy attribute
				tiddler.fields[attr] = value
	tiddler.text = _get_text(node)
	return tiddler


def _get_title(tiddler): # TODO: move into TiddlyWiki class
	"""
	retrieve tiddler name from tiddler element

	@param tiddler: element node
	@return: tiddler name
	"""
	try: # legacy format
		return tiddler["tiddler"] # XXX: might happen to be an extended field!?
	except KeyError: # modern format
		return tiddler["title"]


def _get_text(tiddler): # TODO: move into TiddlyWiki class
	"""
	retrieve contents from tiddler element

	@param tiddler: element node
	@return: content string
	"""
	try: # modern format
		return tiddler.find("pre").contents[0] # XXX: use .string!?
	except AttributeError: # legacy format
		return _decode_legacy_text(tiddler.contents[0]) # XXX: use .string!?
	except IndexError: # empty tiddler
		return None


def _decode_legacy_text(text): # TODO: move into TiddlyWiki class
	"""
	decode tiddler text from legacy store format

	@param text: encoded content string
	@return: decoded contents
	"""
	return text.replace(r"\n", "\n").replace(r"\b", " "). \
		replace(r"\s", "\\").replace("\r", "")


def create_tiddler_element(tiddler):
	"""
	create tiddler element from Tiddler instance

	@param tiddler: Tiddler instance
	@return: markup string
	"""
	template = """\
	<div title="%s" created="%s" modified="%s" modifier="%s" tags="%s"%s>
		<pre>%s</pre>
	</div>
	""" # TODO: generate element node instead of string stitching
	title = tiddler.title
	created = generate_tiddler_timestamp(tiddler.created) # XXX: should be entirely optional!?
	try:
		modified = generate_tiddler_timestamp(tiddler.modified) # XXX: should be entirely optional
	except AttributeError:
		modified = ""
	modifier = tiddler.modifier or "" # XXX: should be entirely optional!?
	tags = " ".join(tiddler.tags) # TODO: generate bracketed list -- XXX: should be entirely optional!?
	fields = ['%s="%s"' % (k, v) for k, v in tiddler.fields.items()]
	fields = " ".join(fields) if fields else ""
	text = tiddler.text or ""
	# TODO: escape double quotes!?
	return template % (title, created, modified, modifier, tags, fields, text)
