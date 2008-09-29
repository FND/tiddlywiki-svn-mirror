"""
wikklytext.util.py: Misc utilities. Part of the WikklyText suite.

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

import wikklytext.coremacros
from wikklytext.base import Text

def xmlhead(encoding='utf-8'):
	"Return XML stream header as unicode."
	return u'<?xml version="1.0" encoding="%s"?>\n' % encoding
	
def xml_escape(txt):
	"""
	This escaping is ONLY for writing to XML. When writing to HTML, different
	escaping is used.
	
	NOTES: 
		- ElementTree will unescape these automatically when parsing XML
		- Always use double quotes (") for attributes since that is what is escaped here. 
	"""
	return txt.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

def loadxml(xml):
	"""
	Load XML from buf as an ElementTree.
	
	xml can be either unicode or an encoded bytestring.
	
	Returns root Element of tree.
	"""
	from wikklytext.base import StringIO, ElementTree
	
	if isinstance(xml,unicode):
		xml = xml.encode('utf-8')
	
	sio = StringIO(xml)
	tree = ElementTree(None, sio)
	return tree.getroot()
	
# convenience functions for handling user/system variables.
# for internal use only, not callable from wikitexts.

def var_set_int(context, name, value):
	"Set a variable to an integer value."
	wikklytext.coremacros.set(context, Text(name), Text("%d" % value))
	
def var_set_text(context, name, text):
	"Set a variable to a text value (string or unicode)."
	wikklytext.coremacros.set(context, Text(name), Text(text))
	
def var_get_int(context, name):
	"Get a variable as an integer. Raises an exception if variable not an int."
	# get variable as element(s)
	e = wikklytext.coremacros.get(context, Text(name))

	# grab first Text node
	i = e.getiterator('Text')
	try:
		node = i.next() # cElementTree returns generator
	except AttributeError:
		node = i[0] # ElementTree returns list
		
	return int(node.text)

def var_get_text(context, name):
	"Get a variable as text."
	# get variable as element(s)
	e = wikklytext.coremacros.get(context, Text(name))
	
	# grab first Text node
	i = e.getiterator('Text')
	try:
		node = i.next() # cElementTree returns generator
	except AttributeError:
		node = i[0] # ElementTree returns list
		
	return node.text

def needs_base_url(url):
	# does this appear to be an absolute URL?
	# (I don't trust urlparse here since the URL may be malformed)
	
	# ensure no leading spaces
	url = url.lstrip()
	
	# does it look like: scheme:/path?
	if url.find(':') >= 0:
		if url.find('/') >= 0: 
			if url.find('/') > url.find(':'):
				return False # scheme:/path is absolute
		else:
			return False # scheme:something is absolute
			
	# '#name' does not need base URL
	if url[0] == '#':
		return False

	# '/path/thing' does not need base URL
	if url[0] == '/':
		return False
		
	# all others need base URL
	return True

def default_URL_resolver(url_fragment, base_url, site_url):
	"""
	Resolve an URL fragment to a complete URL.
	
		url_fragment = URL fragment from wikitext that needs 
					   to be resolved.
		base_url = Base URL to add, if resolver decides that
				   the fragment needs a base URL added.
		site_url = Resolver should substitute this for $SITE
		
	Returns:
		(url, is_external)
		
	Where:
		url: the resolved URL.
		is_external: does this URL point to an external document?
	"""
	# normalize url
	url = url_fragment.lstrip().rstrip().replace('\\','/')
	
	# replace $SITE with site URL
	url = url.replace('$SITE', site_url)

	# anchors are internal, all others are considered external
	# (Check vs. fragment, not full URL.)
	if url_fragment.lstrip()[0] == '#':
		is_external = False
	else:
		is_external = True
		
	if needs_base_url(url):
		return (base_url + url, is_external)
	else:
		return (url, is_external)

def get_CSS_element_names():
	"""
	Get names of all style elements (not *just* .css files).
	Returns basenames not full paths.
	"""
	return ('wikklytext.css', 'img_link_www.png', 'wikklytext.js', 'favicon.png')
	
def load_CSS_element(name):
	from pkg_resources import resource_string
	# load file as resource
	return resource_string('wikklytext','css/%s' % name)
	
def copy_CSS_elements(dest, overwrite=False):
	"""
	Copy all required style elements to a given directory.
	(Not just .css files, but all "extra" elements needed
	to render the generated pages.)
	
	'dest' can be:
		- A path (the elements will be copied here)
		- A filename whose path will be used as the destination path.
		
	Either way the path (but not necessarily the file) must exist.
	
	By default, existing elements will not be overwritten. Use 'overwrite=True'
	to force overwriting.
	"""
	import shutil, os
	
	# determine destination path
	if os.path.isdir(dest):
		destpath = dest
	else:
		destpath,name = os.path.split(dest) # assume it is a filename
		if not len(destpath):
			destpath = os.getcwd()
			
	# copy elements, do not overwrite unless asked
	#names = ['wikklytext.css', 'img_link_www.png']
	for name in get_CSS_element_names():
		# load file as resource
		#buf = resource_string('wikklytext','css/%s' % name)
		buf = load_CSS_element(name)
		
		fulldest = os.path.join(destpath, name)
		open(fulldest, 'wb').write(buf)
		
