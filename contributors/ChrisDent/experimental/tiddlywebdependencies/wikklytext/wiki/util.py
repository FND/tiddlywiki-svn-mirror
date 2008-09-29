"""
util.py: Utilities

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

def itemText(wiki, itemname, default=u''):
	"Load a wiki item, returning .content for item or default if item not found."
	node = wiki.getitem(itemname)
	if node is None:
		return default
	else:
		return node.content

