"""
__init__.py: Common API. Part of the WikklyText suite.

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

# chicken-and-egg - ignore import failures caused by missing dependencies
# so setup.py has a chance to install them
try:
	from wikklytext.base import WikError, xmltrace, wikitext_as_unicode, \
				load_wikitext
	from wikklytext.buildHTML import WikklyText_to_InnerHTML, WikklyText_to_HTML
	from wikklytext.buildXML import WikklyText_to_XML
	from wikklytext.util import loadxml, copy_CSS_elements, get_CSS_element_names
	from wikklytext.store import WikklyItem
except:
	pass
	
