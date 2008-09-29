"""
twextract.py: Extract content from a TiddlyWiki into a set of TXT, XML and HTML files.

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

from wikklytext.store.wikStore import WikklyItem, WikklyDateTime
import re, os, sys
from wikklytext import WikklyText_to_HTML, wikitext_as_unicode, WikklyText_to_XML, \
				WikError, copy_CSS_elements 

CUR_HTML_OUTNAME = None

def escape_camelword(word):
	"If word is a CamelWord, add a ~ to it."
	from wikklytext.wikwords import is_camelword
	
	if is_camelword(word):
		return '~'+word
	else:
		return word
		
def tiddler_sort_desc_mtime(a, b):
	# sort by mtime, descending
	return cmp(b.mtime, a.mtime)

def tiddlers_by_tags(store):
	"""
	Return a map of tags to WikklyItems where:
		map[tag] = list of WikklyItems with tag
	"""
	tagmap = {}
	for item in store.getall():
		for tag in item.tags:
			if tagmap.has_key(tag):
				tagmap[tag].append(item)
			else:
				tagmap[tag] = [item]
				
	return tagmap
	
class URLResolver(object):
	def __init__(self, istore, ostore):
		self.istore = istore
		self.ostore = ostore
		
	def resolver(self, url_fragment, base_url, site_url):
		# if url_fragment is a tiddler name, return link
		# to extracted file
		item = self.istore.getitem(url_fragment)
		if item:
			# report it as an internal URL (in a sense, all tiddlers are anchors,
			# so this is logical to do here)
			name = os.path.basename(self.ostore.stored_name(item.name,noext=True))
			name = name + '.html'
			return (name, False)
		
		# not a tiddler name, do default URL resolution
		return (None,None)

class PostHook(object):
	def __init__(self, store, xml_outname):
		self.xml_outname = xml_outname
		# make map of wikiwords
		self.wikiwords = {}
		for item in store.getall():
			self.wikiwords[item.name] = item.name

	def treehook(self, rootnode, context):
		from wikklytext.wikwords import wikiwordify
		# add links to wikiwords
		wikiwordify(rootnode, context, self.wikiwords)
		
	def xmlhook(self, xml, context):
		# save XML to file
		open(self.xml_outname, 'wb').write(xml)
		
def process_save_content(istore, ostore, tiddler_name, content):
	print "PROCESSING",repr(tiddler_name)
	
	url_resolve = URLResolver(istore, ostore)
	
	txt_name = ostore.stored_name(tiddler_name)
	
	# save as wikitext
	open(txt_name,'wb').write(content.encode('utf-8'))
	#print "Wrote wikitext:",txt_name
	
	xml_name = ostore.stored_name(tiddler_name,noext=True) + '.xml'
	# XML will be saved in hook
	posthook = PostHook(istore, xml_name)
	
	# save as HTML
	try:
		html,context = WikklyText_to_HTML(content, 'utf-8', False,
						url_resolver=url_resolve.resolver,
						tree_posthook=posthook.treehook,
						xml_posthook=posthook.xmlhook)
	except WikError:
		from wikklytext.base import HTML_PRE, HTML_POST
		from wikklytext.error import exception_to_html
		html = exception_to_html(sys.exc_info(), HTML_PRE('utf-8'), 
					HTML_POST('utf-8'), 'utf-8')
	
	html_name = ostore.stored_name(tiddler_name)
	html_name,ext = os.path.splitext(html_name)
	html_name += '.html'
	
	open(html_name, 'wb').write(html)
	#print "Wrote HTML:",html_name
	
def page_title(store, infilename):
	title = store.getitem('SiteTitle')
	subtitle = store.getitem('SiteSubtitle')
	now = WikklyDateTime()
	now.from_localtime()
	
	# escape title so it won't become a link
	h = u'{{site-title{%s}}} {{site-subtitle{%s}}}\n' % (escape_camelword(title.content), subtitle.content)
	h += u"{{grayout{~~(Extracted from ''%s'' by [[twextract|http://boodebr.org/software/wikklytext]] on ''%s''~~)}}}\n" % \
			(os.path.basename(infilename), now.to_display())
			
	return h
	
def author_tagline(store, item):
	# add modifier (with link if applicable)
	if store.getitem(item.author):
		h = u'[[%s|%s]]' % (item.author,item.author)
	else:
		h = u"''%s''" % item.author

	# add dates
	h += u'~~{{grayout{, %s (created %s)}}}~~\n\n' % \
			(item.mtime.to_display(), item.ctime.to_display())

	return h
	
def write_default_tiddler(istore, ostore, infilename):
	
	item = istore.getitem('DefaultTiddlers')
	
	# add header
	content = u''
	# set document title
	content += u'<<set $TITLE "%s">>\n' % item.name
	# turn off reflow to match TiddlyWiki formatting
	content += u'<<set $REFLOW 0>>\n'
	# add navigation bar (have links open in same window)
	content += u'<<set $LINKS_NEW_WINDOW 0>>\n'
	content += page_title(istore, infilename)
	content += "|!Home|[[Timeline|index-Timeline.html]]|[[All|index-All.html]]|[[Tags|index-Tags.html]]|\n"
	content += '----\n'
	# restore to default
	content += u'<<set $LINKS_NEW_WINDOW 1>>\n'

	txt = item.content.replace('\n',' ').replace('\r',' ')
	# as I understand it, DefaultTiddlers can only contain names
	# of tiddlers, possibly like "[[name]]", so just do a wordsplit
	# pull in those tiddlers
	wordlist = []
	for word in txt.split():
		m = re.match(r'\[\[(.+)\]\]', word)
		if m:
			wordlist.append(m.group(1))
		else:
			wordlist.append(word)
			
	# pull in content for all default tiddlers
	for word in wordlist:
		t = istore.getitem(word)
		if t is None:
			content += u'@@ERROR: Tiddler "%s" not found@@\n' % word
		else:
			content += u'{{item-title{%s}}}\n' % escape_camelword(word)
			
			# add link to author, if applicable
			content += author_tagline(istore, t)
			content += t.content + '\n\n'
	
	process_save_content(istore, ostore, u'index', content)
	
def write_all_tiddlers(istore, ostore, infilename):
		
	for name in istore.names():
		item = istore.getitem(name)
		
		# add header
		header = u''
		# set document title
		header += u'<<set $TITLE "%s">>\n' % item.name
		# turn off reflow to match TiddlyWiki formatting
		header += u'<<set $REFLOW 0>>\n'
		# add navigation bar (have links open in same window)
		header += u'<<set $LINKS_NEW_WINDOW 0>>\n'
		header += page_title(istore, infilename)
		header += "|[[Home|index.html]]|[[Timeline|index-Timeline.html]]|[[All|index-All.html]]|[[Tags|index-Tags.html]]|\n"
		
		if len(item.tags):
			header += "''Tags:'' "
			for tag in item.tags:
				header += u'[[%s|index-Tags.html#TAG_%s]] ' % (tag,tag)
			
			header += u'\n'
			
		header += '----\n'
				
		# restore to default
		header += u'<<set $LINKS_NEW_WINDOW 1>>\n'
		# add tiddler name just like TiddlyWiki would
		header += u'{{item-title{%s}}}\n' % escape_camelword(item.name)

		header += author_tagline(istore, item)
		
		content = header + item.content
		
		process_save_content(istore, ostore, item.name, content)
	
def write_timeline_index(istore, ostore, infilename):
	#-----------------------------------------------------------------
	# sort by mtime and write Timeline index (like 'Timeline' tab)
	#-----------------------------------------------------------------
	allitems = istore.getall()
	allitems.sort(tiddler_sort_desc_mtime)
	
	txt_index = u''
	
	# set document title
	txt_index += u'<<set $TITLE "Index of %s">>' % infilename
	
	# turn off reflow to match TiddlyWiki formatting
	txt_index += u'<<set $REFLOW 0>>\n'
	
	# keep clicked links in same window
	txt_index += u'<<set $LINKS_NEW_WINDOW 0>>\n'
	
	# add naviation bar at top
	txt_index += page_title(istore, infilename)
	txt_index += "|[[Home|index.html]]|!Timeline|[[All|index-All.html]]|[[Tags|index-Tags.html]]|\n"
	txt_index += '----\n'
	
	cur_YMD = None
	
	for item in allitems:
		# when Y-M-D changes, write it
		if cur_YMD != item.mtime.to_YMD():
			txt_index += item.mtime.to_display()
			cur_YMD = item.mtime.to_YMD()
			
		# add link
		txt_index += u'<<indent <quote>[[%s|%s]]</quote>>>\n' % \
				(item.name, item.name)
	
	process_save_content(istore, ostore, u'index-Timeline', txt_index)

def write_all_index(istore, ostore, infilename):
	#-----------------------------------------------------
	# sort by name and write name index (like 'All' tab)
	#-----------------------------------------------------
	names = istore.names()
	names.sort()
	
	txt_index = u''
	
	# set document title
	txt_index += u'<<set $TITLE "Index of %s">>' % infilename
	
	# turn off reflow to match TiddlyWiki formatting
	txt_index += u'<<set $REFLOW 0>>\n'
	
	# keep clicked links in same window
	txt_index += u'<<set $LINKS_NEW_WINDOW 0>>\n'
	
	# add naviation bar at top
	txt_index += page_title(istore, infilename)
	txt_index += "|[[Home|index.html]]|[[Timeline|index-Timeline.html]]|!All|[[Tags|index-Tags.html]]|\n"
	txt_index += '----\n'
	
	for name in names:
		item = istore.getitem(name)
		# add link
		txt_index += u'<<indent <quote>[[%s|%s]]</quote>>>\n' % \
				(item.name, item.name)
	
	process_save_content(istore, ostore, u'index-All', txt_index)

def write_tag_index(istore, ostore, infilename):
	#-----------------------------------------------------
	# write index by tags (like "Tags" tab)
	#-----------------------------------------------------
	tagmap = tiddlers_by_tags(istore)
	
	txt_index = u''
	
	# set document title
	txt_index += u'<<set $TITLE "Index of %s">>' % infilename
	
	# turn off reflow to match TiddlyWiki formatting
	txt_index += u'<<set $REFLOW 0>>\n'
	
	# keep clicked links in same window
	txt_index += u'<<set $LINKS_NEW_WINDOW 0>>\n'
	
	# add naviation bar at top
	txt_index += page_title(istore, infilename)
	txt_index += "|[[Home|index.html]]|[[Timeline|index-Timeline.html]]|[[All|index-All.html]]|!Tags|\n"
	txt_index += '----\n'
	
	tags = tagmap.keys()
	tags.sort()
	
	for tag in tags:
		txt_index += '* [[%s|#TAG_%s]] (%d)\n' % (tag, tag, len(tagmap[tag]))
		
	for tag in tags:
		txt_index += '!!!%s\n' % tag
		for item in tagmap[tag]:
			txt_index += '* [[#TAG_%s]] [[%s|%s]]\n' % (tag, item.name, item.name)
			
	process_save_content(istore, ostore, u'index-Tags', txt_index)

def do_main():
	from wikklytext.store.wikStore_tw import wikStore_tw # use caching version!
	from wikklytext.store.wikStore_files import wikStore_files
	
	if len(sys.argv) < 3:
		print "Usage: twextract tiddlywiki.html output_dir"
		sys.exit(1)
		
	tiddlywiki = sys.argv[1]
	
	outdir = sys.argv[2]
	if not os.path.isdir(outdir):
		os.makedirs(outdir)
	
	istore = wikStore_tw(tiddlywiki)
	ostore = wikStore_files(outdir)
	
	print "Got %d names" % len(istore.names())
	
	# write tiddly content
	write_all_tiddlers(istore, ostore, tiddlywiki)
	
	# write index pages
	write_timeline_index(istore, ostore, tiddlywiki)
	write_all_index(istore, ostore, tiddlywiki)
	write_tag_index(istore, ostore, tiddlywiki)

	# make index.html from DefaultTiddlers
	write_default_tiddler(istore, ostore, tiddlywiki)

	# copy style sheet elements to outdir
	cssdir = os.path.join(outdir, 'css')
	if not os.path.isdir(cssdir):
		os.makedirs(cssdir)
		
	copy_CSS_elements(cssdir)

if __name__ == '__main__':
	do_main()
	
