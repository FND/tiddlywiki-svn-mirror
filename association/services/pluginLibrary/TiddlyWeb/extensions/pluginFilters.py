"""
TiddlyWeb plugin for plugin-specific filters
"""

import re

from tiddlyweb.filter import FILTER_MAP, negate, remove

def init(config):
	global FILTER_MAP
	FILTER_MAP.update({
		'doc': by_documentation,
		'!doc': negate(by_documentation),
		'-doc': remove(by_documentation),

		'code': by_code,
		'!code': negate(by_code),
		'-code': remove(by_code)
	})

def by_documentation(query, tiddlers):
	"""
	Return tiddlers containing query phrase in the documentation section.

	This typically applies to plugin tiddlers.
	Documentation sections are wrapped in "/***" and "***/" markers.
	"""
	query = query.lower() # case-insensitive
	pattern = re.compile(r"/\*\*\*\s*?\n(.*?)\n\s*?\*\*\*/", re.S)
	results = []
	for tiddler in tiddlers:
		try:
			doc = pattern.search(tiddler.text).groups()[0]
			if query in doc.lower():
				results.append(tiddler)
		except AttributeError: # missing documentation section
			doc = ""
	return results

def by_code(query, tiddlers):
	"""
	Return tiddlers containing query phrase in the code section.

	This typically applies to plugin tiddlers.
	Code sections are wrapped in "//{{{" and "//}}}" markers.
	If those markers are missing, the entire tiddler contents are
	assumed to be code.
	"""
	query = query.lower() # case-insensitive
	pattern = re.compile(r"//{{{\s*?\n(.*?)\n\s*?//}}}", re.S)
	results = []
	for tiddler in tiddlers:
		try:
			doc = pattern.search(tiddler.text).groups()[0]
			if query in doc.lower():
				results.append(tiddler)
		except AttributeError: # missing explicit code-section markers
			doc = tiddler.text
	return results
