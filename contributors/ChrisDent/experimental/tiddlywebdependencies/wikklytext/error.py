"""
wikklytext.error.py: Error handling. Part of the WikklyText suite.

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

import sys, cgitb
from wikklytext.base import escape_text_for_html

def exception_to_text(exc_info=None):
	"Return current exception as text, or '' if no current exception."
	if exc_info is None:
		exc_info = sys.exc_info()
	
	if exc_info[0] is None:
		return '' # no current exception
		
	if hasattr(cgitb, 'text'):
		txt = cgitb.text(exc_info)
	else:
		# eariler Pythons lack .text() ...
		# this will be ugly, but its the best I can safely do
		txt = cgitb.html(exc_info)

	return txt
	
def exception_to_html(exc_info, html_pre, html_post, encoding):
	"""
	Convert exception to HTML.
	"""
	from wikklytext.base import WikContext, log_content
	from wikklytext.buildXML import WikklyContentToXML
	import sys
	from wikklytext.buildHTML import WikklyText_XML_to_InnerHTML
	
	txt = exception_to_text(exc_info)
	
	wcontext = WikContext(restricted_mode=False)
	p = WikklyContentToXML()
	wcontext.parser = p
	p.set_context(wcontext)

	p.beginDoc()
	p.error('Unhandled Exception', None, txt)
	p.endDoc()
	
	xml = p.getXML(encoding)
	
	#inner = WikklyText_XML_to_InnerHTML(xml, encoding, safe_mode=False)
	inner = WikklyText_XML_to_InnerHTML(WikContext(restricted_mode=False), xml, encoding)
	
	log_content(unicode(xml,encoding), inner)
	
	xhtml = (html_pre + inner + html_post).encode(encoding)
	
	return xhtml
	
def exception_to_html_exit(exc_info, html_pre, html_post, encoding, outname=None):
	"""
	Convert exception to HTML and exit with error.
	
	If outname==None, prints HTML to stdout.
	Else, writes HTML to named file.
	"""
	xhtml = exception_to_html(exc_info, html_pre, html_post, encoding)
	
	if outname is None:
		print xhtml
	else:
		open(outname, "wb").write(xhtml)
		
	sys.exit(1)
	
