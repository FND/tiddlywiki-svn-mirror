"""
A StorageInterface implementation that subclasses
the text store to override the search method. To use
it, server_store in tiddlyweb.config needs to be (re)set
to:

	'server_store': ['plibsearch', {'store_root': 'store'}]

See atom_server.py for ways to adjust tiddlyweb.config on
	the fly.TextStore
"""

import os

from tiddlyweb.tiddler import Tiddler
from tiddlyweb.stores.text import Store as TextStore

def parseQuery(query):
	"""
	parse query string

	@param query: query string
	@type  query: str
	@return: query components
	@rtype : dict
	"""
	return { "text": query } # XXX: to do

class Store(TextStore):

	def search(self, query):
		"""
		search the store

		@param query: query string
		@type  query: str
		@return: matching tiddlers
		@rtype : list
		"""
		path = os.path.join(self._store_root(), "bags")
		bags = self._files_in_dir(path)
		# parse query string
		query = parseQuery(query)
		# retrieve matching tiddlers
		tiddlers = []
		for bag in bags:
			tiddlerDir = os.path.join(self._store_root(), "bags", bag, "tiddlers")
			tiddlerFiles = self._files_in_dir(tiddlerDir)
			for tiddlerName in tiddlerFiles:
				tiddler = Tiddler(title=tiddlerName, bag=bag)
				revisionID = self.list_tiddler_revisions(tiddler)[0]
				try:
					tiddlerFile = open(os.path.join(tiddlerDir, tiddlerName, str(revisionID)))
					for line in tiddlerFile:
						if query in line.lower():
							found_tiddlers.append(tiddler)
							break
				except OSError, e:
					raise NoTiddlerError, "unable to list revisions in tiddler: %s" % e
		return results
		# XXX -- N.B.:
		# returned Tiddler objects must have their 'bag' attribute set to the name of the
		# bag they were found in
		# see tiddlyweb.stores.text.search for a simple example

