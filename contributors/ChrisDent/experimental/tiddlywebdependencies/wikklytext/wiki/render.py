"""
wikklytext.wiki.render.py: Rendering of WikklyText.

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

# public API
__all__ = ['render_inner_html']

from wikklytext.store import makeFSname
from wikklytext import WikError, WikklyText_to_InnerHTML
import os
from wikklytext.base import ifelse

class URLResolver(object):
	"""
	Resolves URLs by looking in store to see if names exist.
	If so, points the URL to the rendered HTML file.
	"""
	def __init__(self, store):
		"store is a wikStore"
		self.store = store
		
	def makeurl(self, base_url, name, query, fragment):
		"""
		This is the same as what urlparse.urlunsplit does, except
		that it knows 'base_url' should be used as-is, and to 
		add .html to name.
		"""
		url = base_url + name + '.html'
		url += ifelse(query and len(query), '?' + query, '')
		url += ifelse(fragment and len(fragment), '#' + fragment, '')

		return url
		
	def resolver(self, url_fragment, base_url, site_url):
		from urlparse import urlsplit, urlunsplit
		# I ignore the parsed scheme & netloc and use base_url instead.
		# This avoids confusion with names like "Name: Here"
		# (setting to 'http' does not work -- causes URLs like "http:///.."
		# which don't work ...)
		scheme,netloc,path,query,frag = urlsplit(url_fragment)
		
		#print "RESOLVER IN",repr(scheme),repr(netloc),repr(path),repr(query),repr(frag)
		
		if path[-7:] == 'rss.xml':
			# report as internal URL
			return (base_url + 'rss.xml', False)
			
		# redirect DefaultTiddlers -> index
		if path == 'DefaultTiddlers':
			path = 'index'
			
		# see if it is a special name that won't exist in the wiki itself (either
		# an index-* file, or a command like DoServerCmd?cmd=...)
		if path in ['index', 'index-Names', 'index-Tags', 'index-Timeline','DoServerCmd']:
			# report it as an internal URL
			url = self.makeurl(base_url, path, query, frag)
			#print "RESOLVER OUT (1)",repr(url)
			return (url, False)
		
		# if path is a tiddler name, return link to rendered file
		item = self.store.getitem(path)
		if item is None:
			# if that failed, try loading with entire URL (catches things like "Name??")
			item = self.store.getitem(url_fragment)
			
		if item:
			name = makeFSname(item.name)
			
			# only DoServerCmd is allowed to have a query, so leave query
			# empty here (this allows pages like "Name??" to be linked to).
			url = self.makeurl(base_url, name, '', frag)
			
			#print "RESOLVER OUT (2)",repr(url)
			
			# report it as an internal URL (in a sense, all tiddlers are anchors,
			# so this is logical to do here)
			return (url, False)
		
		# not a tiddler name, do default URL resolution
		return (None,None)

class PostHook(object):
	def __init__(self, store):
		# make map of wikiwords
		self.wikiwords = {}
		for item in store.getall():
			self.wikiwords[item.name] = item.name

	def treehook(self, rootnode, context):
		from wikklytext.wikwords import wikiwordify
		# add links to wikiwords
		wikiwordify(rootnode, context, self.wikiwords)

def get_item_skiplist(wiki):
	"""
	Try to find an item 'DoNotRender' and get a list of item
	names to not render.
	"""
	# The skiplist is saved in a item ('DoNotRender') -- the reason
	# it is not a tag (like 'nocache') is that you may want to skip
	# .txt files in a 'text' wiki that aren't really items, and so
	# wouldn't have any way to be tagged.
	from wikklytext.store import tags_split
	item = wiki.getitem('DoNotRender')
	if item is None:
		return []
	else:
		return tags_split(item.content)
	
def render_text_inner_html(wiki, text, digest=None, cache_read=True, cache_write=True,
							UID=None, base_url='', max_runtime=20):
	"""
	Worker routine to render wiki content.
	
	wiki: WikklyWiki where content originated (used to find inner-wiki links).
	text: Content. Assumes caller has done any needed preprocessing; it is
	      simply rendered as-is into HTML.
	cache_dir: Directory for caching results. This directory is considered private to
	           render_text_inner_html() - it must exist and no one else may use it.
	digest: SHA-1 digest of item being rendered. If None, it is calculated from text.
	        (You'd pass digest if some context other than the text needs to be included
			in the digest.)
	cache_read: Should cache be read before rendering? (Set to False to force re-rendering.)
	cache_write: Should results be written to the cache?
	UID: User ID to use for 'safe mode' settings.
	     Can pass None to force safe_mode=True
	
	Returns: innerHTML, as UTF-8 encoded bytestring
	"""
	import sys
	from time import time
	from boodebr.util import makeSHA
	
	time_entry = time()
	store = wiki.store()
	cache_dir = wiki.rendercache()
	cache_stats = wiki.cache_get_stats()
	
	safe_mode = wiki.user_get_safemode(UID)
	
	# use passed digest or generate from text
	# (cached HTML is stored in a subdir digest[:2] with filename digest[2:])
	# (make 'safe_mode' setting part of digest so caching does the right thing)
	text_utf8 = text.encode('utf-8')
	digest = digest or makeSHA(str(safe_mode)+text_utf8).hexdigest()
	
	if not os.path.isdir(cache_dir):
		raise Exception("cache_dir must exist")
	
	# should I look in the cache?
	if cache_read:
		sub = os.path.join(cache_dir, digest[:2])
		cf = os.path.join(sub, digest[2:])
		if os.path.isdir(sub) and os.path.isfile(cf):
			buf = open(cf,'rb').read()
			cache_stats.addstat(tried_cache=True, cache_hit=True, bytes_in=len(text_utf8),
								bytes_out=len(buf), secs=time()-time_entry) 
			return buf
		
	#print "RENDER INNER",repr(text[:80])
	
	url_resolve = URLResolver(store)
	posthook = PostHook(store)
	
	# variables to set in WikContext
	setvars = {
		'$FS_CWD': store.getpath(),
		'$BASE_URL': wiki.getRT_baseurl(),
		}
		
	# render to inner HTML
	try:
		html,context = WikklyText_to_InnerHTML(text, 'utf-8', 
						safe_mode,
						setvars,
						url_resolver=url_resolve.resolver,
						tree_posthook=posthook.treehook,
						max_runtime=max_runtime)						
	except WikError:
		from wikklytext.base import HTML_PRE, HTML_POST
		from wikklytext.error import exception_to_html
		html = exception_to_html(sys.exc_info(), HTML_PRE('utf-8'), 
					HTML_POST('utf-8'), 'utf-8')
		
	# should I cache results?
	if cache_write:
		sub = os.path.join(cache_dir, digest[:2])
		cf = os.path.join(sub, digest[2:])
		if not os.path.isdir(sub):
			os.mkdir(sub)
			
		open(cf,'wb').write(html)
		
	cache_stats.addstat(tried_cache=cache_read, cache_hit=False, bytes_in=len(text_utf8),
								bytes_out=len(html), secs=time()-time_entry)
								
	return html
	
def render_inner_html(wiki, name, digest=None, cache_read=True, cache_write=True, UID=None):
	"""
	Render named item from the store and return inner HTML.

	wiki: WikklyWiki holding item
	name: Name of item to load
	UID: User ID to use for 'safe mode' settings.
	     Can pass None to force safe_mode=True

	Other params are passed to render_text_inner_html().
	
	Returns: (innerHTML [utf-8 bytestring], wikContext)
	"""
	item = wiki.store().getitem(name)
	
	content = u''
	if item.content_type == 'TiddlyWiki':
		# turn off reflow to match TiddlyWiki formatting
		content += u'<<set $REFLOW 0>>\n'
		
	content += item.content
	return render_text_inner_html(wiki, content, digest, cache_read, cache_write, UID)
	
	
