"""
wikklytext.eval.py: WikklyText evaluation. Part of the WikklyText suite.

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

from wikklytext.base import Element, ElementList

def eval_wiki_macro_args(wcontext, elements):
	"""
	Evaluate all MacroText nodes in elements, returning others untouched.

	Returns an Element with the evaluated elements as subnodes (you should
	not use the top Element, it is just a container. (An Element is returned
	because it acts both like a list and lets you do .find(), etc. as needed.)
	"""
	outnode = ElementList()
	for e in elements:
		if e.tag == 'MacroText':
			for node in eval_wiki_text(wcontext, e.text):
				outnode.append(node)
		else:
			outnode.append(e)
	
	return outnode
	
def eval_wiki_text(wcontext, wikitext):
	"""
	Convenience function: Evaluates a block of wikitext, returning the result.
	
	'wcontext' is the parent WikContext - any errors that occur will be
	added to this context's parser.
	"""
	from wikklytext.lexer import WikklyContentLexer
	from copy import copy
	
	l = WikklyContentLexer()
	
	# Create new parser instance for inner lexer.
	#icontext = copy(wcontext)
	icontext = wcontext.copy()
	icontext.parser = wcontext.parser.makenew()
	icontext.parser.set_context(icontext)
	l.parse(wikitext, icontext)
	
	# propogate errors from inner parser to parent
	errlist = icontext.parser.getErrors()
	wcontext.parser.addParserErrors(errlist)
	
	# propogate variable changes back up
	wcontext.update(icontext)
	
	return icontext.parser.getInnerResult()
	
