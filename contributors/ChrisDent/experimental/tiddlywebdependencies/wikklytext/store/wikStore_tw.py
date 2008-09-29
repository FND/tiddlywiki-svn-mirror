"""
wikStore_tw.py: A caching layer over wikStore_tw_re. This allows a clean design without
cluttering the worker code.

Why not a generic caching layer over wikStore?: The ability to cache and the
caching method will be dependent on the storage format, so cannot do 'one size fits all'
with a layer over wikStore.

Copyright (C) 2007,2008 Frank McIngvale

Contact: fmcingvale@boodebr.org

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
"""
from wikStore_tw_re import wikStore_tw_re
import os
	
def mtime(filename):
	from stat import ST_MTIME
	return os.stat(filename)[ST_MTIME]
	
class wikStore_tw(object):
	def __init__(self, filename, version="2.4"):
		self.filename = os.path.abspath(filename)
		self.store = wikStore_tw_re(filename, version)
		self.cached_items = None
		self.cached_mtime = 0

	def info(self):
		"Return a one-line description of this instance."
		return 'WikklyText, as TiddlyWiki in %s' % self.filename

	def getpath(self):
		"""
		Get the base directory for the store. This is used
		to resolve relative paths given by the wikitext for <<include>>, etc.
		"""
		return self.store.getpath()
			
	def names(self):
		# loses efficiency, but worth it for clean design ...
		self.ensure_cache()
		return self.cached_items.keys()
		
	def getitem(self, name):
		self.ensure_cache()
		return self.cached_items.get(name, None)
		
	def getall(self):
		self.ensure_cache()
		return self.cached_items.values()
		
	def saveitem(self, item, oldname=None):
		self.ensure_cache()
		if oldname is not None and self.cached_items.has_key(oldname):
			del self.cached_items[oldname]
			
		# remove any \r chars that snuck in (this is done here instead of
		# at the physical storage layer so that the cache will remain
		# up to date)
		item.content = item.content.replace(u'\r', u'')
		
		self.cached_items[item.name] = item
		self.store.saveitem(item, oldname)
		self.cached_mtime = mtime(self.filename)
	
	def delete(self, item):
		self.ensure_cache()
	
		del self.cached_items[item.name]
		self.store.delete(item)
		self.cached_mtime = mtime(self.filename)	
		
	def search(self, query):
		return self.store.search(query)

	# -- Internal API --
	def ensure_cache(self):
		"Fill cache if empty or refill if underlying file changed."
		if self.cached_items is None or mtime(self.filename) > self.cached_mtime:
			self.cached_items = {}
			for item in self.store.getall():
				self.cached_items[item.name] = item
				
			self.cached_mtime = mtime(self.filename)
			
