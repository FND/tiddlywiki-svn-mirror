"""
wikStore_tw_re: Implements a read/write store as a TiddlyWiki file.

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
import re, os
from wikStore import WikklyItem, WikklyDateTime

def VER(major,minor,rev):
	"Make a linear version number for easy comparison."
	return (major*100*100) + (minor*100) + rev
	
def escape_html_entities(utxt):
	"""
	Given a unicode string, replace all codepoints that are known HTML
	entities with decimal entities (&#NNNN;). Names are not used since
	TW uses decimal entities as well.
	"""
	from htmlentitydefs import codepoint2name
	
	out = u''
	for c in utxt:
		# careful not to escape chars already handled
		if c not in '&<>"\r\\\n' and codepoint2name.has_key(ord(c)):
			out += '&#%d;' % ord(c)
		else:
			out += c
			
	return out

def unescape_html_dentities(txt):
	"""
	Takes a string with HTML decimal entities like:
		&#NNNN;
		
	... and returns a unicode string with those entities
	converted to unicode.
	"""
	import re
	rh = re.compile('&#([0-9]+);')

	parts = rh.split(txt)
	# parts = [text, entity, text, entity ... text]
	text = 1
	out = u''
	for p in parts:
		if text:
			out += p
			text = 0
		else:
			out += unichr(int(p))
			text = 1
			
	return out

def detect(pathname):
	"""
	Detect if the given pathname is a TiddlyWiki file.
	(pathname can be a file or directory name.)
	
	Returns a wikStore_tw_re instance if so, or None if not.
	"""
	w = wikStore_tw_re(pathname)
	# do NOT detect by counting tiddlers since it might be empty.
	# get version instead and catch error if not a TW file.
	try:
		w.twversion()
		return w
	except:
		return None
		
class wikStore_tw_re(object):
	def __init__(self, filename, version="2.4"):
		"""
		filename: Name (full path) of TiddlyWiki HTML file.
		
		If filename doesn't exist, 'version' specifies which
		template to use to create the new TiddlyWiki. (If filename
		exists, 'version' is not used -- there is no conversion
		performed if the file is an older version.)
		"""
		import wikklytext.base
		from pkg_resources import resource_string
	
		self.filename = os.path.abspath(filename)
		if os.path.isdir(filename):
			raise Exception("filename cannot be a directory")
			
		if not os.path.isfile(filename):
			# create blank from template
			#blank = os.path.join(wikklytext.base.MYPATH, 'templates', 
			#				'BlankTiddlyWiki-%s.htm' % version)
			# template might be readonly so just do this ...
			name = 'BlankTiddlyWiki-%s.htm' % version
			blank = resource_string('wikklytext.store', 'templates/%s' % name)
			open(self.filename, 'wb').write(blank)
			
	def info(self):
		"Return a one-line description of this instance."
		return 'TiddlyWiki %s' % self.filename
	
	def getpath(self):
		"""
		Get the base directory for the store. This is used
		to resolve relative paths given by the wikitext for <<include>>, etc.
		"""
		return os.path.split(self.filename)[0]
	
	def names(self):
		"""
		Return names of all content items in store as a list of unicode strings.
		"""
		return [self.parse_div_name(div) for div in self.get_all_divs()]
		
	def getitem(self, name):
		"Load a single item. Returns WikklyItem, or None if not found."
		for div in self.get_all_divs():
			if self.parse_div_name(div) == name:
				return self.parse_div(div)
				
		return None # not found
		
	def getall(self):
		"Return all items in store as a list of WikklyItems"
		return [self.parse_div(div) for div in self.get_all_divs()]
	
	def saveitem(self, item, oldname=None, do_delete=False):
		"""
		Save a WikklyItem to the store.
		
		If oldname != None, passed item replaces the item of the given name.
		Notes:
			* Passing oldname=None is the way to store a new item, or
			  overwrite an existing item.
			* Passing oldname=item.name is the same as passing oldname=None
		
		Tries to replicate the formatting of TiddlyWiki but note:
		    1. There may be some minor whitespace differences, not affecting content.
			2. This code escapes HTML entities more aggressively than TiddlyWiki, 
			   but produces an equivalent HTML stream.
			   
		Implementation note: regex.sub() is not used to write content -- between HTML 
		escaping and regex escaping this becomes complex and error prone. I prefer
		the structured approach below.
		
		** do_delete is for internal use only **
		"""		
		if oldname == item.name:
			oldname = None # make sure no side effects below .. this is what user meant to do
			
		version = self.twversion()
		
		buf = self.loadfile()
		start,store,end = self.split_wiki(buf)
		
		#newstore = u'<div id="storeArea">'
		#if version >= VER(2,1,0):
		#	newstore += u'\n'
		newstore = u''
		
		wrote_item = False
		
		for div in self.get_all_divs():
			name = self.parse_div_name(div)
			if name == oldname or (do_delete and name == item.name):
				continue # rename or delete
				
			if name == item.name:
				if not do_delete:
					# overwrite at same location in store
					newstore += self.format_item(item, version) + '\n'
					wrote_item = True
			else:
				# save as-is including formatting
				newstore += div.lstrip() + u'</div>' + '\n'
				
		if not wrote_item and not do_delete:
			# add new item at end
			newstore += self.format_item(item, version) + '\n'
			
		#newstore += '</div>'
		
		# implementation note: '\r' chars are removed at the caching level.
		
		wiki = (start + newstore + end).encode('utf-8')
		open(self.filename,'wb').write(wiki)
		
	def delete(self, item):
		"""
		Delete the given WikklyItem from the store.
		"""
		self.saveitem(item, do_delete=True)
		
	def search(self, query):
		"""
		Return a list of items matching query.
		
		'query' is one of the WikklyQuery* objects defined 
		in wikklytext.store.query.
		"""
		from wikklytext.store.wikQuery import generic_query_store
		return generic_query_store(self, query)

	# -- INTERNAL API --
	def format_item(self, item, version):
		"""
		Create a <div> from an item. Returns unicode string.
		
		version = VER() for the version of TiddlyWiki being written.
		"""
		from wikStore import tags_join
		
		if version >= VER(2,2,0):
			div = u'<div title="%s"' % self.escape(item.name)
		else:
			div = u'<div tiddler="%s"' % self.escape(item.name)
			
		div += u' modifier="%s"' % self.escape(item.author)
		
		# TW 2.2.x only saves mtime if != ctime
		if (version >= VER(2,2,0) and item.mtime != item.ctime) or (version < VER(2,2,0)):
			div += u' modified="%s"' % item.mtime.to_store()
			
		div += u' created="%s"' % item.ctime.to_store()
		
		if len(item.tags) or version < VER(2,2,0):
			# TW 2.0.x and 2.1.x always write tags, even if empty
			div += u' tags="%s"' % self.escape(tags_join(item.tags))
			
		if version >= VER(2,2,0) and item.revision is not None:
			div += u' changecount="%d"' % item.revision
			
		if version >= VER(2,2,0):
			content = self.escape(item.content, to_pre=True)
			div += '>\n<pre>%s</pre>\n</div>' % content
		else:
			div += '>%s</div>' % self.escape(item.content)
		
		return div
		
	def loadfile(self):
		buf = open(self.filename, 'rb').read()
		return unicode(buf, 'utf-8', 'replace')
		
	def twversion(self):
		"""
		Get TiddlyWiki version number from file.
		
		Returns linear version number. Use VER() for comparisons.
		"""
		buf = self.loadfile()
		
		m = re.search(r'var version\s*=\s*{(.+?)};', buf)
		if not m:
			raise Exception("ERROR locating version")
		
		txt = m.group(1)
		
		m = re.search(r'major:\s*([0-9]+)', txt)
		major = int(m.group(1))

		m = re.search(r'minor:\s*([0-9]+)', txt)
		minor = int(m.group(1))
		
		m = re.search(r'revision:\s*([0-9]+)', txt)
		rev = int(m.group(1))
		
		return VER(major,minor,rev)
		
	def split_wiki(self, buf):
		"""
		Given the entire contents of a  TiddlyWiki, return:
			(start, store, end)
			
		Where the TiddlyWiki can be reassembled as:
			wiki = start + store + end
			
		NOTE:
			'store' is PURELY the content <divs>. The "storeArea" wrapper is
			part of start & end.
		"""
		m = re.match(r'(.+<div id="storeArea">\s*)((<div.+?>.+?</div>[\n]?)*)(\s*</div>.+)', buf, re.M|re.S)
		if not m:
			raise Exception("Cannot split wiki.")
		
		#print "Split END",repr(m.group(4)[:80])
		return (m.group(1), m.group(2), m.group(4))
		
	def get_store(self):
		"""
		Get block of text from tiddlywiki file:
			<div id="storeArea">
				... storage divs ...
			</div>
		
		Returns the "... storage divs ..." text as unicode.
		"""
		buf = self.loadfile()

		start,store,end = self.split_wiki(buf)
		return store
		
	def get_all_divs(self):
		"""
		Get all <divs> from storeArea as a list of
		unicode strings:
			<div ...>CONTENT
			
		(Note that there is no final </div> on the strings!) 
		"""
		return self.get_store().split('</div>')[:-1]
		
	def escape(self, txt, to_pre=False):
		"""
		Escape text for placing into TiddlyWiki.
		
		to_pre is True/False if txt is going to be put inside a <pre> storage area.
		"""
		#print "ESCAPING",repr(txt)
		
		# careful on ordering ...
		pairs = [('&','&amp;'), ('<','&lt;'), ('>','&gt;'),
					('"','&quot;'), ('\r','')]
					
		if not to_pre:
			pairs += [('\\','\\s'), ('\n','\\n')]
			
		for a,b in pairs:
			txt = txt.replace(a,b)
		
		#print "ESCAPED TO",repr(txt)
		
		# now escape unicode codepoints -> HTML entities
		txt = escape_html_entities(txt)
		
		return txt
		
	def unescape(self, txt, from_pre=False):
		"""
		Unescape tiddlywiki text.
		
		from_pre is True/False if text comes from a <pre> storage area.
		"""
		# unescape HTML entities first
		txt = unescape_html_dentities(txt)
		
		# careful on ordering ...
		pairs = [('&lt;','<'), ('&gt;','>'), ('&quot;','"'),
					('&amp;','&')]
					
		if not from_pre:
			pairs += [('\\n','\n'), ('\\s', '\\')]
			
		#print "UNESCAPING",repr(txt)
		#print "PAIRS",pairs
		
		for a,b in pairs: 
			txt = txt.replace(a,b)
			
		return txt
		
	def parse_div_name(self, div):
		"""
		Get just the tiddler name from div.
		
		div is an item from get_all_divs().
		"""
		m = re.search(r'(tiddler|title)="(.+?)"', div, re.M|re.S)
		if m is None:
			raise Exception("Cannot get div name from: %s" % \
					repr(div[:100]))
			
		return self.unescape(m.group(2))
		
	def parse_div_next_attr(self, text):
		m = re.match(r'\s*>', text)
		if m:
			return (len(m.group(0)),None,'') # end of tag
			
		m = re.match(r'(.+?)="(.*?)"\s*', text)
		if not m:
			raise Exception("Unable to find next attr at point: %s" % text[:400])
			
		return (len(m.group(0)), m.group(1), m.group(2))
			
	def parse_div_attrs(self, div):
		attrs = {}
		while 1:
			nr, name, value = self.parse_div_next_attr(div)
			if name is None:
				return (attrs, div[nr:])
				
			# -- normalize attr names across TW versions --
			
			# (tiddler|title) -> title
			if name == 'tiddler':
				name = 'title'
				
			attrs[name] = value
			div = div[nr:]
			
	def parse_div(self, div):
		"""
		Parse a <div> into a WikklyItem.
		
		div is an item from get_all_divs().
		"""
		from wikStore import tags_split
		#print "PARSE DIV",div
		
		# skip "<div" portion
		m = re.match(r'\s*<div\s*', div)
		if not m:
			raise Exception("ERROR parsing <div> @ %s" % (div[:400]))
			
		div = div[len(m.group(0)):]
		
		# split tag attributes
		attrs,txt = self.parse_div_attrs(div)
		
		name = self.unescape(attrs['title'])
		
		# 'modifier' is optional in TW 2.3.x
		author = self.unescape(attrs.get('modifier', u'Unknown'))
		ctime = attrs['created']
		mtime = attrs.get('modified', ctime) # 'modified' is optional in TW 2.2.x
		tags = attrs.get('tags', u'')
		tags = tags_split(self.unescape(tags))
		revision = attrs.get('changecount', None)
		if revision is not None:
			revision = int(revision)
		
		#print "MATCH ON",div[m.start(0):m.end(0)]
		#print "GROUPS",m.groups()
		#print "AUTHOR",author
		#print "MTIME",mtime
		#print "CTIME",ctime
		#print "TAGS",tags
		
		# remainder is content - careful here ...
		m = re.match(r'\s*<pre>(.*)</pre>',txt,re.M|re.S)
		if m:
			content = self.unescape(m.group(1), from_pre=True)
		else:
			content = self.unescape(txt)
		
		#print "UNESCAPED CONTENT",repr(content)
	
		return WikklyItem(name, content, tags, author, 
					WikklyDateTime(from_store=ctime), 
					WikklyDateTime(from_store=mtime),
					u'TiddlyWiki', revision)
		
if __name__ == '__main__':
	import sys		
	from time import time
	
	t1 = time()
	w = wikStore_tw_re(sys.argv[1])
	names = w.names()
	dt = time()-t1
	
	print "Scanned %d names in %.3f secs" % (len(names), dt)
	
	items = w.getall()
	
	dt = time()-t1
	
	print "Got %d items in %.3f secs" % (len(items), dt)
	names2 = [item.name for item in items]
	for name in names2:
		if name not in names:
			print "NOT:",name
			
	buf = w.get_store()
	t1 = time()
	l = buf.split('</div>')[:-1]
	dt = time()-t1
	print "SPLIT INTO %d pieces in %.3f secs" % (len(l),dt)
	#print "0",repr(l[0])
	#print "-1",repr(l[-1])
	
	print "VERSION",w.twversion()
	
	import shutil
	shutil.copy(sys.argv[1], 'aaa.out')
	
	w = wikStore_tw_re('aaa.out')
	
	t1 = time()
	w.saveitem(items[0], None)
	dt = time()-t1
	print "Wrote 1st item in %.3f secs" % dt
	
	# inefficient, but I want to overwrite all items to show
	# that the resulting wiki is equivalent to the original
	t1 = time()
	for item in items:
		w.saveitem(item, None)
		
	dt = time()-t1
	print "Wrote %d items in %.3f secs" % (len(items),dt)

