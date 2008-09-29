"""
wikklytext.buildHTML.py: Rendering of WikklyText XML to HTML. Part of the WikklyText suite.

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

"""
See "Tags.txt" for the definition of XML tags.

"Safe" vs. "Full" mode filtering is done at this level instead of during
XML generation. Why?

   a. What is 'unsafe' is defined by the target language (e.g. HTML). Nothing
      is unsafe in XML format.
   b. Should not assume the XML passed to me is safe (i.e. user might have
      generated XML with a tool other than wikklytext.buildXML.py).
	  
Due to 'b', you will see extra sanity checks here that should never apply
for XML generated by wikklytext.buildXML.py. These are to cover XML generated by another
tool.

--- CAUTION ---------------------------------------------------------------------
There is a single tag attribute that cannot be filtered against unsafe input.
The <MacroBlock> tag contains an unfiltered 'style=' attribute. This is required 
in order for macros to be able to define arbitrary blocks.

Macro writers MUST ensure that no unfiltered user data is injected into
the 'style' attribute (at least in Safe Mode). (Since users cannot define
their own macros in Safe Mode, there is no risk unless you write your own macros
or add 3rd party macros.)
----------------------------------------------------------------------------------
"""
from wikklytext.parser import WikklyBaseContentParser
from wikklytext.buildXML import WikklyContentToXML
from urlparse import urlparse
import re
from wikklytext.base import StringIO, make_etree_map, HTML_PRE, HTML_POST, \
			ElementTree, ifelse, WikError, xmltrace
from wikklytext.util import var_get_text

def printAllSubnodes(node):
	for node in node.getiterator():
		print node.tag
		
def getNodesByTag(node, tag):
	"""
	Return a list of all nodes with the given .tag under 'node'.
	This does a deep search, not just immediate child nodes.
	
	If none found, returns [].
	"""
	return [node for node in node.getiterator() if node.tag == tag]

def node_contains_block_elements(node):
	# look for block-type elements inside a node (intentionally does NOT
	# count multiline text!)
	blocktypes = ['NumberedList', 'UnnumberedList', 
					'BlockIndent', 'CodeBlock', 'Table']
	nr = 0
	for tag in blocktypes:
		nr += len(getNodesByTag(node, tag))
	
	return (nr > 0)

# do extra sanity checks in case I'm reading user-generated XML, and not
# XML from wikklytext.buildXML.py
def sanitize_text_align(align):
	return ifelse(align in ['left', 'center', 'right'], align, '')

def sanitize_classname(name):
	return ifelse(re.match(r"^[a-z_-][a-z0-9_-]+$", name, re.I), name, '')
	
def unsafe_url(url):
	"Returns True if anything potentially unsafe is found in URL. Else, returns False."
	from urlparse import urlparse
	from urllib import unquote_plus

	#print 'UNSAFE URL in',url
	
 	# unescape any URL escapes that might try to fool the matching
	url = unquote_plus(url)

	# entities have been converted to real values, except for &#x200b;
	
	# its possible to sneak an entity by the lexer with something like "&#26;#x09",
	# so do another scan here. *ANY* entities besides &#x200b; are not allowed.
	if re.search("(&#(?!x200b;))", url, re.I):
		#print "** UNSAFE due to entities"
		return True # still contains entities

	# finally, delete &#x200b;
	url = url.replace('&#x200b;','').replace('&#x200B;','')
	
	# look for 'javascript:', possibly with embedded spaces
	if re.match('^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:', url, re.I):
		#print "** UNSAFE - contains 'javascript'"
		return True

	# .. and for vbscript:
	if re.search('^\s*v\s*b\s*s\s*c\s*r\s*i\s*p\s*t\s*:', url, re.I):
		#print "** UNSAFE - contains 'vbscript'"
		return True
	
	# .. and for mocha:
	if re.search('^\s*m\s*o\s*c\s*h\s*a\s*:', url, re.I):
		#print "** UNSAFE - contains 'mocha'"	
		return True
	
	# .. and for livescript:
	if re.search('^\s*l\s*i\s*v\s*e\s*s\s*c\s*r\s*i\s*p\s*t\s*:', url, re.I):
		#print "** UNSAFE - contains 'livescript'"	
		return True
	
	# a ' or " inside the URL may indicate an attempt to escape from
	# quoting in href= or src=
	if '"' in url or "'" in url:
		#print "UNSAFE - contains quoting"
		return True

	#print "URLSPLIT",urlparse(url)
	
	# split URL apart and examine pieces (works fine for regular filenames)
	scheme, server, path, parms, q, frag = urlparse(url)
	
	# if no dots in server, could be a firefox keyword-search attempt
	# XXX this breaks for 'http://localhost', e.g.
	#if len(server) and '.' not in server:
	#	print "UNSAFE - no dots for server",server
	#	return True
		
	# disallow "dword" addresses (http://123456/ ...), hex addressing (http://0x12.0x34.0x56.0x78/..),
	# decimal & octal addressing (http://123.345.434.222/...). These types can be mixed inside the URL.
	# Watch for embedded spaces.
	got_nr = 0
	parts = server.split('.')
	#print "PARTS",parts
	for part in parts:
		# decimal, octal & dword
		if re.match(r'^[0-9\s]+$', part):
			got_nr += 1
		# hex
		elif re.match(r'^0x[0-9a-f\s]+$', part, re.I):
			got_nr += 1
		
	#print "GOT NR ",got_nr
	if got_nr == len(parts):
		#print "UNSAFE numeric"
		return True # numeric address
		
	# anything not caught above is considered safe
	return False
		
def strclass(primary, extras):
	"""
	Combine zero or more classnames for placement inside 'class="..."'
	
	name is a classname or None.
	extras is a zero or more classes to append.
	"""
	c = sanitize_classname(primary or '')
	if not len(extras):
		return c
		
	c += ' ' + ' '.join([sanitize_classname(c) for c in extras])
	return c
	
def make_html(node, wcontext, parent_map, prevsib_map, add_classes):
	from time import time

	# check time limit at each node
	if time() > wcontext.stoptime:
		return 'Max runtime exceeded!!<p>'
	
	css = 'wikkly'
	
	simpletags = {
		'Bold': ('b',None),
		'Italic': ('i',None),
		'Strikethrough': ('span','%s-strike' % css),
		'Underline': ('u',None),
		'Superscript': ('sup',None),
		'Subscript': ('sub',None),
		'NumberedList': ('ol', '%s-ol' % css),
		'UnnumberedList': ('ul', '%s-ul' % css),
		}
		
	html = ''
		
	if node.tag in simpletags.keys():
		tag, cssclass = simpletags[node.tag]
		#if cssclass is None:
		#	html += '<%s>' % tag
		#else:
		#	html += '<%s class="%s">' % (tag,cssclass)
		html += '<%s class="%s">' % (tag, strclass(cssclass, add_classes))
		
		close = '</%s>' % tag
			
	elif node.tag == 'NumberedListItem':
		c = "%s-ol-li%d" % (css, int(node.get('level')))
		html += '<li class="%s">' % strclass(c, add_classes)
		close = '</li>'
		
	elif node.tag == 'UnnumberedListItem':
		c = "%s-ul-li%d" % (css, int(node.get('level')))
		html += '<li class="%s">' % strclass(c, add_classes)
		close = '</li>'

	elif node.tag == 'Heading':
		c = "%s-h%d" % (css, int(node.get('level')))
		html += '<h%d class="%s">' % (int(node.get('level')), strclass(c, add_classes))
		close = '</h%d>' % int(node.get('level'))
		
	elif node.tag == 'BlockIndent':
		c = "%s-block-indent" % css
		html += '<div class="%s">' % strclass(c, add_classes)
		close = '</div>'
	
	elif node.tag == 'LineIndent':
		c = "%s-line-indent" % css
		html += '<div class="%s">' % strclass(c, add_classes)
		close = '</div>'
	
	elif node.tag == 'CodeBlock':
		c = "%s-code-block" % css
		html += '<div class="%s">' % strclass(c, add_classes)
		close = '</div>'
	
	elif node.tag == 'CodeInline':
		c = "%s-code-inline" % css
		html += '<span class="%s">' % strclass(c, add_classes)
		close = '</span>'

	elif node.tag == 'ErrorsList':
		close = ''
		
	elif node.tag == 'Error':
		# I don't apply add_classes here since these are internally generated nodes
		html += '<div class="%s-error-container">' % css
		close = '</div>'
		
	elif node.tag == 'ErrorMessage':
		# I don't apply add_classes here since these are internally generated nodes
		html += '<div class="%s-error-head">Error Message</div>' % css
		html += '<div class="wikkly-error-body">' 
		close = '</div>'
		
	elif node.tag == 'ErrorLookingAt':
		# I don't apply add_classes here since these are internally generated nodes
		html += '<div class="wikkly-error-head">Looking at:</div>'	
		html += '<div class="wikkly-error-body">' 
		close = '</div>'
		
	elif node.tag == 'ErrorTrace':
		# I don't apply add_classes here since these are internally generated nodes
		html += '<div class="wikkly-error-head">Traceback:</div>'	
		html += '<div class="wikkly-error-body">' 
		close = '</div>'
	
	elif node.tag == 'Text':
		# 'Text' is not allowed to have inner tags. Enforce this by
		# escaping & returning text immediately, not checking for subnodes.
		
		text = node.text or ''

		# Text = default escaping - careful on ordering
		
		# remove zero-width chars
		text = text.replace('&#x200B;','').replace('&#x200b;','')
		
		text = text.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
		text = text.replace('\n','<br/>')
		return text
		
	elif node.tag == 'TextCode':

		text = node.text or ''

		# remove leading/trailing newlines
		while len(text) and text[0] == '\n':
			text = text[1:]
		
		while len(text) and text[-1] == '\n':
			text = text[:-1]
	
		# like regular Text escaping ...

		# remove zero-width chars
		text = text.replace('&#x200B;','').replace('&#x200b;','')
		
		text = text.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
		text = text.replace('\n','<br/>')
		
		# except also preserve whitespace
		text = text.replace(' ','&nbsp;').replace('\t','&nbsp;'*4)
		
		return text

	elif node.tag == 'TextHTML':
		if wcontext.restricted_mode:
			return '' # <html> not allowed in Safe mode
			
		text = node.text or ''
		# no escaping, leave as raw HTML
		return text
			
	# these are just for structure in XML stream, can ignore here
	elif node.tag in ['WikklyContent', 'Content', 'ElementList']:
		close = ''

	elif node.tag == 'BlankLines':
		# no inner tags allowed, can return immediately
		#
		# NOTE: HTML headers seem to include some extra builtin padding (even
		# more that the margin), so after <Heading>, decrement the BlankLines count
		if prevsib_map[node].tag == 'Heading':
			return '<br/>' * (int(node.get('count')))
		else:
			return '<br/>' * (int(node.get('count'))+1)
		
	elif node.tag == 'Highlight':
		if node_contains_block_elements(node):
			tagopen = 'div'
			close = '</div>'
		else:
			tagopen = 'span'
			close = '</span>'
			
		# use style if given, else use default highlight style
		if 'style' in node.keys():
			if wcontext.restricted_mode:
				# remove inline styling in safe mode (to remove XSS issues)
				html += '<%s>' % tagopen
			else:
				html += '<%s style="%s">' % (tagopen, node.get('style'))
		else:
			c = "%s-highlight" % css
			html += '<%s class="%s">' % (tagopen, strclass(c, add_classes))
			
	elif node.tag == 'Table':
		c = "%s-table" % css
		html += '<table class="%s">' % strclass(c, add_classes)
		close = '</table>'
		
	elif node.tag == 'TableCaption':
		c = "%s-caption" % css
		html += '<caption class="%s">' % strclass(c, add_classes)
		close = '</caption>'
		
	elif node.tag == 'TableRow':
		c = "%s-tr" % css
		html += '<tr class="%s">' % strclass(c, add_classes)
		close = '</tr>'

	elif node.tag == 'TableCell':
		if int(node.get('skip','0')):
			return ''

		if 'type' not in node.keys():
			raise WikError("Bad TableCell", xmltrace(parent_map[node]))
			
		if node.get('type') == 'data':
			tag = 'td'
			close = '</td>'
		else:
			tag = 'th'
			close = '</th>'
			
		style = 'text-align: %s;' % sanitize_text_align(node.get('text-align'))
		if 'bgcolor' in node.keys() and not wcontext.restricted_mode:
			style += 'background: %s;' % node.get('bgcolor')
			
		c = "%s-%s" % (css, tag)
		html += '<%s class="%s" colspan=%d rowspan=%d style="%s">' % \
				(tag, strclass(c, add_classes), int(node.get('colspan','1')), 
				int(node.get('rowspan','1')), style)						

	elif node.tag == 'DefinitionList':
		c = "%s-dl" % css
		html += '<dl class="%s">' % strclass(c, add_classes)
		close = '</dl>'
		
	elif node.tag == 'DefinitionEntry':
		# for XML structure only, no HTML rendering
		close = ''
		
	elif node.tag == 'DefinitionTerm':
		c = "%s-dt" % css
		html += '<dt class="%s">' % strclass(c, add_classes)
		close = '</dt>'
		
	elif node.tag == 'DefinitionDef':
		c = "%s-dd" % css
		html += '<dd class="%s">' % strclass(c, add_classes)
		close = '</dd>'
		
	elif node.tag == 'Link':
		# write entire block here and return
		linkelem = node.find('LinkElement')
		urlnode = node.find('LinkURL')
		linkurl = urlnode.find('Text').text
		
		if wcontext.restricted_mode:
			# if anything potentially unsafe in URL, don't make link. 
			if unsafe_url(linkurl):
				return '<span class="wikkly-highlight">Unsafe URL removed</span>'
				
		parts = urlparse(linkurl)
		if len(parts[0]) and len(parts[1]):
			helptext = 'Link to %s://%s' % (parts[0],parts[1])
		else:
			helptext = linkurl
			
		## don't use target=_blank for anchors
		#if wcontext.links_new_window and linkurl[0] != '#':
		if int(urlnode.get('new_window')):
			target = 'target="_blank"'
			linkclass = "%s-a-www" % css # style as external link
		else:
			target = ''
			linkclass = "%s-a-internal" % css # style as internal link

		linkclass = 'class="%s"' % strclass(linkclass, add_classes)
		
		# show domain next to link so user can see if it's suspicious
		# (skip if its a local link or relative link)
		if 0 and wcontext.restricted_mode and len(parts[0]) and len(parts[1]) and \
			linkurl[0] != '#' and parts[1][:7] != '127.0.0':
			#print "** ADDING DOMAIN",parts
			html += '<a title="%s" %s href="%s" %s>%s</a> [%s]' % \
					(helptext, linkclass, linkurl,
					target,
					# allow complex structure under LinkElement
					make_html(linkelem, wcontext, parent_map, prevsib_map, add_classes),
					('%s://%s' % (parts[0],parts[1])))

		else:
			html += '<a title="%s" %s href="%s" %s>%s</a>' % \
							(helptext, linkclass, linkurl,
								target,
								# allow complex structure under LinkElement
								make_html(linkelem, wcontext, parent_map, prevsib_map, add_classes))
		return html
		
	elif node.tag in ['LinkElement', 'LinkURL']:
		# no HTML for these - only for inner Text
		close = ''
		
	elif node.tag == 'Image':
		source = node.find('ImageSource').find('Text').text

		if wcontext.restricted_mode:
			# if anything potentially unsafe in URL, don't make link. 
			if unsafe_url(source):
				# don't apply add_classes
				return '<span class="wikkly-highlight">Unsafe image source removed</span>'
		
		url = None
		urlnode = node.find('ImageLinkURL')
		if urlnode is not None:
			url = urlnode.find('Text').text
		
		if wcontext.restricted_mode:
			# if anything potentially unsafe in URL, don't make link. 
			if url is not None and unsafe_url(url):
				# don't apply add_classes
				return '<span class="wikkly-highlight">Unsafe URL removed</span>'
			
		title = node.find('ImageTitle')
		if title is not None:
			title = title.find('Text').text
		
		if urlnode is not None:
			html += '<a href="%s" ' % url
			
			#if wcontext.links_new_window:
			if int(urlnode.get('new_window')):
				html += 'target="_blank" '
					
			if title is not None:
				html += 'title="%s" ' % title
			
			html += '>'
			
		c = "%s-img" % css
		html += '<img class="%s" src="%s">' % (strclass(c, add_classes), source)
		
		if urlnode is not None:
			html += '</a>'
		
		return html
		
	elif node.tag == 'CreateAnchor':
		name = node.find('Text')
		c = "%s-a-internal" % css # style as internal link
		html += '<a name="%s" class="%s"> </a>' % (name.text, strclass(c, add_classes))
		return html
		
	elif node.tag == 'MacroBlock':
		# <MacroBlock> is a block-level element created by a macro.
		
		# NOTE: The macro that created the element is responsible for not letting
		#       unsafe user-data be injected into 'class' and 'style'.

		html += '<div '
		if 'class' in node.keys():
			# NOTE - do NOT add 'css' prefix - assume macro has given full classname
			html += 'class="%s" ' % strclass(node.get('class'), add_classes)
			
		if 'style' in node.keys():
			html += 'style="%s" ' % node.get('style')
			
		html += '>'
		
		close = '</div>'
		
	elif node.tag == 'CSSBlock':
		c = "%s-%s" % (css, sanitize_classname(node.get('class')))
		if node_contains_block_elements(node):
			# CSS seems to behave better if these are in a DIV vs. SPAN
			html += '<div class="%s">' % strclass(c, add_classes)
			close = '</div>'
		else:
			html += '<span class="%s">' % strclass(c, add_classes)
			close = '</span>'
			
		# append class to inner nodes as well (handle here and return, for simplicity)
		add_classes.append('%s-%s' % (css,node.get('class')))
		for subnode in node:
			html += make_html(subnode, wcontext, parent_map, prevsib_map, add_classes)
	
		html += close
		add_classes.pop()
		return html
		
	elif node.tag == 'Separator':
		c = "%s-separator" % css
		html += '<hr class="%s"/>' % strclass(c, add_classes)
		close = ''
	
	elif node.tag == 'LineBreak':
		html += '<br/>'
		close = ''
		
	elif node.tag == 'DashChar':
		html += ' &mdash; '
		close = ''
		
	else:
		raise WikError("Bad tag %s" % node.tag)
		
	# if subnodes not handled already, handle them now
	for subnode in node:
		html += make_html(subnode, wcontext, parent_map, prevsib_map, add_classes)
		
	html += close
	
	return html
	
def WikklyText_XML_to_InnerHTML(wcontext, xml, encoding):
	"""
	Takes XML from WikklyContentToXML (or WikklyText_to_XML) and
	return HTML.
	
		wcontext = WikContext
		xml = XML (encoded bytestring)
		encoding = Desired output encoding (i.e. 'utf-8')
		
	Returns HTML as encoded bytestring.
	"""
	from wikklytext.base import WikContext
	from wikklytext import loadxml
	
	# turn XML into an ElementTree
	#sio = StringIO(xml)
	#tree = ElementTree(None, sio)
	#root = tree.getroot()
	root = loadxml(xml)
	
	#wcontext = WikContext(restricted_mode=safe_mode, 
	#						links_new_window=links_new_window,
	#						max_runtime=max_runtime)
	
	parent_map, prevsib_map = make_etree_map(root)
	
	return make_html(root, wcontext, parent_map, prevsib_map, []).encode(encoding)
	
def WikklyText_to_InnerHTML(text, encoding, safe_mode, setvars=None, 
							max_runtime=-1, url_resolver=None,
							tree_posthook=None, xml_posthook=None):
	"""
	One-step convenience to convert WikklyText to inner HTML (i.e. HTML
	without HTML header/footer.
	
		text = WikklyText, typically from wikklytext.base.load_wikitext()
		encoding = Desired output encoding (i.e. 'utf-8')
		safe_mode = True/False, whether to use Safe mode.
		setvars = Variables to set into WikContext, as dict of:
				     name: str, unicode or int
				   
				   'name' can have a leading '$' to set sysvars.
		max_runtime = Maximum time (in seconds) to run, or -1 for unlimited.
		url_resolver = URL resolver, see wikklytext.base for info.
		tree_posthook = Hook to call after ElementTree is complete, before
						generating XML. Will be called as:
							tree_posthook(rootnode, context)
							
						Hook should modify tree in-place.
		xml_posthook = Hook to get generated XML. Called as:
							xml_posthook(xml, context)
	Returns:
		(html, context)
		
		html = HTML, as encoded bytestring.
		context = WikContext used, in case caller wants to inspect it.
	"""
	from wikklytext import WikklyText_to_XML

	xml, context = WikklyText_to_XML(text, encoding, safe_mode, setvars, 
									max_runtime, url_resolver, tree_posthook)
		
	if xml_posthook is not None:
		xml_posthook(xml, context)
		
	# allow unlimited time here -- any unbounded recursions have already been handled above
	#return WikklyText_XML_to_InnerHTML(xml, encoding, safe_mode, links_new_window, max_runtime=-1)
	context.add_runtime(1000000)
	html = WikklyText_XML_to_InnerHTML(context, xml, encoding)
	return (html,context)
	
def WikklyText_to_HTML(text, encoding, safe_mode, setvars=None, 
						max_runtime=-1, url_resolver=None,
						tree_posthook=None, xml_posthook=None,
						stylesheet='css/wikklytext.css'):
	"""
	One-step convenience to convert WikklyText to full HTML (i.e. HTML
	including HTML header/footer, ready to be written to a .html file).
	
		text = WikklyText, typically from wikklytext.base.load_wikitext()
		encoding = Desired output encoding (i.e. 'utf-8')
		safe_mode = True/False, whether to use Safe mode.
		setvars = Variables to set into WikContext, as dict of:
				   {name: [Elements])
				   
				   'name' can have a leading '$' to set sysvars.
		max_runtime = Maximum time (in seconds) to run, or -1 for unlimited.
		url_resolver = URL resolver, see wikklytext.base for info.
		tree_posthook = Hook to call after ElementTree is complete, before
						generating XML. Will be called as:
							tree_posthook(rootnode, context)
							
						Hook should modify tree in-place.
		xml_posthook = Hook to get generated XML. Called as:
							xml_posthook(xml, context)
	Returns:
		(html, context)
		
		html = HTML, as encoded bytestring.
		context = WikContext used, in case caller wants to inspect it.
		
	** NOTE **
	
	This is more or less meant for "demo" purposes. Production code would
	likely use WikklyText_to_InnerHTML to build the pieces of the document
	in a customized layout, instead of using a one-shot function like this.
	"""
	inner, context = WikklyText_to_InnerHTML(text, encoding, safe_mode, setvars, 
						max_runtime, url_resolver, tree_posthook, xml_posthook)
	
	# see if wikitext set a $TITLE
	#e = wikklytext.coremacros.get(context, Text("$TITLE"))
	
	# grab first Text node
	#node = e.getiterator('Text')[0]
	#if len(node.text):
	#	title = node.text
	#else:
	#	title = None # don't set a title if empty

	title = var_get_text(context, '$TITLE')
	if not len(title):
		title = None # don't set a title if empty
	
	html = HTML_PRE(encoding, title, stylesheet=stylesheet) + inner + HTML_POST(encoding)
	return (html, context)
	
if __name__ == '__main__':
	import sys
	import wikklytext.base
	
	# change if desired ...
	ENCODING = 'utf-8'
	
	if len(sys.argv) < 2:
		buf = wikklytext.base.load_wikitext('simple.txt')
	else:
		buf = wikklytext.base.load_wikitext(sys.argv[1])

	html,context = WikklyText_to_HTML(buf, ENCODING, safe_mode=False)
	print html
	
	
