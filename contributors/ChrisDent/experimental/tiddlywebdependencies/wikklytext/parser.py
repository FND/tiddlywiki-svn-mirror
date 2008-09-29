"""
wikklytext.parser.py: Base parser interface to wikklytext.lexer. Part of the WikklyText suite.

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

class WikklyBaseContentParser(object):
	"""
	Base class for content parser showing the required API.
	
	You can also instantiate this by itself to show a trace of the tokens from the lexer.
	"""
	def makenew(self):
		"Make a new parser like this one."
		return WikklyBaseContentParser()

	def set_context(self, context):
		print "set_context", context
		
	def beginDoc(self):
		print "beginDoc"
		
	def endDoc(self):
		print "endDoc"
	
	def getInnerResult(self):
		"""
		Called after endDoc() to get final result from parser.
		Must be in the same format that addParserResult() accepts.
		
		This should be the 'inner' contents, without any header nodes.
		"""
		return ''

	def getErrors(self):
		"Return current error list, in same format that 'addParserErrors' accepts."
		return []
		
	def addParserResult(self, result):
		print "addParserResult", result
		
	def addParserErrors(self, errors):
		print "addParserErrors", errors
		
	def beginBold(self):
		print "beginBold"
		
	def endBold(self):
		print "endBold"
		
	def beginItalic(self):
		print "beginItalic"
		
	def endItalic(self):
		print "endItalic"
	
	def beginStrikethrough(self):
		print "beginStrikethrough"
		
	def endStrikethrough(self):
		print "endStrikethrough"
		
	def beginUnderline(self):
		print "beginUnderline"
		
	def endUnderline(self):
		print "endUnderline"

	def beginSuperscript(self):
		print "beginSuperscript"
		
	def endSuperscript(self):
		print "endSuperscript"

	def beginSubscript(self):
		print "beginSubscript"
		
	def endSubscript(self):
		print "endSubscript"

	def beginHighlight(self, style=None):
		print "beginHighlight, style=%s" % repr(style)
		
	def endHighlight(self):
		print "endHighlight"

	def beginNList(self):
		print "begin N-list"
		
	def endNList(self):
		print "end N-list"
		
	def beginNListItem(self, txt):
		print "begin N-listitem:%s:" % txt		
		
	def endNListItem(self):
		print "end N-listitem"
		
	def beginUList(self):
		print "begin U-list"
		
	def endUList(self):
		print "end U-list"

	def beginUListItem(self, txt):
		print "begin U-listitem:%s:" % txt		
	
	def endUListItem(self):
		print "end U-listitem"
		
	def beginHeading(self, txt):
		print "beginHeading:%s:" % txt		
	
	def endHeading(self):
		print "endHeading"

	def beginBlockIndent(self):
		print "beginBlockIndent"
		
	def endBlockIndent(self):
		print "endBlockIndent"
	
	def beginLineIndent(self):
		print "beginLineIndent"
		
	def endLineIndent(self):
		print "endLineIndent"
	
	def beginLink(self):
		print "beginLink"
		
	def endLink(self):
		print "endLink"
		
	def linkSeparator(self):
		# called when '|' found in link/imglink
		print "linkSeparator"
		
	def beginImgLink(self):
		print "beginImgLink"
		
	def endImgLink(self):
		print "endImgLink"

	def beginCodeBlock(self):
		print "beginCodeBlock"
		
	def endCodeBlock(self):
		print "endCodeBlock"

	def beginCodeInline(self):
		print "beginCodeInline"
		
	def endCodeInline(self):
		print "endCodeInline"

	def beginTable(self):
		print "beginTable"
		
	def endTable(self):
		print "endTable"

	def setTableCaption(self, txt):
		print "TableCaption: ",txt
		
	def beginTableRow(self):
		print "beginTableRow"
		
	def endTableRow(self):
		print "endTableRow"

	def beginTableCell(self):
		print "beginTableCell"
		
	def endTableCell(self):
		print "endTableCell"
	
	def beginDefinitionList(self):
		print "beginDefinitionList"
		
	def endDefinitionList(self):
		print "endDefinitionList"
		
	def beginDefinitionTerm(self):
		print "beginDefinitionTerm"
		
	def endDefinitionTerm(self):
		print "endDefinitionTerm"
			
	def beginDefinitionDef(self):
		print "beginDefinitionDef"
		
	def endDefinitionDef(self):
		print "endDefinitionDef"

	def beginCSSBlock(self, classname):
		print "beginCSSBlock(%s)" % classname
		
	def endCSSBlock(self):
		print "endCSSBlock"

	def beginRawHTML(self):
		print "beginRawHTML"
		
	def endRawHTML(self):
		print "endRawHTML"
	
	# standalone tokens
	def separator(self):
		print "separator"

	def EOLs(self, txt):
		print "EOLS (#): ",len(txt)
		
	def linebreak(self):
		print "linebreak"

	def dash(self):
		print "dash"
		
	def characters(self, txt):
		# text is unicode -
		print "chars: ",repr(txt.encode('utf-8'))

	def error(self, message, looking_at=None, trace=None):
		"""
		Reports an error to the parser.
		'message': A (usually) short text message describing the error.
		'trace' is a verbose traceback of the error (can be None).
		
		Both 'message' and 'trace' should be treated as RAW text.
		
		Note that 'error()' is just another stream event. Parsing will continue after this.
		"""
		print "** ERROR **"
		print "Message: ",message
		print "Trace: ",trace
		
if __name__ == '__main__':
	from wikklytext.lexer import WikklyContentLexer
	from wikklytext.base import WikContext, load_wikitext
	import sys
	
	wcontext = WikContext(restricted_mode=False)
	l = WikklyContentLexer()
	p = WikklyBaseContentParser()
	wcontext.parser = p
		
	if len(sys.argv) < 2:
		buf = load_wikitext('simple.txt')
	else:
		buf = load_wikitext(sys.argv[1])

	l.parse(buf, wcontext)


