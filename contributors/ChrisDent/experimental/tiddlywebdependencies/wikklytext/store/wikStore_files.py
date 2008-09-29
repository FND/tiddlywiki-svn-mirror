"""
A WikklyStore where items are stored in a flat set of files in a directory.

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

import os, re, sys
from stat import *
from wikStore import WikklyItem, tags_join, WikklyDateTime
from wikklytext.util import xml_escape, xmlhead, loadxml
from wikklytext import xmltrace

STORE_HEADER_TAG = 'WikklyContentHeader'

def uni(val):
	"""
	Ensure val is unicode, calling unicode(val) if not.
	
	This is used for .text values from ElementTree -- it will
	use a bytestring if .text is ASCII, unicode otherwise.
	"""
	if isinstance(val, unicode):
		return val
	
	return unicode(val)
	
def detect(pathname):
	"""
	Detect all wikkly content in the given pathname.
	(Pathname may be a directory or file.)
	
	Returns a wikStore_files instance to handle, content if found, 
	or None if not.
	"""
	if not os.path.isdir(pathname):
		return None # must be a directory
		
	w = wikStore_files(pathname)
	if len(w.names()):
		return w
	else:
		return None
		
class wikStore_files(object):
	def __init__(self, path):
		self.path = os.path.abspath(path)
	
	def info(self):
		"Return a one-line description of this instance."
		return 'WikklyText, flat .txt files in %s' % self.path

	def getpath(self):
		"""
		Get the base directory for the store. This is used
		to resolve relative paths given by the wikitext for <<include>>, etc.
		"""
		return self.path
		
	def names(self):
		"""
		Return names of all content items in store as a list of strings.
		"""
		return list(self.namemap().keys())
		
	def getitem(self, name, use_namemap=None):
		"""
		Load a single content item from the store.
		
		Returns WikklyItem, or None if item not found.
		
		use_namemap: For internal use only
		
		NOTE: If you are looping over all items, it is significantly
		faster to use getall() instead of getitem().
		"""
		# Could have <Name>AAA</Name> stored in a file 'BBB.txt'.
		# Have to get complete mapping to know which file to open.
		# Unfortunately this is a big slowdown here vs. other store types.
		# (Allow caller to provide namemap to avoid reloading if possible.)
		namemap = use_namemap or self.namemap()
		full = namemap.get(name, None)
		if full is None or not os.path.isfile(full):
			return None					

		return self.load_wikklyitem(full)
		
	def getall(self):
		"""
		Load all content from store.
		
		Returns list of WikklyItems.
		"""
		# load namemap once and reuse in calls to getitem()
		namemap = self.namemap()		
		return [self.getitem(name, namemap) for name in namemap.keys()]

	def saveitem(self, item, oldname=None):
		"""
		Save a WikklyItem to the store.
		
		If oldname != None, passed item replaces the item of the given name.
		Notes:
			* Passing oldname=None is the way to store a new item, or
			  overwrite an existing item.
			* Passing oldname=item.name is the same as passing oldname=None
		"""
		# sanity
		if oldname == item.name:
			oldname = None
			
		# save object info in header comment
		h =  u'/%' + u'-'*70 + '\n'
		h += u'<!-- Be careful when editing this header - see comments! -->\n'
		h += u'<%s>\n' % STORE_HEADER_TAG
		h += u' <Name>%s</Name>\n' % xml_escape(item.name)
		h += u' <Author>%s</Author>\n' % xml_escape(item.author)
		h += u' <Created>%s</Created>\n' % item.ctime.to_store()
		h += u' <!-- Delete next tag to use file mtime instead -->\n'
		h += u' <Modified>%s</Modified>\n' % item.mtime.to_store()
		h += u' <!-- Example: <Tags>One Two [[Three Four]] Five</Tags> -->\n'
		h += u' <Tags>%s</Tags>\n' % xml_escape(tags_join(item.tags))
		h += u' <!-- Valid types: WikklyText, TiddlyWiki -->\n'
		h += u' <ContentType>%s</ContentType>\n' % xml_escape(item.content_type)
		h += u' <Revision>%s</Revision>\n' % xml_escape(item.revision or u'')
		h += u'</%s>\n' % STORE_HEADER_TAG
		h += u'-'*70 + '%/\n'
		
		# remove any \r chars that snuck in
		content = h + item.content.replace(u'\r', u'')
		
		# ensure path exists
		if not os.path.isdir(self.path):
			os.makedirs(self.path)
			
		# save new file, with content encoded as UTF-8 (use UTF-8-SIG for autodetection)
		# (hardcode UTF-8 signature since UTF-8-SIG is missing from earlier Pythons)
		open(self.stored_name(item.name), 'wb').write('\xef\xbb\xbf'+content.encode('utf-8'))
		
		# delete old file, if renamed
		if oldname is not None and oldname != item.name:
			if os.path.isfile(self.stored_name(oldname)):
				os.unlink(self.stored_name(oldname))

	def delete(self, item):
		"""
		Delete the given WikklyItem from the store.
		"""
		if os.path.isfile(self.stored_name(item.name)):
			os.unlink(self.stored_name(item.name))

	def search(self, query):
		"""
		Return a list of items matching query.
		
		'query' is one of the WikklyQuery* objects defined 
		in wikklytext.store.query.
		"""
		from wikklytext.store.wikQuery import generic_query_store
		return generic_query_store(self, query)
		
	# -- INTERNAL API --
	def namemap(self):
		"""
		Return a mapping of:
			ItemName -> filename (full path)
		"""
		namemap = {}
		
		# find all .txt files
		for name in os.listdir(self.path):
			n,ext = os.path.splitext(name)
			if ext != '.txt':
				continue

			item = self.load_wikklyitem(os.path.join(self.path,name))
			namemap[item.name] = os.path.join(self.path,name)
			
		return namemap
	
	def stored_name(self, name, noext=False):
		"""
		Given an item name, return the name it will
		be stored under (i.e. the full path filename in this case).
		"""
		from wikStore import makeFSname
		
		name = makeFSname(name) 
		if not noext:
			name += '.txt'
			
		return os.path.join(self.path, name)
		
	def guess_metainfo(self, filename):
		"""
		Create XML metainfo for files that are missing it by making
		a best guess. (Returns as XML so it can be added to the file
		if desired.)
		"""
		xml = xmlhead()
		xml += u'<%s>\n' % STORE_HEADER_TAG
		
		path,name = os.path.split(filename)
		base,ext = os.path.splitext(name)
		
		xml += u' <Name>%s</Name>\n' % xml_escape(base)		
		xml += u' <Author></Author>\n'
		ctime = WikklyDateTime()
		ctime.from_file_ctime(filename)
		xml += u' <Created>%s</Created>\n' % ctime.to_store()
		mtime = WikklyDateTime()
		mtime.from_file_mtime(filename)
		xml += u' <Modified>%s</Modified>\n' % mtime.to_store()
		xml += u' <Tags></Tags>\n'
		xml += u' <ContentType>%s</ContentType>\n' % xml_escape('WikklyText')
		xml += u' <Revision></Revision>\n'
		xml += u'</%s>\n' % STORE_HEADER_TAG
		
		return xml
		
	def nodetext(self, root, tag, defaults):
		node = root.find(tag)
		if node is None:
			node = defaults.find(tag)
			
		return node.text
		
	def xml_to_wikklyitem(self, filename, xml):
		"""
		filename: File being loaded.
		XML: XML header from file.
		
		Returns WikklyItem with empty .content
		"""
		from wikStore import tags_split
		
		# guess at metainfo to use as defaults for
		# any missing fields
		defaults = loadxml(self.guess_metainfo(filename))
		root = loadxml(xml)
		
		name = uni(self.nodetext(root, 'Name', defaults))
		#author = uni((root.find('Author') or defaults.find('Author')).text)
		author = uni(self.nodetext(root, 'Author', defaults))
	
		ctime = WikklyDateTime(from_store=self.nodetext(root, 'Created', defaults))
		mtime = WikklyDateTime(from_store=self.nodetext(root, 'Modified', defaults))
	
		tagtxt = uni(self.nodetext(root, 'Tags', defaults) or u'')
		tags = tags_split(tagtxt)
			
		ctype = uni(self.nodetext(root, 'ContentType', defaults))
		revision = self.nodetext(root, 'Revision', defaults)
		
		return WikklyItem(name, u'', tags, author, ctime, mtime, ctype, revision)
		
	def load_wikklyitem(self, filename):
		"""
		Load WikklyText item from the given file.
		
		filename is full path.
		
		Returns: WikklyItem
			(ader, content)
			
			xmlheader = XML from header, ready for parsing (strips comment portion).
			content = Item content.
			
			Both returned as unicode.
			
		Returns (None,None) if filename not a wikkly file.
		"""
		buf = open(filename, 'rb').read()
		buf = unicode(buf,'utf-8','replace') # convert to unicode BEFORE matching

		# remove any stray UTF-8 markers (might have been caused by hand-editing the
		# file and messing up the original marker)
		buf = buf.replace(u'\ufeff',u'').replace(u'\ufffe',u'')
		# remove any \r chars that snuck in
		buf = buf.replace(u'\r',u'')
		
		# try to find an XML header
		m = re.match(r'.+?(<%s>.+?</%s>)\n.+?%%/\n(.*)' % (STORE_HEADER_TAG,STORE_HEADER_TAG), 
						buf, re.M|re.S)
		if m:
			item = self.xml_to_wikklyitem(filename, xmlhead()+m.group(1))
			item.content = m.group(2)
		else:
			# not found, so generate a fake header
			item = self.xml_to_wikklyitem(filename, self.guess_metainfo(filename))
			item.content = buf
			
		return item
		
	def render_item_xml(self, name):
		"""
		Return XML rendering of the named item.
		"""
		pass
		
	def render_item_html(self, name):
		"""
		Return HTML rendering of the named item.
		"""
		pass
		
if __name__ == '__main__':	
	# just run a little test ...
	import sys
	from time import time
	t1 = time()
	wf = wikStore_files(sys.argv[1])
	
	for name in wf.names():
		print "Getting: %s" % repr(name)
		print wf.getitem(name)
		


