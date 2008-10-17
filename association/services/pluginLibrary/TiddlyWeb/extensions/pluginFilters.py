"""
TiddlyWeb plugin for plugin-specific filters
"""

import re

from tiddlyweb.filter import FILTER_MAP, negate, remove

def init(config):
	global FILTER_MAP
	FILTER_MAP.update({
		'doc': filterByDocumentation,
		'!doc': negate(filterByDocumentation),
		'-doc': remove(filterByDocumentation),

		'code': filterByCode,
		'!code': negate(filterByCode),
		'-code': remove(filterByCode)
	})

def filterByDocumentation(query, tiddlers):
	"""
	Return tiddlers containing query phrase in the documentation section.

	This typically applies to plugin tiddlers.
	Documentation sections are wrapped in "/***" and "***/" markers.
	If those markers are missing, the documentation is assumed to be
	non-existing.

	@param query (str): search term
	@param tiddlers (list): tiddler objects to be searched
	@return (list): matching tiddlers
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
			pass
	return results

def filterByCode(query, tiddlers):
	"""
	Return tiddlers containing query phrase in the code section.

	This typically applies to plugin tiddlers.
	Code sections are wrapped in "//{{{" and "//}}}" markers.
	If those markers are missing, the entire tiddler contents are
	assumed to be code.

	@param query (str): search term
	@param tiddlers (list): tiddler objects to be searched
	@return (list): matching tiddlers
	"""
	query = query.lower() # case-insensitive
	pattern = re.compile(r"//{{{\s*?\n(.*?)\n\s*?//}}}", re.S)
	results = []
	for tiddler in tiddlers:
		try:
			doc = pattern.search(tiddler.text).groups()[0]
		except AttributeError: # missing explicit code-section markers
			doc = tiddler.text
		if query in doc.lower():
			results.append(tiddler)
	return results
