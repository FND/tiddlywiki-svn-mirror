"""
rss.py: Create RSS feed for wiki.

Copyright (C) 2008 Frank McIngvale

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
from wikklytext.base import ifelse
from wikklytext.util import xml_escape
from wikklytext.wiki.util import itemText
from wikklytext.store import makeFSname
from wikklytext.wiki.render import render_inner_html
	
def create_rss_xml(wiki, url_site):
	"""
	Create RSS feed for the wiki.
	
		wiki: The WikklyWiki
		url_site: Site URL
		
	Returns UTF-8 encoded XML feed.
	"""
	# follows format at: 
	#   http://cyber.law.harvard.edu/rss/rss.html
	
	import wikklytext.version as version
	
	# load all items and sort by date (newest first)
	items = wiki.getall()
	items.sort(lambda a,b: cmp(b.mtime, a.mtime))

	# remove items with 'norss' tag
	items = [item for item in items if 'norss' not in item.tags]
	
	# remove items in skiplist
	skiplist = wiki.get_skiplist()
	items = [item for item in items if item.name not in skiplist]
	
	# create header
	# general note: I use xml_escape() more than strictly necessary, for sanity
	ind = u'    '
	
	rss = u'<?xml version="1.0" encoding="utf-8"?>\n'
	rss += u'<rss version="2.0">\n'
	
	rss += ind + u'<channel>\n'

	rss += ind*2 + u'<title>%s</title>\n' % xml_escape(itemText(wiki, 'SiteTitle'))
	rss += ind*2 + u'<link>%s</link>\n' % xml_escape(url_site)	
	rss += ind*2 + u'<description>%s</description>\n' % xml_escape(itemText(wiki, 'SiteSubtitle'))
	if len(items):
		rss += ind*2 + u'<lastBuildDate>%s</lastBuildDate>\n' % xml_escape(items[0].mtime.to_rfc822())
	rss += ind*2 + u'<generator>WikklyText %s</generator>\n' % xml_escape(version.VSTR)
	rss += ind*2 + u'<docs>http://blogs.law.harvard.edu/tech/rss</docs>\n'
	
	# add items
	
	if url_site[-1] != '/':
		url_site += '/'
		
	for item in items:
		rss += ind*2 + u'<item>\n'
		
		rss += ind*3 + u'<title>%s</title>\n' % xml_escape(item.name)
		rss += ind*3 + u'<link>%s</link>\n' % xml_escape(url_site + makeFSname(item.name) + '.html')

		# use item digest as guid for item as well
		# (add 'safe_mode' setting to digest so caching will depend on it as well)
		digest = item.digest(str(wiki.user_get_safemode(item.author)))
		
		# render item to HTML.
		# render with UID of *author*, not logged-in user
		do_cache = ifelse('nocache' in item.tags, False, True)
		inner = render_inner_html(wiki, item.name, 
					digest, do_cache, do_cache, item.author)
		
		# going to place in a CDATA section, so escape anything that looks like ']]>'
		inner = unicode(inner, 'utf-8')
		inner = inner.replace(']]>', ']]&#x220b;>')
		# place HTML in CDATA so no other escaping is needed
		rss += ind*3 + u'<description><![CDATA[%s]]></description>\n' % inner
		
		# make sure client knows that my guid is not a link
		rss += ind*3 + u'<guid isPermaLink="false">%s</guid>\n' % xml_escape(digest)
		
		rss += ind*3 + u'<pubDate>%s</pubDate>\n' % xml_escape(item.mtime.to_rfc822())
		
		rss += ind*2 + u'</item>\n'
	
	rss += ind + u'</channel>\n'
	rss += u'</rss>\n'
	
	return rss.encode('utf-8')

