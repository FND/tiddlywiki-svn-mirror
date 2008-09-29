"""
wikklytext.buildXML.py: Rendering of WikklyText to XML. Part of the WikklyText suite.

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

#import elementtree.ElementTree as etree
from wikklytext.parser import WikklyBaseContentParser
import re
from wikklytext.base import StringIO, WikError, xmltrace, ifelse, Text, \
				ElementTree, Element, SubElement, ElementList
import wikklytext.coremacros
from urlparse import urlparse
from wikklytext.util import var_get_text, var_get_int, xml_escape, xmlhead

class WikklyContentToXML(WikklyBaseContentParser):
	
	# There are three kinds of Text:
	#   Text = Escape &, <, >, and \n
	#   TextCode = Above plus escape spaces & tabs to preserve spacing
	#   TextHTML = Escape nothing (raw HTML)
	#
	# tag_to_texttag maps a parent tag to the Text* tag it uses.
	# If a tag is not listed here, it gets 'Text' (normal escaping).
	tag_to_texttag = {
		'CodeBlock': 'TextCode',
		'CodeInline': 'TextCode',
		'ErrorMessage': 'TextCode',
		'ErrorLookingAt': 'TextCode',
		'ErrorTrace': 'TextCode',
		
		'RawHTML': 'TextHTML',
		}

	any_text_tag = ('Text', 'TextCode', 'TextHTML')
	
	def __init__(self):
		self.parent_stack = []
		#self.set_default_base_url(default_base_url)
		self.errors_list = []
		
	def set_context(self, wcontext):
		self.context = wcontext
		
	def cur_text_tag(self):
		"What Text* tag should be used for current node?"
		if self.curnode.tag in self.any_text_tag:
			return self.tag_to_texttag.get(self.parent_stack[-1].tag, 'Text')
		else:
			return self.tag_to_texttag.get(self.curnode.tag, 'Text')
			
	#def set_default_base_url(self, url):
	#	# ensure trailing /
	#	if len(url) and url[-1] != '/':
	#		url = url + '/'
	#		
	#	self.default_base_url = url

	def default_base_url(self):
		"Returns $BASE_URL as text, WITH trailing /"
		#e = wikklytext.coremacros.get(self.context, Text("$BASE_URL"))

		# grab the first Text node in case it became an auto-URL
		#node = e.getiterator('Text')[0]
		#url = node.text
		
		url = var_get_text(self.context, '$BASE_URL')
		
		# ensure trailing /
		if len(url) and url[-1] != '/':
			url = url + '/'
					
		return url

	def get_site_url(self):
		"Returns $SITE_URL as text, WITHOUT trailing /"
		#e = wikklytext.coremacros.get(self.context, Text("$SITE_URL"))

		# grab the first Text node in case it became an auto-URL
		#node = e.getiterator('Text')[0]
		#url = node.text
		
		url = var_get_text(self.context, '$SITE_URL')
		
		# ensure no trailing /
		if len(url) and url[-1] == '/':
			url = url[:-1]
			
		return url
		
	def makenew(self):
		"Make a new parser like this one."
		p = WikklyContentToXML()
		p.set_context(self.context)
		return p
		
	def beginDoc(self):
		self.rootnode = Element("WikklyContent")
		self.curnode = self.rootnode
		# collect all errors under this element - mixing them with
		# content can cause problems
		self.pushnew('ErrorsList')
		self.popnode('ErrorsList')
		# content goes here
		self.pushnew('Content')
		
	def endDoc(self):
		# if no errors, remove ErrorsList element
		node = self.rootnode.find('ErrorsList')
		if not len(node):
			self.rootnode.remove(node)	

		# make sure there is at least one node under <Content>
		node = self.rootnode.find('Content')
		if len(node) == 0:
			# add an empty Text node, simplifies other code
			# to always have at least one node under <Content>
			node.append(Text(""))
			
	def getInnerResult(self):
		"""
		Returns 'inner' result, i.e. without header nodes.

		Returns an Element with the result elements as subnodes (you should
		not use the top Element, it is just a container. (An Element is returned
		because it acts both like a list and lets you do .find(), etc. as needed.)
		"""
		outnode = ElementList()
		for node in self.rootnode.find('Content'):
			outnode.append(node)
			
		return outnode

	def getErrors(self):
		"Return current error list, in same format that 'addParserErrors' accepts."
		errors = self.rootnode.find('ErrorsList')
		if errors is None:
			return []
		else:
			return errors

	def addParserResult(self, elements):
		"Nodes returned from a macro - add to current parent node."
		
		if self.curnode.tag in self.any_text_tag:
			# Text nodes have no children, really want to add to parent
			self.curnode = self.parent_stack.pop()
			
		for e in elements:
			self.curnode.append(e)		
		
	def addParserErrors(self, errors):
		errlist = self.rootnode.find('ErrorsList')
		
		for node in errors:
			errlist.append(node)
			
	def getRoot(self):
		"""
		Get root node of generated tree.
		"""
		return self.rootnode
		
	def getXML(self, encoding):
		"""
		Get result as XML.
		
		encoding = Specifies encoding.
		"""
		#xml = u'<?xml version="1.0" encoding="%s"?>\n' % encoding
		xml = xmlhead(encoding) + self.get_xml_tags(self.rootnode, 0)
		return xml.encode(encoding)
	
	def xml_remove_badchars(self, txt):
		"""
		Remove illegal values from unicode string 'txt'.
		Returns cleaned up string.
		
		Note: I prefer removing to replacing since this helps prevent injection
		      by someone doing e.g. 'java\x00script'
		"""
		from xmlmap import usplit, is_legal_xml_char
		out = u''
		for c in usplit(txt):
			if is_legal_xml_char(c):
				out += c
				
		return out
		
	def get_xml_tags(self, node, indent):
		# indentation offset
		IOFS = u'   '
		
		# only Text* nodes can have ".text". They can have no attributes.
		if node.tag in self.any_text_tag:
			txt = xml_escape(self.xml_remove_badchars(node.text))
			xml = u'%s<%s>%s</%s>\n' % (indent*IOFS, node.tag, txt, node.tag)
		else:
			xml = u'%s<%s' % (indent*IOFS, node.tag)
			for key,val in node.items():
				if not isinstance(val, unicode):
					val = unicode(str(val)) # an integer, etc.
					
				# CAREFUL! Use " for attr quoting since that is what is escaped in xml_escape().
				xml += u' %s="%s"' % (key,xml_escape(self.xml_remove_badchars(val)))
		
			# if no subnodes, make self-closing for brevity
			if not len(node):
				xml += u'/>\n'
				return xml
				
			xml += u'>\n'
			
			for subnode in node:
				xml += self.get_xml_tags(subnode, indent+1)
		
			xml += u'%s</%s>\n' % (indent*IOFS, node.tag)
			
		return xml
		
	def pushnew(self, tag):
		"Make new node 'tag' as a child of self.curnode - self.curnode is pushed to stack."
		#print "START NEW ",tag
		
		if self.curnode.tag in self.any_text_tag:
			# Text nodes have no children, really want to add to parent
			self.curnode = self.parent_stack.pop()
		
		self.parent_stack.append(self.curnode)
		self.curnode = SubElement(self.curnode, tag)
		
	def popto(self, tag):
		"""
		Pop until tag is in .curnode.
		"""
		#print "POPTO ",tag
		
		#while self.curnode.tag != tag:
		# self.curnode = self.parent_stack.pop()
		
		# if inside Text, pop
		if self.curnode.tag in self.any_text_tag:
			self.curnode = self.parent_stack.pop()
			
		# might be at tag already
		#if self.curnode.tag == tag:
		#	return
			
		# if .tag NOT next on stack, then there has been a nesting error
		#if self.parent_stack[-1].tag != tag:
		if self.curnode.tag != tag:
			msg = "NESTING ERROR, trying to pop %s, found %s\n" % (tag, self.curnode.tag)
			msg += "Stack from parent:\n"
			msg += self.get_xml_tags(self.parent_stack[-1], 1)
			self.error(msg)
			return
			#raise Exception("Nesting error - popping %s, found %s" % (tag,self.parent_stack[-1].tag))
			
		# bring tag to curnode
		#self.curnode = self.parent_stack.pop()
			
	def popnode(self, tag):
		"""
		Finishes node tagged 'tag' and sets self.curnode to its parent.
		"""
		#print "POPNODE ",tag
		#print "POP ",tag
		# might be in Text, so make sure to pop correct tag
		#while self.curnode.tag != tag:
			#print "POPPING ",self.curnode.tag
		#	self.curnode = self.parent_stack.pop()
		
		# pop till tag is curnode
		self.popto(tag)
			
		#print "POPPING ",self.curnode.tag
		self.curnode = self.parent_stack.pop()
		#print "CUR NOW",self.curnode.tag
		
	def pushpop(self, tag):
		"Push new node under curnode and immediately pop it off"
		self.pushnew(tag)
		self.popnode(tag)
		
	def findup(self, tag):
		"""
		Look upwards in parent stack to find tag. Returns Element or None if not found.
		Does not modify stack or curnode.
		"""
		#print "FINDUP ",tag, "START @ ",self.parent_stack[0].tag,self.parent_stack
		for i in range(len(self.parent_stack)):
			node = self.parent_stack[-1*(i+1)]
			if node.tag == tag:
				return node
				
		return None
		
	def getup(self):
		"Get first non-Text* parent in stack."
		i = -1
		while self.parent_stack[i].tag in self.any_text_tag:
			i -= 1
			
		return self.parent_stack[i]
		
	def beginBold(self): self.pushnew('Bold')	
	def endBold(self): self.popnode('Bold')
	
	def beginItalic(self): self.pushnew('Italic')	
	def endItalic(self): self.popnode('Italic')

	def beginStrikethrough(self): self.pushnew('Strikethrough')
	def endStrikethrough(self): self.popnode('Strikethrough')
	
	def beginUnderline(self): self.pushnew('Underline')
	def endUnderline(self): self.popnode('Underline')
	
	def beginSuperscript(self): self.pushnew('Superscript')
	def endSuperscript(self): self.popnode('Superscript')

	def beginSubscript(self): self.pushnew('Subscript')
	def endSubscript(self): self.popnode('Subscript')

	def beginHighlight(self, style=None):
		#print "BEGIN HIGHLIGHT ",repr(style)
		# supported highlight styles:
		#	1. @@text@@ - (style=None) - Apply standard highlight
		#   2. @@prop1: style one; prop2: style two; ... ; items@@ - Apply given style to items.
		#   3. @@color(color): ...@@ - Apply color
		#   4. @@bgcolor(color): .. @@ - Apply background color
	
		self.pushnew('Highlight')
		if style is not None:
			# try parsing case #2 (sync w/wikklytext.lexer:t_HIGHLIGHT_CSS)
			#m2 = re.match('@@((\s*[a-zA-Z]\S+\s*:\s*\S+\s*;)+)', style)
			m2 = re.match('@@((\s*[a-zA-Z][a-zA-Z0-9-]*\s*:.+?;)+)', style)
			             
			# case #3
			m3 = re.match(r'@@color\((.+?)\):', style)
			
			# case #4
			m4 = re.match('@@bgcolor\((.+?)\):', style)
			
			# set style info into Highlight node; place text in Text under it
			
			if m2:
				# @@prop1: style1; prop2: style2; ... ;
				style = m2.group(1)				
			elif m3:
				# @@color(..): ... @@
				style = "color: %s;" % m3.group(1)				
			elif m4:
				# @@bgcolor(..): ... @@
				style = "background: %s;" % m4.group(1)							
			else:
				raise WikError("Unknown style: %s" % repr(style))
				
			if style is not None:
				self.curnode.set('style', style)
				
	def endHighlight(self):
		self.popnode('Highlight')
		
	def beginNList(self): self.pushnew('NumberedList')		
	def endNList(self): self.popnode('NumberedList')
		
	def beginNListItem(self, marker):
		nr = len(marker)
		if nr > 6:
			nr = 6
			
		self.pushnew('NumberedListItem')
		self.curnode.set('level', nr)
		
	def endNListItem(self):
		self.popnode('NumberedListItem')
		
	def beginUList(self):
		self.pushnew('UnnumberedList')
		
	def endUList(self):
		self.popnode('UnnumberedList')
		
	def beginUListItem(self, marker):
		nr = len(marker)
		if nr > 6:
			nr = 6
			
		self.pushnew('UnnumberedListItem')
		self.curnode.set('level', nr)
		
	def endUListItem(self):
		self.popnode('UnnumberedListItem')

	def beginHeading(self, level):
		self.pushnew('Heading')
		# max 6 levels
		if level > 6:
			level = 6
			
		self.curnode.set('level', level)
		
	def endHeading(self):
		self.popnode('Heading')
			
	def beginBlockIndent(self):
		self.pushnew('BlockIndent')
		
	def endBlockIndent(self):
		self.popnode('BlockIndent')
		
	def beginLineIndent(self):
		self.pushnew('LineIndent')
		
	def endLineIndent(self):
		self.popnode('LineIndent')
		
	def beginLink(self):
		self.pushnew('LinkTemp')
		self.pushnew('LinkPart')
							
	def make_full_url(self, url):
		"""
		Resolve an URL fragment to a full URL, using an
		external resolver, if defined.
		
		Returns:
			(URL, is_external)
			
		Where:
			URL = Resolved URL
			is_external = True/False, whether URL points to an external document.
		"""
		# use external resolver, if defined
		#print "URL RESOLVED",self.context.url_resolver
		if self.context.url_resolver is not None:
			newurl,is_external = self.context.url_resolver(url, 
									self.default_base_url(),
									self.get_site_url())
									
			if newurl is not None:
				#print "CUSTOM RESOLVED TO",newurl
				return (newurl,is_external) # custom resolver handled it
				
		# use default resolver
		from wikklytext.util import default_URL_resolver
		return default_URL_resolver(url, 
					self.default_base_url(),
					self.get_site_url())
								
	def endLink(self):
		self.popnode('LinkPart')
		self.popto('LinkTemp')
		
		#print "PARSE LINK:"
		#print xmltrace(self.curnode)
		
		# collect all Text ignoring anything else
		#text = ''
		#for node in self.curnode:
		#	if node.tag == self.cur_text_tag():
		#		text += node.text
		
		# delete LinkTemp and create final node
		#node = self.curnode
		#self.popnode('LinkTemp')
		#self.curnode.remove(node)

		# accepted link formats:
		#    1. TiddlyWiki standard: [[Link Text|URL]]
		#    2. Create an anchor: [[#Anchor Name]]
		#    3. Link to anchor: [[Link Text|#Anchor Name]]
		#    4. TiddlyWiki link to another tiddler: [[TiddlerName]]
		#       (TW does NOT allow any other URL in this form!)
		#
		# Note: I get the text without the "[[" and "]]"

		# case 1 & 3 will have two <LinkParts>, cases 2 & 4 will only have one
		if len(self.curnode) == 2: # case 1 or 3
			# create new link - will put in tree below
			newlink = Element('Link')
				
			linkel = SubElement(newlink, 'LinkElement')
			# first <LinkPart> goes here
			for node in self.curnode[0]:
				linkel.append(node)
				
			# second <LinkPart> is only allowed to be Text
			text = [node.text for node in self.curnode[1].getiterator() if node.tag in self.any_text_tag]
			text = ''.join(text)

			# if URL appears to be relative, add my base URL
			#parts = urlparse(text)
			#print "GOT URL %s<p>" % repr(text)
			#scheme = parts[0]
			#server = parts[1]
			#if ('/' not in text) and ('#' not in text) and (not re.match('mailto',text)) and \
			#	len(scheme) == 0 and len(server) == 0:
			#	text = self.default_base_url() + text

			full_url, url_is_external = self.make_full_url(text)
			
			#print "PROCESSED = %s<p>" % repr(text)
			linkurl = SubElement(newlink, 'LinkURL')
			url = SubElement(linkurl, 'Text')
			url.text = full_url
			
			# decide if link should open a new window. internal URLs will open 
			# in the same window, regardless of $LINKS_NEW_WINDOW.
			if var_get_int(self.context, '$LINKS_NEW_WINDOW') and url_is_external:
				linkurl.set('new_window', '1')
			else:
				linkurl.set('new_window', '0')

			# replace LinkTemp with newlink
			node = self.curnode
			self.popnode('LinkTemp')
			self.curnode.remove(node)
			self.curnode.append(newlink)
			
		elif len(self.curnode) == 1: # case 2 or 4
			# <LinkPart> is only allowed to be Text here
			text = [node.text for node in self.curnode[0].getiterator() if node.tag in self.any_text_tag]
			text = ''.join(text)

			# replace LinkTemp with new link or anchor
			node = self.curnode
			self.popnode('LinkTemp')
			self.curnode.remove(node)
		
			# case 2: [[#ANCHOR]]
			if text[0] == '#':
				self.pushnew('CreateAnchor')
				self.characters(text[1:]) # remove leading '#'
				self.popnode('CreateAnchor')
			# case 4: [[TiddlerName]]
			else:
				# the external resolver had better know what to do,
				# otherwise the link will make no sense
				full_url, url_is_external = self.make_full_url(text)
				newlink = Element('Link')

				# eventual format is: <a href='..resolved..'>TiddlerName</a>
				linkel = SubElement(newlink, 'LinkElement')
				linkel.append(Text(text))
				linkurl = SubElement(newlink, 'LinkURL')
				url = SubElement(linkurl, 'Text')
				url.text = full_url
				
				if var_get_int(self.context, '$LINKS_NEW_WINDOW') and url_is_external:
					linkurl.set('new_window','1')
				else:
					linkurl.set('new_window', '0')

				self.curnode.append(newlink)				
							
#		# case #2
#		m2 = re.match('\s*\#\s*(.+)\s*$', text)
#
#		# case #4:
#		m4 = re.match('\s*\$(\S+)=(.+)$', text)
#		
#		if m4:
#			# set variable
#			if m4.group(1) == 'BASE_URL':
#				self.set_default_base_url(m4.group(2))
#			else:
#				raise Exception("Trying to set unknown variable '$%s'" % m4.group(1))
#		
#		if m2:
#			# case #2, creating anchor
#			#self.cur_html = '<a name="%s"> </a>' % m2.group(1)
#			self.pushnew('CreateAnchor')
#			self.characters(m2.group(1))
#			self.popnode('CreateAnchor')
#			
#		if not m4 and not m2:
#			# Case #1 & #3 (URL will already have '#' for anchor, so use as-is in either case)
#			try:
#				name,url = text.split('|')			
#	
#				# if URL appears to be relative, add my base URL
#				if ('/' not in url) and ('#' not in url) and (not re.match('mailto',url)):
#					url = self.default_base_url + url
#	
#				self.pushnew('Link')
#				self.pushnew('LinkElement')
#				self.characters(name)
#				self.popnode('LinkElement')
#				self.pushnew('LinkURL')
#				self.characters(url)
#				self.popnode('LinkURL')
#				self.popnode('Link')
#			except:
#				self.error("Badly formed URL", text, '')

	def linkSeparator(self):
		# end current <LinkPart> and start new one
		self.popnode('LinkPart')
		self.pushnew('LinkPart')
		
	def beginImgLink(self):
		self.pushnew('ImgLinkTemp')
		self.pushnew('LinkPart')
		
	def collect_text(self, node):
		# collect all text under given node, return as string
		return ' '.join([sub.text for sub in node if sub.tag in self.any_text_tag])
		
	def endImgLink(self):
		self.popnode('LinkPart')
		self.popto('ImgLinkTemp')

		# collect all Text ignoring anything else
		#text = ''
		#for node in self.curnode:
		#	if node.tag == self.cur_text_tag():
		#		text += node.text
		#
		#print "IMG TEXT",text
		
		# Four formats to handle:
		#	[img[title|filename]]
		#   [img[title|filename][link]]
		#   [img[filename]]
		#   [img[filename][link]]
		#
		# I get them without the "[img[" and final "]]"
		# Cases 1 & 2 will have two <LinkPart> elements
		# Cases 3 and 4 will have one <LinkPart>

		if len(self.curnode) == 2:
			#print "CASE 1/2"
			#print "   PART 1",xmltrace(self.curnode[0])
			#print "   PART 2",xmltrace(self.curnode[1])			
			# decide if I have 'filename' or 'filename][link]'
			m = re.match(r'(.+)\]\[(.+)', self.collect_text(self.curnode[1]))
			if m:
				# case 2
				title = self.collect_text(self.curnode[0])
				filename = m.group(1)
				url = m.group(2)
			else:
				# case 1
				title = self.collect_text(self.curnode[0])
				filename = self.collect_text(self.curnode[1])
				url = None
				
		elif len(self.curnode) == 1:
			#print "CASE 3/4"
			#print "   PART",xmltrace(self.curnode[0])
			# see if I have "filename][link]"
			m = re.match(r'(.+)\]\[(.*)', self.collect_text(self.curnode[0]))
			if m:
				# case 4
				title = None
				filename = m.group(1)
				url = m.group(2)
			else:
				# case 3
				title = None
				filename = self.collect_text(self.curnode[0])
				url = None
				
		else:
			raise WikError("Wrong # of link parts")
			
		# delete LinkTemp and create final node
		node = self.curnode
		self.popnode('ImgLinkTemp')
		self.curnode.remove(node)

		# create node
		self.pushnew('Image')
		
		# if URL appears to be relative, add my base URL
		if url is not None:
			#if ('/' not in url) and ('#' not in url):
			#	url = self.default_base_url() + url

			full_url, url_is_external = self.make_full_url(url)

			self.pushnew('ImageLinkURL')
			
			# set 'new_window' attribute, like in normal links
			if var_get_int(self.context, '$LINKS_NEW_WINDOW') and url_is_external:
				self.curnode.set('new_window', '1')
			else:
				self.curnode.set('new_window', '0')

			self.characters(full_url)
			self.popnode('ImageLinkURL')
			
		# if filename appears to be relative, add my base URL	
		#if ('/' not in filename):
		#	filename = self.default_base_url() + filename

		filename, is_external = self.make_full_url(filename)
		
		self.pushnew('ImageSource')
		self.characters(filename)
		self.popnode('ImageSource')
		
		if title is not None:
			self.pushnew('ImageTitle')
			self.characters(title)
			self.popnode('ImageTitle')

		self.popnode('Image')
		
	def beginCodeBlock(self):
		self.pushnew('CodeBlock')
		
	def endCodeBlock(self):
		self.popnode('CodeBlock')
		
	def beginCodeInline(self):
		self.pushnew('CodeInline')
		
	def endCodeInline(self):
		self.popnode('CodeInline')
	
	def beginTable(self):
		self.pushnew('Table')
		
	def endTable(self):
		self.popto('Table')
		#print "END TABLE, nodes = "
		#for n in self.curnode.getiterator():
		#	print n.tag
		
		# if there is a caption, it must be the first tag after <Table>, so
		# find and move it if needed
		caption = self.curnode.find('TableCaption')
		if caption is not None:
			self.curnode.remove(caption)
			self.curnode.insert(0, caption)
			
		self.popnode('Table')
		
	def setTableCaption(self, txt):
		# self-closing, just make a Text node holding caption
		self.pushnew('TableCaption')
		self.characters(txt)
		self.popnode('TableCaption')
		
	def beginTableRow(self):
		self.pushnew('TableRow')
		
	def endTableRow(self):
		self.popto('TableRow')
		
		# iterate over TableCells and set colspans
		span = 1
		for cell in self.curnode:
			if self.cell_is_colskip(cell):
				span += 1
			else:
				if span > 1: # don't show 'colspan=1' - too verbose
					cell.set('colspan', span)
					span = 1
	
		# iterate over TableCells and set rowspans
		for (i,cell) in enumerate(self.curnode):
			# find a cell with '~' then scan upwards and rowspan+=1 on first non-'~' cell
			if not self.cell_is_rowskip(cell):
				continue
				
			# get ith column
			column = self.get_table_column(i)
			column.reverse() # I am now the 0th item
			# find first cell that's not a rowskip
			for icell in column[1:]:
				if icell is None:
					continue # skip missing columns
					
				if not self.cell_is_rowskip(icell):
					n = int(icell.get('rowspan','1'))
					icell.set('rowspan', n+1)
					break
					
		self.popnode('TableRow')
	
	def beginTableCell(self):
		self.pushnew('TableCell')
		
	def is_header_cell(self, node):
		"Is this TableCell a header cell?"
		txt = self.cell_leading_text(node).lstrip()
		return (len(txt) and txt[0] == '!')
	
	def cell_strip_heading_char(self, node):
		"Strip ! from leading text in cell."
		txt = self.cell_leading_text(node)
		m = re.match('(\s*)[\!]+(.*)', txt)
		if m:
			txt = m.group(1) + m.group(2)
			self.set_cell_leading_text(node, txt)
			
	def cell_leading_text(self, node):
		"Return leading text from cell, or '' if no Text node at start."
		if len(node) and node[0].tag == self.cur_text_tag():
			return node[0].text
		else:
			return ''
		
	def set_cell_leading_text(self, node, text):
		if len(node) and node[0].tag == self.cur_text_tag():
			node[0].text = text
		else:
			# no existing Text*, insert one
			sub = Element(self.cur_text_tag())
			sub.text = text
			node.insert(0, sub)
			
	def cell_trailing_text(self, node):
		"Return trailing text from cell, or '' if no Text node at end."
		if len(node) and node[-1].tag == self.cur_text_tag():
			return node[-1].text
		else:
			return ''
		
	def get_cell_alignment(self, node):
		"Calculate text alignment for TableCell node. Returns 'left', 'center', or 'right'"
		head = self.cell_leading_text(node)
		tail = self.cell_trailing_text(node)
		headsp = ifelse(re.match('^\s+', head), True, False)
		tailsp = ifelse(re.match('.*\s+$', tail), True, False)
		if self.is_header_cell(node):
			# per tiddlywiki, nospace == center justify (for headers)
			if (not headsp and not tailsp) or (headsp and tailsp):
				return 'center'
			elif not headsp and tailsp:
				return 'left'
			else:
				return 'right'
		else:
			# per tiddlywiki, nospace == left justify (for data cells)
			if headsp and tailsp:
				return 'center'
			elif (not headsp and tailsp) or (not headsp and not tailsp):
				return 'left'
			else:
				return 'right'

	def cell_is_colskip(self, node):
		"Is TableCell a column skip ('>')?"
		# must have a single Text subnode and exactly '>' as text
		return (len(node) == 1 and node[0].tag == self.cur_text_tag() and node[0].text == '>')
		
	def cell_is_rowskip(self, node):
		"Is TableCell a row skip ('~')?"
		# must have a single Text subnode and exactly '~' as text
		return (len(node) == 1 and node[0].tag == self.cur_text_tag() and node[0].text == '~')

	def get_table_column(self, i):
		"""
		Get the i'th column as a list of TableCells. Some entries may be None if there
		are short rows in the table.
		
		NOTE: curnode must be somewhere inside the Table when calling this.
		"""
		#print "cur is ",self.curnode.tag
		collist = []
		table = self.findup('Table')
		for row in table:
			try:
				collist.append(row[i])
			except IndexError:
				collist.append(None) # short row - add None

		return collist
	
	def endTableCell(self):
		# bring TableCell back to self.curnode
		self.popto('TableCell')

		# look for bgcolor() in leading text (do this BEFORE other calcs)
		text = self.cell_leading_text(self.curnode)
		m = re.match(r'\s*bgcolor\((.+?)\):(\s*.*?\s*)$', text)
				
		# did I get bgcolor()
		if m:
			self.curnode.set('bgcolor', m.group(1))
			self.set_cell_leading_text(self.curnode, m.group(2))
					
		if self.is_header_cell(self.curnode):
			self.curnode.set('type', 'header')
		else:
			self.curnode.set('type', 'data')
			
		self.curnode.set('text-align', self.get_cell_alignment(self.curnode))
		
		# remove leading '!' now that I've calculated type & alignment
		self.cell_strip_heading_char(self.curnode)
		
		# skipped cell?
		if self.cell_is_colskip(self.curnode) or self.cell_is_rowskip(self.curnode):
			self.curnode.set('skip', '1')
		
		# TableCell done
		self.popnode('TableCell')
	
	# General note on DefinitionList: Even though it doesn't matter for HTML
	# rendering, I make sure here that the XML is well-formed, inserting missing
	# term/definitions as needed.
	def beginDefinitionList(self):
		self.pushnew('DefinitionList')
		self.pushnew('DefinitionEntry')
		
	def endDefinitionList(self):
		# watch for missing definition at end
		self.popto('DefinitionEntry')
		if len(self.curnode) == 1:
			# add empty def
			self.pushpop('DefinitionDef')
			
		self.popnode('DefinitionEntry')
		self.popto('DefinitionList')
		# check for empty entry at end
		entry = self.curnode[-1]
		if not len(entry):
			self.curnode.remove(entry)
			
		self.popnode('DefinitionList')
		
	def beginDefinitionTerm(self):
		# if current DefinitionEntry already has one subnode, then
		# I have a lone term missing a definition. add empty definition
		# and make new empty element first.
		if len(self.curnode) == 1:
			self.pushnew('DefinitionDef')
			self.popnode('DefinitionDef')
			self.popnode('DefinitionEntry')
			self.pushnew('DefinitionEntry')
			
		self.pushnew('DefinitionTerm')
		
	def endDefinitionTerm(self):
		self.popnode('DefinitionTerm')
		
	def beginDefinitionDef(self):
		# if current DefinitionEntry has no subnodes, then the term is
		# missing. add empty term first.
		if len(self.curnode) == 0:
			self.pushpop('DefinitionTerm')
			
		self.pushnew('DefinitionDef')
		
	def endDefinitionDef(self):
		self.popnode('DefinitionDef')
		self.popnode('DefinitionEntry')
		self.pushnew('DefinitionEntry')
		
	def beginCSSBlock(self, classname):
		self.pushnew('CSSBlock')
		# classname is safe (see lexer): [a-zA-Z_-]
		self.curnode.set('class', classname)
		
	def endCSSBlock(self):
		self.popnode('CSSBlock')
		
	def beginRawHTML(self):
		self.pushnew('RawHTML')
		
	def endRawHTML(self):
		# should have: <RawHTML><TextHTML> ... </TextHTML></RawHTML>
		# remove the 'RawHTML' tag, promoting the TextHTML. (<RawHTML> was
		# only needed in order to create the correct type of <Text> node.
		# Can discard now since <TextHTML> captures everything.)
		self.popto('RawHTML')
		
		# sanity
		if len(self.curnode) != 1 or self.curnode[0].tag != 'TextHTML':
			raise WikError("Internal error - bad nodes under <RawHTML>")
		
		rawnode = self.curnode
		txt = self.curnode[0]
		
		self.popnode('RawHTML')
		self.curnode.remove(rawnode)
		self.curnode.append(txt)
		
	def separator(self):
		self.pushpop('Separator')
		
	def EOLs(self, txt):
		#e = wikklytext.coremacros.get(self.context, Text("$REFLOW"))
		#if len(e) != 1 or e[0].tag != 'Text':
		#	raise WikError("Bad value for $REFLOW")
		#	
		#reflow = int(e[0].text)
		
		reflow = var_get_int(self.context, '$REFLOW')
		
		if reflow:
			if len(txt) > 1:
				self.pushnew('BlankLines')
				self.curnode.set('count', len(txt)-1)
				self.popnode('BlankLines')
			else:
				self.characters(' ')
		else:
			for i in range(len(txt)):
				self.linebreak()
			
	def linebreak(self):
		self.pushpop('LineBreak')
		
	def dash(self):
		self.pushpop('DashChar')
		
	def characters(self, txt):
		if self.curnode.tag not in self.any_text_tag:
			# start correct type of Text* tag based on parent content type
			self.pushnew(self.cur_text_tag())
			self.curnode.text = ''
			
		self.curnode.text += txt
	
	def error(self, message, looking_at=None, trace=None):
		self.pushnew('Error')
		
		if len(message):
			self.pushnew('ErrorMessage')
			self.characters(message)
			self.popnode('ErrorMessage')
			
		if looking_at is not None and len(looking_at):
			self.pushnew('ErrorLookingAt')
			self.characters(looking_at)
			self.popnode('ErrorLookingAt')
			
		if trace is not None and len(trace):
			self.pushnew('ErrorTrace')
			self.characters(trace)
			self.popnode('ErrorTrace')
			
		self.popto('Error')
		node = self.curnode
		self.popnode('Error')
		self.curnode.remove(node)
		elist = self.rootnode.find('ErrorsList')
		elist.append(node)
		
def WikklyText_to_XML(content, encoding, safe_mode, setvars=None, 
						max_runtime=-1, url_resolver=None,
						tree_posthook=None):
	"""
	Convenience to convert the given wikklytext to XML.
	
		content = Wikitext (*unicode*), usually from wikklytext.base.load_wikitext().
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
	Returns:
		(xml, context)
		
	Where:
		xml = Generated XML as an encoded bytestring
		context = WikContext that was used, in case user wants to inspect it.
	"""
	from wikklytext.lexer import WikklyContentLexer
	from wikklytext.base import WikContext
	#import wikklytext.coremacros
	from wikklytext.util import var_set_int, var_set_text
	
	setvars = setvars or {}
	
	wcontext = WikContext(restricted_mode=safe_mode,	
							max_runtime=max_runtime,
							url_resolver=url_resolver)
	
	for name, value in setvars.items():
		#wikklytext.coremacros.set(wcontext, Text(name), *elements)
		if isinstance(value, (str,unicode)):
			var_set_text(wcontext, name, value)
		elif isinstance(value, int):
			var_set_int(wcontext, name, value)
		else:
			raise WikError("Bad value in setvars")
		
	lexer = WikklyContentLexer()
	parser = WikklyContentToXML()
	wcontext.parser = parser
	parser.set_context(wcontext)	
	lexer.parse(content, wcontext)
	
	# call hook to postprocess tree before making XML
	if tree_posthook is not None:
		tree_posthook(parser.getRoot(), wcontext)
		
	xml = parser.getXML(encoding)

	return (xml, wcontext)
	
if __name__ == '__main__':
	import sys
	import wikklytext.base
	from wikklytext import loadxml
	
	if len(sys.argv) < 2:
		buf = wikklytext.base.load_wikitext('simple.txt')
	else:
		buf = wikklytext.base.load_wikitext(sys.argv[1])
		
	xml, context = WikklyText_to_XML(buf, 'utf-8', False)
	print xml
	
	# reparse as a sanity check
	#sio = StringIO(xml)
	#tree = ElementTree(None, sio)
	loadxml(xml)
	
