"""
A WikklyStore where items are stored in an SQLite database.

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
from boodebr.sql.dbtypes import obj_to_dbval
from boodebr.sql.fpmsql import fpmsql
import boodebr.sql.sqlite_util as sqlutil
import os

MAIN_TABLE_NAME = 'WikklyItems'

def detect(pathname):
	"""
	Detect if the given pathname is an SQLite database containing 
	wikkly content.	(Pathname may be a directory or file.)
	
	Returns an wikStore_sqlite instance to handle content if found, 
	or None if not.
	"""
	if not os.path.isfile(pathname):
		return None
		
	try:
		sql = fpmsql(filename, 'pysqlite', obj_to_dbval)
	except:
		return None
		
	if MAIN_TABLE_NAME in sqlutil.get_tables(sql):
		del sql
		return wikStore_sqlite(pathname)
	else:
		return None
		
class wikStore_sqlite(object):
	def __init__(self, filename):
		self.sql = fpmsql(os.path.abspath(filename), 'pysqlite', obj_to_dbval)
		if MAIN_TABLE_NAME not in sqlutil.get_tables(self.sql):
			self.init_main_table()
			
	def info(self):
		"Return a one-line description of this instance."
		return 'WikklyText, SQLite database %s' % self.sql.get_filename()

	def getpath(self):
		"""
		Get the base directory for the store. This is used
		to resolve relative paths given by the wikitext for <<include>>, etc.
		"""
		return os.path.split(self.sql.get_filename())[0]
	
	def names(self):
		nlist = [] 
		for row in self.sql.query('select name from %s' % MAIN_TABLE_NAME):
			nlist.append(row[0])
			
		return nlist
		
	def getitem(self, name):
		from wikStore import tags_split, WikklyItem, WikklyDateTime
		
		qs = 'select * from %s where name=?' % MAIN_TABLE_NAME
		obj = self.sql.query(qs, (name,)).getobj()
		if obj is None:
			return None
			
		item = WikklyItem(obj.name, obj.content, tags_split(obj.tags),
					obj.author, WikklyDateTime(from_store=obj.ctime), 
					WikklyDateTime(from_store=obj.mtime),
					obj.content_type, obj.revision)
					
		return item
		
	def getall(self):
		"""
		Load all content from store.
		
		Returns list of WikklyItems.
		"""
		# optimize here instead of just calling getitem() ...
		from wikStore import tags_split, WikklyItem, WikklyDateTime

		items = []		
		qs = 'select * from %s' % MAIN_TABLE_NAME
		for obj in self.sql.query(qs).obj():
			
			item = WikklyItem(obj.name, obj.content, tags_split(obj.tags),
						obj.author, WikklyDateTime(from_store=obj.ctime), 
						WikklyDateTime(from_store=obj.mtime),
						obj.content_type, obj.revision)						
			items.append(item)
			
		return items

	def saveitem(self, item, oldname=None):
		from wikStore import tags_join
		
		# sanity
		if oldname == item.name:
			oldname = None

		if oldname != None:
			self.sql.run('delete from %s where name=?' % MAIN_TABLE_NAME, (oldname,))
			
		# name is UNIQUE so 'insert or replace' is all that's needed to add or replace
		qs = 'insert or replace into %s ' % MAIN_TABLE_NAME
		qs += '(name,author,ctime,mtime,tags,content,content_type,revision) '
		qs += 'values(?,?,?,?,?,?,?,?)'
		
		# remove any \r chars that snuck in
		content = item.content.replace(u'\r', u'')
		
		self.sql.run(qs, (item.name.encode('utf-8'), item.author.encode('utf-8'),
					item.ctime.to_store(), item.mtime.to_store(),
					tags_join(item.tags).encode('utf-8'), content.encode('utf-8'),
					item.content_type.encode('utf-8'), item.revision))
		
	def delete(self, item):
		"""
		Delete the given WikklyItem from the store.
		"""
		self.sql.run('delete from %s where name=?' % MAIN_TABLE_NAME, (item.name,))
	
	def search(self, query):
		"""
		Return a list of items matching query.
		
		'query' is one of the WikklyQuery* objects defined 
		in wikklytext.store.query.
		"""
		from wikklytext.store.wikQuery import generic_query_store
		return generic_query_store(self, query)

	# -*- Internal API -*-
	def init_main_table(self):
		qs = 'create table %s (' % MAIN_TABLE_NAME
		qs += 'name text UNIQUE,'
		qs += 'author text,'
		qs += 'mtime text,'
		qs += 'ctime text,'
		qs += 'tags text,'
		qs += 'content text,'
		qs += 'content_type text,'
		qs += 'revision text )'
		
		self.sql.run(qs)


if __name__ == '__main__':
	wf = wikStore_sqlite('test.db')
	
