"""
wikklytext.lexer.py: WikklyText lexer. Part of the WikklyText suite.

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
#
# Supported markup:
#
#   ''  : Bold start/end
#   //  : Italic start/end
#   --  : Strikethrough start/end
#   __  : Underlined start/end
#   ^^  : Superscript start/end
#   ~~  : Subscript start/end
#   @@  : Highlight start/end
#   {{name{ : CSS block start
#   ^[#]+ : Numbered list item
#   ^[*]+ : Unnumbered list item
#   ^[!]+ : Heading
#   ^[;]+ : Term (dt)
#   ^[:]+ : Definition (dd)
#   ^<<<  : Block-indent start/end
#   ^[>]+ : Line-indent
#   <<name : Macro call
#   [[    : Link start
#   [img[ : Img link start
#   ]]    : Link end (contents of link are handled later)
#   {{{ ... }}}  : Code
#   ^/*{{{*/$ ... ^/*}}}*/ : Code
#   ^//{{{$ ... ^//}}} : Code
#   ^<!--{{{-->$ ... ^<!--}}}--> : Code
#   ^/***$ : Begin C-comment (markers removed, inner text processed)
#   ^***/$ : End C-comment
#   ^<!---$ : Begin HTML comment (markers removed, inner text processed)
#   ^--->$ : End HTML comment
#   {{class{  : CSS block begin
#   }}}   : CSS block end
#   ----  : Separator line
#   ^\s*| : Begins table row (no leading text allowed per TiddlyWiki)
#   EOLS  : One or more newlines, possibly with intermixed spaces
#   [http|file|..etc..]://  : Automatic URLs
#   <html> .. </html> : Inner text is passed through to parser.
#   <br>  : HTML <br>
#   \s--\s : &mdash;
#   /% .. %/ : Comment
#   ~Name : WikiWord escape
#  <?py .. ?> : EXTENSION - Embedded Python code.
#  ^.$ : Nothing
#  &#DeleteMe; : EXTENSION - Deleted in lexer
#  &#NNN;  : Converted to plain text char
#  &#xHHH; : Converted to plain text char
#   .     : Any other character
#

import ply.lex as lex
import re
from wikklytext.base import WikError, ifelse, ElementList, hex2int

def only_spaces(txt):
	"Does text contain ONLY spaces (or is empty)?"
	return ifelse(len(txt) and re.search('[^ \t]', txt), False, True)

class WikklyContentLexer(object):
	
	tokens = (
		'BOLD',
		'ITALIC',
		'STRIKETHROUGH',
		'UNDERLINE',
		'SUPERSCRIPT',
		'SUBSCRIPT',
		'HIGHLIGHT_CSS',
		'HIGHLIGHT_COLOR',
		'HIGHLIGHT_BG',
		'HIGHLIGHT_DEFAULT',
		'N_LISTITEM',
		'U_LISTITEM',
		'HEADING',
		'D_TERM',
		'D_DEFINITION',
		#'MACRO',
		'PYTHON_EMBED',
		'BLOCK_INDENT',
		'LINE_INDENT',
		'LINKSTART',
		'IMGSTART',
		'LINKEND',
		'CSS_BLOCK_START',
		'CSS_BLOCK_END',
		#'CODE_START',
		#'CODE_END',
		'CODE_BLOCK',
		'CODE_BLOCK_CSS',
		'CODE_BLOCK_CPP',
		'CODE_BLOCK_HTML',
		'C_COMMENT_START',
		#'C_COMMENT_END',
		'HTML_COMMENT_START',
		'HTML_COMMENT_END',
		'SEPARATOR',
		'TABLEROW_START',
		'TABLEROW_END',
		'TABLE_END',
		'TABLEROW_CAPTION',
		'EOLS',
		# NOTE: this never becomes a token - it turns into TEXT below
		# I'm leaving this as a comment so the length with match with the list above.
		'CATCH_URL',
		#'HTML_START',
		#'HTML_END',
		'HTML_ESCAPE',
		'WIKI_ESCAPE',
		'COMMENT',
		# NOTE: this never becomes a token - it turns into TEXT below
		# I'm leaving this as a comment so the length with match with the list above.
		#'WIKIWORD_ESC',
		'HTML_BREAK',
		'PIPECHAR',
		'DASH',
		'XHTML_ENTITY',
		'NULLDOT',
		#'DELETE_ME', # for internal use only - keep the lexer from matching BOL as needed 
		'TEXT',
		# internally-generated, but still has to be in this list ...
		#'RAWTEXT',
		)

	t_BLOCK_INDENT = r"^<<<" # TiddlyWiki does NOT allow leading NOR trailing whitespace here
	t_LINE_INDENT = r"^([>]+)"
	t_HTML_COMMENT_START = r'^<!---\n'
	t_HTML_COMMENT_END = r'^--->\n'
	t_SEPARATOR = r"^\s*---[-]+\s*"
	t_TABLEROW_START = r"^\s*\|"
	t_TABLEROW_END = r"(\|\s*)\n" # normal end of table row
	t_TABLE_END = r"(\|\s*)(\n[\t ]*\n)" # blank line after table row = table end
	# caption is literal text in TiddlyWiki, no inner wiki markup recognized
	t_TABLEROW_CAPTION = r"^\s*\|([^\n]*)\|c\s*?\n"
	t_BOLD = r"''"
	t_ITALIC = r"//"
	t_STRIKETHROUGH = r"--"
	t_UNDERLINE = r"__"
	t_SUPERSCRIPT = r"\^\^"
	t_SUBSCRIPT = r"~~"
	# @@prop1: style 1 here; prop2: style 2 here; ... ;
	# (sync regex w/wikklytext.buildXML.py)
	# careful on matching - easy to mix up with the other @@ forms
	# (this is not the full set of property names allowed by CSS, but
	# should cover most real uses)
	t_HIGHLIGHT_CSS = r'@@((\s*[a-zA-Z][a-zA-Z0-9-]*\s*:.+?;)+)'
	t_HIGHLIGHT_COLOR = r'@@color\((.+?)\):' # @@color(color): ...@@
	t_HIGHLIGHT_BG = r'@@bgcolor\((.+?)\):'  # @@bgcolor(color): .. @@
	t_HIGHLIGHT_DEFAULT = r"@@"
	t_LINKSTART = r"\[\["
	t_IMGSTART = r"\[img\["
	t_LINKEND = r"\]\]"
	# a CSS block ({{class{ .. text ..}}}) is superficially similar to a CODE block. Remember though
	# that a code block puts the lexer into raw character mode, where a CSS class block still does
	# full parsing of the internal text, so they are very different modes. TiddlyWiki DOES allow
	# a code block to reside inside a CSS block, but not vice versa. Since code blocks are read as
	# raw text, no special check is needed for this since a CSS block won't be recognized in a code block.
	t_CSS_BLOCK_START = r"\{\{\s*([a-z_-][a-z0-9_-]+)\s*\{"
	t_CSS_BLOCK_END = r"\}\}\}"
	t_CODE_BLOCK = r"\{\{\{(.*?)\}\}\}"
	t_CODE_BLOCK_CSS = r'^\/\*{{{\*\/(\n.*?\n)\/\*}}}\*\/'
	t_CODE_BLOCK_CPP = r'^\/\/{{{(\n.*?\n)\/\/}}}'
	t_CODE_BLOCK_HTML = r'^<!--{{{-->(\n.*?\n)<!--}}}-->'
	t_XHTML_ENTITY = r"&([a-z0-9\x23]+)(;)?" # note optional semicolon - need to catch for XSS filter
	t_COMMENT = r"[\s\n]*/%.*?%/[\s\n]*" # grab any leading & trailing whitespace so it doesn't cause a gap
	t_C_COMMENT_START = r'^\/\*\*\*\n'
	# this is caught as a special case of ^*
	#t_C_COMMENT_END = r'^\*\*\*\/\n'
	t_HTML_BREAK = r"<\s*br\s*[/]?\s*>"
	#t_HTML_START = r"<html>"
	#t_HTML_END = r"</html>"
	# TiddlyWiki does not allow nesting, so grab all at once
	t_HTML_ESCAPE = r"<html>(.*?)</html>"
	t_WIKI_ESCAPE = r"<nowiki>(.*?)</nowiki>"
	t_PIPECHAR = r"\|"
	t_DASH = r"\s--\s" # requires \s on both sides to distinguish from strikethrough markers
	t_NULLDOT = r"^\s*\.\s*$" # extension: a lone dot causes the line to be ignored
	t_TEXT = r"."
	
	def __init__(self):
		pass
		
	def t_error(self, t):
		#t.lexer.skip(1)
		pass

	def t_N_LISTITEM(self, t):
		r"^\s*[\#]+\s*"
		t.rawtext = t.value
		t.value = t.value.rstrip().lstrip()
		return t

	def t_U_LISTITEM(self, t):
		r"^\s*[\*]+\s*"
		# check for '***/'
		if t.value == '***' and self.lexer.lexdata[self.lexer.lexpos] == '/' and \
			self.in_strip_ccomment:
		
			self.in_strip_comment = 0
			self.lexer.input(self.lexer.lexdata[self.lexer.lexpos+1:])
			
			# work done, return an (effectively) NOP token
			t.type = 'TEXT'
			t.value = ''
			return t
		
		t.rawtext = t.value
		t.value = t.value.rstrip().lstrip()
		return t
		
	def t_HEADING(self, t):
		r"^\s*[\!]+\s*"
		t.rawtext = t.value
		t.value = t.value.rstrip().lstrip()
		return t

	def t_D_TERM(self, t):
		r"^\s*[;]+\s*"
		t.rawtext = t.value
		t.value = t.value.rstrip().lstrip()
		return t
		
	def t_D_DEFINITION(self, t):
		r"^\s*[:]+\s*"
		t.rawtext = t.value
		t.value = t.value.rstrip().lstrip()
		return t

	# Strict parsing: '<?py' must begin a line and '?>' must end a line. No nesting allowed, so
	# I just grab the whole thing at once.
	def t_PYTHON_EMBED(self, t):
		r"^\s*<\?py.*?\?>\s*$"
		t.rawtext = t.value
		# save code in t.value
		m = re.match(r"^\s*<\?py(.*?)\?>\s*$",t.value,re.M|re.I|re.S)
		t.value = m.group(1)
		return t

	#def t_RAWHTML(self, t):
	#	r"<html>.+?</html>" # non-greedy, so it won't grab consecutive html tags
	#	# self.lexer.lexmatch seems unreliable to me, since it has a lot more groups
	#	# than I defined. so, reparse just to be safe.
	#	t.rawtext = t.value
	#	m = re.match(r"<html>(.+)</html>",t.value,re.I)
	#	t.value = m.group(1)
	#	return t

	def t_MACRO(self, t):
		# Macro call - IMPORTANT - only grab the beginning - trying to catch ">>" here would be wrong
		# since ">>" could be inside a quoted string argument. So, just catch the start and pass it off
		# to wikklytext.macro to do the full parsing. Do NOT allow leading inner space, so things like " << " are
		# not accidentally matched.
		r"<<[a-z_]+"
		import wikklytext.macro
	
		# for tokens other than MACRO, the raw text is save to t.rawtext and automatically used below when
		# reading a special block (code, html). However, macros are different since the 
		# real parsing is handled by wikklytext.macro. Therefore I have to handle the rawtext here explicitly.
		#if self.in_blockquote or self.in_code or self.in_html_block:
		#if self.in_code or self.in_html_block:
		#if self.in_html_block:
		#	t.type = 'TEXT'
		#	return t
			
		# get chunk to hand off to split_macro_args() (back-up to start of '<<')
		txt = self.lexer.lexdata[self.lexer.lexpos-len(t.value):]
		#print "HANDOFF CHUNK"
		#print txt
		try:
			name, elements, txt_remainder = wikklytext.macro.split_macro_args(self.wcontext, txt)
			try:
				elements = wikklytext.macro.call_macro(self.wcontext, name, elements) 
			except WikError, exc:
				# pass error to parser and continue
				self.wcontext.parser.error(exc.message, exc.looking_at, exc.trace)
				elements = ElementList()
				
			# hand results to parser - I don't know what it is
			self.wcontext.parser.addParserResult(elements)
			
			# the text returned from the macro is allowed to have markup as well, so pass
			# it back into the lexer
			#self.lexer.input(results + txt[nr:])
			
			# add a zero-width space at start of stream so lexer won't try to match
			# beginning-of-line regexes until next \n seen
			#self.lexer.input('&#x200b;' + txt[nr:])
			#self.lexer.input('&#x200b;' + txt_remainder)
			
			#if re.match('\s*\n', txt_remainder):
			#	self.lexer.input(txt_remainder)
			#else:
			#	# this will be immediately deleted, it is inserted to prevent beginning of
			#	# line matches after this point
			#	self.lexer.input('&#DELETE_ME;' + txt_remainder)
			
			#print "REMAINDER",repr(txt_remainder)
			self.lexer.input('&#DeleteMe;' + txt_remainder)
			#if self.in_table:
			#	self.lexer.input('&#DELETE_ME;' + txt_remainder)
			#else:
			#	self.lexer.input(txt_remainder)
			
		except WikError, exc:
			#print "ERROR A", exc
			#print exc.message
			# restart lexer after point of error (might be '' on non-recoverable errors)
			self.lexer.input(exc.remainder)			
			self.wcontext.parser.error(exc.message, exc.looking_at, exc.trace)			
		
		#print "ARGS ",args
		#print "NR ",nr
		#print "REMAINDER ",txt[nr:]
		# reset lexer to point after closing '>>'
		
		#print "MACRO %s %s RESULT -->\n" % (args[0],args[1:]),results,"\n<-- END MACRO RESULTS"
		
		# returning no value is supposed to work, but seems unreliable
		#t.type = 'RAWHTML'
		t.type = 'TEXT'
		t.value = ''
		return t

	#def t_WIKIWORD_ESC(self, t):					
	#	r"~[a-z][a-z0-9_]+"
	#	# wikiword must begin with a capital and have at least two capitals seperated by a lower or _
	#	if not re.match("~[A-Z].*[a-z_].*[A-Z]", t.value):
	#		# does not appear to be a wikiword escape - skip the "~" and continue parsing from that point
	#		self.lexer.input(self.lexer.lexdata[self.lexer.lexpos-len(t.value)+1:])
	#		# return a 'null' token
	#		#t.type = "RAWHTML"
	#		t.type = "TEXT"
	#		t.value = '~'
	#		return t
	#	else:
	#		# appears to be an escaped wikiword - remove ~ and pass rest as chars
	#		#t.type = 'RAWHTML'
	#		t.type = 'TEXT'
	#		t.rawtext = t.value
	#		t.value = t.value[1:]			
	#		return t			
			
	def t_CATCH_URL(self, t):
		r"((http|https|file|ftp|gopher|mms|news|nntp|telnet)://[a-zA-Z0-9~\$\-_\.\#\+\!%/]+)|(mailto:[a-zA-Z\._@]+)"
		# common parts of RFC 1738 - I left out "(),'*" because they might be legitimate markup and I never
		# (or rarely) see those used in URLs
		return t

	def t_EOLS(self, t):
		r"\n([\t ]*[\n])*"
		# group one or more \n chars possibly intermixed with whitespace.
		# delete whitespace so value is just a set of \n chars.
		t.value = t.value.replace(' ','').replace('\t','')
			
		return t

	def prepare_input(self, txt):
		# for simplicity in regexes, remove all '\r' chars 
		txt = txt.replace('\r','')

		# NO!! This causes all files to end with an extra ' ' at the end which screws up
		# things like '<<set' where the variables end up with extra padding. Although
		# it is true that some regexes depend on a file ending in '\n', the solution
		# is to fix the input, not kludge it here.
		
		# some regexes assume a file will end with '\n', so make sure one is present
		#if txt[-1] != '\n':
		#	txt += '\n'

		self.lexer.input(txt)
		
	def test(self,txt):
		self.prepare_input(txt)
		self.previous = []
		
		while 1:
			tok = self.lexer.token()
			if not tok: 
				break
				
			print tok
			self.previous.append(tok)

	#def no_tags(self, txt):
	#	# escape anything like an HTML tag. do NOT escape '&' here.
	#	# I only modify '<' since '>' can be a colspan symbol
	#	return txt.replace('<','&lt;')
	#	#return txt

	def handle_codeblock(self, parser, text):				
		# multi or single line?
		if '\n' in text:
			# strip leading/trailing newlines
			while len(text) and text[0] == '\n':
				text = text[1:]
			
			while len(text) and text[-1] == '\n':
				text = text[:-1]
				
			parser.beginCodeBlock()
			parser.characters(text)
			parser.endCodeBlock()
		else:
			parser.beginCodeInline()
			parser.characters(text)
			parser.endCodeInline()

	def parse(self, txt, wcontext):
		from time import time
		
		# sanity
		if not isinstance(txt, unicode):
			raise WikError("Unicode value required in parse() - got '%s'" % repr(txt))
			
		# flags:
		#   * need to use re.M so beginning-of-line matches will work as expected
		#   * use re.I for case-insensitive as well
		#   * use re.S so '.' will match newline also
		self.lexer = lex.lex(object=self, reflags=re.M|re.I|re.S)
		
		self.wcontext = wcontext

		# shortcut for below
		parser = self.wcontext.parser
		
		# state vars - most of these are local context only, but some are set
		# into self if they are needed above
		in_bold = 0
		in_italic = 0
		in_strikethrough = 0
		in_underline = 0
		in_superscript = 0
		in_subscript = 0
		in_highlight = 0
		in_block_indent = 0
		in_line_indent = 0 # if > 0 this is the nesting level
		# the top of stack is the _currently_ opened listitem + level
		# e.g. for <ul>, item "###" is ('U',3), for <ol>, item '##' is ('N',2)
		list_stack = [('X',0)] # no currently opened list
		#in_Nlistitem = 0
		#in_Ulistitem = 0
		in_heading = 0
		in_deflist = 0 # tiddlywiki does not let DL/DT/DD nest apparently, so don't worry about it
		in_defterm = 0 # in <DT>?
		in_defdef = 0  # in <DD>?
		in_link = 0
		in_imglink = 0
		self.in_strip_ccomment = 0 # inside /*** ... ***/ block
		in_html_comment = 0 # inside <!--- ... ---> block
		# since CSS blocks can nest, this is a list of currently open blocks, by CSS name
		css_stack = [] 
		# allow <html> blocks to nest
		#self.in_html_block = 0
		#self.in_code = 0
		self.in_table = 0
		self.in_tablerow = 0
		self.in_tablecell = 0
		last_token = (None,None)  # type,value
			
		self.prepare_input(txt)
		
		parser.beginDoc()
		
		while 1:
			tok = self.lexer.token()

			# check for EOF or over time limit
			if tok is None or time() > wcontext.stoptime: 
				if tok is not None:
					parser.characters('ERROR: TIME LIMIT EXCEEDED!')
					parser.linebreak()
					
				#print "EOF LIST CHECK"
				#print "STACK ",list_stack

				# close any open lists
				while list_stack[-1][0] in "NU":
					kind,n = list_stack.pop()
					if kind == 'N':
						parser.endNListItem()
						parser.endNList()
					else:
						parser.endUListItem()
						parser.endUList()
					
				# close any open tables
				if self.in_tablecell:
					parser.endTableCell()
				if self.in_tablerow:
					parser.endTableRow()
				if self.in_table:
					parser.endTable()

				# close any opened line-indents
				while in_line_indent:
					parser.endLineIndent()
					in_line_indent -= 1

				# close any open definition list
				if in_defterm:
					parser.endDefinitionTerm()
					
				if in_defdef:
					parser.endDefinitionDef()
					
				if in_deflist:
					parser.endDefinitionList()

				# watch out for ending inside of a structured item
				for v, s in [
					(in_bold, "'' ... ''"),
					(in_italic, "// ... //"),
					(in_strikethrough, "-- ... --"),
					(in_underline, "__ .. .__"),
					(in_superscript, "^^ ... ^^"),
					(in_subscript, "~~ ... ~~"),
					(in_highlight, "@@ ... @@"),
					(in_block_indent, "block-indent (<<<)"),
					(in_link, "[[ ... ]]"),
					(in_imglink, "[img[ ... ]]"),
					#(self.in_html_block, "<html> ... </html>"),
					#(self.in_code, "{{{ ... }}}")]:
					]:
						if v:
							parser.error("ERROR input ended inside %s" % s, '', '')	
							
				parser.endDoc()
				break

			# while in blockquote, hand parser raw chars
			#if self.in_blockquote and tok.type != 'BLOCKQUOTE':
			#	if hasattr(tok,'rawtext'):
			#		parser.characters(tok.rawtext)
			#	else:
			#		parser.characters(tok.value)
			#		
			#	continue

			# while in code, hand parser raw chars
			#if self.in_code and tok.type != 'CODE_END':
			#	if hasattr(tok,'rawtext'):
			#		parser.characters(tok.rawtext)
			#	else:
			#		parser.characters(tok.value)
			#		
			#	continue

			# while in <html>, hand parser raw chars, checking for nesting
			#if self.in_html_block:
			#	if tok.type == 'HTML_END':
			#		self.in_html_block -= 1
			#	elif tok.type == 'HTML_START':
			#		self.in_html_block += 1
			#	else:
			#		if hasattr(tok,'rawtext'):
			#			val = tok.rawtext
			#		else:
			#			val = tok.value
			#			
			#		parser.characters(val)
			#		
			#	continue
				
			# if just ended a line, and inside a table, and NOT starting a new tablerow, end table
			#if last_token[0] == 'EOLS' and in_table:
			#	if tok.type != 'TABLEROW_START' or len(last_token[1]) > 1:
			#		parser.endTable()
			#		in_table = 0
			
			# if just ended a line, and inside a line-indent, and NOT starting a new
			# line-indent, end indented section
			if last_token[0] == 'EOLS' and in_line_indent:
				if tok.type != 'LINE_INDENT':
					# close all nested blocks
					while in_line_indent:
						parser.endLineIndent()
						in_line_indent -= 1
						
			# if just ended a line, and inside a definition list, and NOT starting a new definition item, end list
			if last_token[0] == 'EOLS' and in_deflist:
				if tok.type not in['D_TERM','D_DEFINITION'] or len(last_token[1]) > 1:
					parser.endDefinitionList()
					in_deflist = 0				

			# if just saw TABLEROW_END or TABLEROW_CAPTION and next token not
			# TABLEROW_CAPTION or TABLEROW_START, then end table
			if self.in_table and last_token[0] in ['TABLEROW_END','TABLEROW_CAPTION'] and \
				tok.type not in ['TABLEROW_CAPTION', 'TABLEROW_START']:
					if self.in_tablecell:
						parser.endTableCell()
						self.in_tablecell = 0
					
					if self.in_tablerow:
						parser.endTableRow()
						self.in_tablerow = 0
					
					parser.endTable()
					self.in_table = 0
					
			# if I just ended a line, and am inside a listitem, then check next token.
			# if not a listitem, pop & close all currently opened lists
			if last_token[0] == "EOLS" and list_stack[-1][1] >= 1:
				# if new token not a listitem or there were multiple EOLs, close all lists
				if tok.type not in ['N_LISTITEM','U_LISTITEM'] or len(last_token[1]) > 1:
					#print "EOL CLOSE LISTS"
					#print "STACK ",list_stack

					# close all open lists
					while list_stack[-1][0] in "NU":
						kind,n = list_stack.pop()
						if kind == 'N':
							parser.endNListItem()
							parser.endNList()
						else:
							parser.endUListItem()
							parser.endUList()
						
			if tok.type == 'TEXT':
				#parser.characters(self.no_tags(tok.value))
				parser.characters(tok.value)
				
			#elif tok.type == 'RAWTEXT': # internally generated type that tells me not to escape text
			#	parser.characters(tok.value)
		
			#elif tok.type == 'HTML_START':
			#	self.in_html_block += 1
				
			elif tok.type == 'BOLD':
				if in_bold:
					parser.endBold()
					in_bold = 0
				else:
					parser.beginBold()
					in_bold = 1
					
			elif tok.type == 'ITALIC':
				if in_italic:
					parser.endItalic()
					in_italic = 0
				else:
					parser.beginItalic()
					in_italic = 1
					
			elif tok.type == 'STRIKETHROUGH':
				if in_strikethrough:
					parser.endStrikethrough()
					in_strikethrough = 0
				else:
					parser.beginStrikethrough()
					in_strikethrough = 1

			elif tok.type == 'UNDERLINE':
				if in_underline:
					parser.endUnderline()
					in_underline = 0
				else:
					parser.beginUnderline()
					in_underline = 1
					
			elif tok.type == 'SUPERSCRIPT':
				if in_superscript:
					parser.endSuperscript()
					in_superscript = 0
				else:
					parser.beginSuperscript()
					in_superscript = 1

			elif tok.type == 'SUBSCRIPT':
				if in_subscript:
					parser.endSubscript()
					in_subscript = 0
				else:
					parser.beginSubscript()
					in_subscript = 1

			elif tok.type == 'HIGHLIGHT_DEFAULT':
				# can be end of any other "@@" style, or the start of the default style
				if in_highlight:
					parser.endHighlight()
					in_highlight = 0
				else:
					# begin default highlight style 
					parser.beginHighlight()
					in_highlight = 1

			elif tok.type in ['HIGHLIGHT_CSS', 'HIGHLIGHT_COLOR', 'HIGHLIGHT_BG']:
				#print "TOKEN",tok.type,tok.value
				if in_highlight:
					# the '@@' is the end of the highlight - reparse remainder
					txt = self.lexer.lexdata[self.lexer.lexpos:]
					self.lexer.input(tok.value[2:] + txt)
					parser.endHighlight()
					in_highlight = 0
				else:
					# send style to parser so it knows what kind of element
					# to create
					parser.beginHighlight(tok.value)
					in_highlight = 1
				
			#elif tok.type == 'BLOCKQUOTE':
			elif tok.type == 'BLOCK_INDENT':
				if in_block_indent:
					parser.endBlockIndent()
					in_block_indent = 0
				else:
					parser.beginBlockIndent()
					in_block_indent = 1

			elif tok.type == 'LINE_INDENT':
				# get >> chars
				m = re.match(self.t_LINE_INDENT, tok.value)
				# adjust new new nesting level
				nr = len(m.group(1))
				while nr > in_line_indent:
					parser.beginLineIndent()
					in_line_indent += 1
					
				while nr < in_line_indent:
					parser.endLineIndent()
					in_line_indent -= 1
					
			elif tok.type == 'HTML_ESCAPE':
				m = re.match(self.t_HTML_ESCAPE, tok.value, re.M|re.I|re.S)
				parser.beginRawHTML()
				parser.characters(m.group(1))
				parser.endRawHTML()
				
			elif tok.type == 'WIKI_ESCAPE':
				m = re.match(self.t_WIKI_ESCAPE, tok.value, re.M|re.I|re.S)
				# <nowiki> is escaped like regular text
				parser.characters(m.group(1))
				
			elif tok.type == 'D_TERM':
				if not in_deflist:
					parser.beginDefinitionList()
					in_deflist = 1
					
				parser.beginDefinitionTerm()
				in_defterm = 1

			elif tok.type == 'D_DEFINITION':
				if not in_deflist:
					parser.beginDefinitionList()
					in_deflist = 1

				parser.beginDefinitionDef()
				in_defdef = 1
				
			elif tok.type == 'N_LISTITEM':
				#print "N_LISTITEM, VALUE ",tok.value, "STACK ",list_stack

				# (see file 'stack' for more detailed derivation)
				#
				# remember: 
				#    Top of stack is CURRENTLY opened listitem (the one before me)
				# cases:
				#   1. top of stack is my same type AND level: 
				#        Close current listitem and start new one (leave stack alone)
				#   2. top of stack is LOWER level, ANY type: 
				#        I'm a sublist of current item - open a new list, leaving current list open
				#        Push self to TOS
				#   3. top of stack is HIGHER level, ANY type:
				#        Current item is sublist of MY previous sibling. Close lists till I find
				#        my same type AND level at TOS (watch for emptying stack!)
				#        Start new item or new list (push to TOS).
				#   4. different type, same level:
				#        Close current list, pop TOS and start new list (push self to TOS)
				
				# case 1:
				if list_stack[-1][0] == 'N' and list_stack[-1][1] == len(tok.value):
					parser.endNListItem()				
					parser.beginNListItem(tok.value)
				
				# case 2:
				elif list_stack[-1][1] < len(tok.value):
					parser.beginNList()							
					parser.beginNListItem(tok.value)
					list_stack.append( ('N',len(tok.value)) )
												
				# case 3:
				elif list_stack[-1][1] > len(tok.value):
					while (not(list_stack[-1][0] == 'N' and list_stack[-1][1] == len(tok.value))) and \
						list_stack[-1][0] in 'NU':  # watch for end of stack as well
						# close TOS list
						if list_stack[-1][0] == 'N':
							parser.endNListItem()
							parser.endNList()
						else:
							parser.endUListItem()
							parser.endUList()
							
						list_stack.pop()
						
					# did I empty the stack?
					if list_stack[-1][0] != 'N':
						# yes, start new list
						parser.beginNList()					
					else:
						# close current item
						parser.endNListItem()

					parser.beginNListItem(tok.value)
						
					# do NOT push to stack since TOS is already correct
					
				# case 4:
				elif list_stack[-1][0] == 'U' and list_stack[-1][1] == len(tok.value):
					# close current list & pop TOS
					parser.endUListItem()
					parser.endUList()
					list_stack.pop()
					
					# start new list & item
					parser.beginNList()
					parser.beginNListItem(tok.value)
					
					list_stack.append( ('N',len(tok.value)) )
					
				else:
					# cannot reach ... if my logic is correct :-)
					raise WikError("** INTERNAL ERROR in N_LISTITEM **")
				
			elif tok.type == 'U_LISTITEM':
				# (see comments in N_LISTITEM)
				
				#print "U_LISTITEM, VALUE ",tok.value, "STACK ",list_stack
				
				# case 1:
				if list_stack[-1][0] == 'U' and list_stack[-1][1] == len(tok.value):
					parser.endUListItem()				
					parser.beginUListItem(tok.value)
				
				# case 2:
				elif list_stack[-1][1] < len(tok.value):
					parser.beginUList()							
					parser.beginUListItem(tok.value)
					list_stack.append( ('U',len(tok.value)) )
												
				# case 3:
				elif list_stack[-1][1] > len(tok.value):
					while (not(list_stack[-1][0] == 'U' and list_stack[-1][1] == len(tok.value))) and \
						list_stack[-1][0] in 'NU':  # watch for end of stack as well
						# close TOS list
						if list_stack[-1][0] == 'U':
							parser.endUListItem()
							parser.endUList()
						else:
							parser.endNListItem()
							parser.endNList()
							
						list_stack.pop()
						
					# did I empty the stack?
					if list_stack[-1][0] != 'U':
						# yes, start new list
						parser.beginUList()					
					else:
						# close current item
						parser.endUListItem()

					parser.beginUListItem(tok.value)
					
					# do NOT push to stack since TOS is already correct
					
				# case 4:
				elif list_stack[-1][0] == 'N' and list_stack[-1][1] == len(tok.value):
					# close current list & pop TOS
					parser.endNListItem()
					parser.endNList()
					list_stack.pop()
					
					# start new list & item
					parser.beginUList()
					parser.beginUListItem(tok.value)
					
					list_stack.append( ('U',len(tok.value)) )
					
				else:
					# cannot reach ... if my logic is correct :-)
					raise WikError("** INTERNAL ERROR in N_LISTITEM **")
				
			elif tok.type == 'HEADING':
				# inside a table, this is a regular char (so parser can see it and
				# know to switch to <th>, etc.)
				if self.in_table:
					#print "RAWTEXT HEADING"
					parser.characters(tok.rawtext)
					continue
					
				parser.beginHeading(len(tok.value))
				in_heading = 1
		
			elif tok.type == 'LINKSTART':
				if in_link or in_imglink:
					parser.characters(tok.value)
				else:
					parser.beginLink()
					in_link = 1
					
			elif tok.type == 'IMGSTART':
				if in_link or in_imglink:
					parser.characters(tok.value)
				else:
					parser.beginImgLink()
					in_imglink = 1
					
			elif tok.type == 'LINKEND':
				if not in_link and not in_imglink:
					parser.characters(tok.value)
				else:
					if in_link:
						parser.endLink()
						in_link = 0
					else:
						parser.endImgLink()
						in_imglink = 0
		
			elif tok.type == 'CSS_BLOCK_START':
				m = re.match(self.t_CSS_BLOCK_START,tok.value,re.M|re.S|re.I)					
				name = m.group(1)
				# push on stack
				css_stack.append(name)
				# inform parser
				parser.beginCSSBlock(name)
					
			elif tok.type == 'CSS_BLOCK_END':
				if len(css_stack):
					# pop name and inform parser
					name = css_stack.pop()
					parser.endCSSBlock()
				else:
					# regular chars outside of a CSS block
					parser.characters(tok.value)
						
			elif tok.type == 'C_COMMENT_START':
				#print "******** C_COMMENT_START"
				if self.in_strip_ccomment:
					# already in C-comment, treat as normal chars
					parser.characters(tok.value)
				else:
					# begin C-comment (strip comment markers)
					self.in_strip_ccomment = 1
					
			#elif tok.type == 'C_COMMENT_END':
			#	print "************* C_COMMENT_END"
			#	if not self.in_strip_comment:
			#		# not in C-comment, treat as normal chars
			#		parser.characters(tok.value)
			#	else:
			#		self.in_strip_comment = 0
				
			elif tok.type == 'HTML_COMMENT_START':
				#print "******** C_COMMENT_START"
				if in_html_comment:
					# already in HTML comment, treat as normal chars
					parser.characters(tok.value)
				else:
					# begin HTML comment (strip comment markers)
					in_html_comment = 1
					
			elif tok.type == 'HTML_COMMENT_END':
				#print "************* C_COMMENT_END"
				if not in_html_comment:
					# not in HTML-comment, treat as normal chars
					parser.characters(tok.value)
				else:
					# strip end markers
					in_html_comment = 0
				
			elif tok.type == 'CODE_BLOCK':
				# regex grabs entire block since no nesting allowed
				m = re.match(self.t_CODE_BLOCK, tok.value, re.M|re.I|re.S)
				text = m.group(1)
				
				self.handle_codeblock(parser, text)

			elif tok.type == 'CODE_BLOCK_CSS':
				# regex grabs entire block since no nesting allowed
				m = re.match(self.t_CODE_BLOCK_CSS, tok.value, re.M|re.I|re.S)
				text = m.group(1)
				
				self.handle_codeblock(parser, text)

			elif tok.type == 'CODE_BLOCK_CPP':
				# regex grabs entire block since no nesting allowed
				m = re.match(self.t_CODE_BLOCK_CPP, tok.value, re.M|re.I|re.S)
				text = m.group(1)
				
				self.handle_codeblock(parser, text)

			elif tok.type == 'CODE_BLOCK_HTML':
				# regex grabs entire block since no nesting allowed
				m = re.match(self.t_CODE_BLOCK_HTML, tok.value, re.M|re.I|re.S)
				text = m.group(1)
				
				self.handle_codeblock(parser, text)

			
			#elif tok.type == 'CODE_START':
			#	# note: while in code, nothing else comes here (see above),
			#	# so don't have to test for nesting
			#	parser.beginCode()
			#	self.in_code = 1

			#elif tok.type == 'CODE_END':
			#	# is it a code block?
			#	if self.in_code:
			#		parser.endCode()
			#		self.in_code = 0
			#	# else, might be a CSS block ending
			#	elif len(css_stack):
			#		# pop name and inform parser
			#		name = css_stack.pop()
			#		parser.endCSSBlock(name)
			#	# otherwise, it's just regular text
			#	else:
			#		parser.characters(tok.value)
					
			elif tok.type == 'TABLEROW_START':
				if not self.in_table:
					parser.beginTable()
					self.in_table = 1
				
				parser.beginTableRow()
				self.in_tablerow = 1
				parser.beginTableCell()
				self.in_tablecell = 1
				#in_tablerow = 1
				
			elif tok.type == 'TABLEROW_END':
				if not self.in_table:
					# split | portion from "\n" portion
					m = re.match(self.t_TABLEROW_END, tok.value, re.M|re.I|re.S)
					parser.characters(m.group(1))
					# feed \n back to parser
					txt = self.lexer.lexdata[self.lexer.lexpos:]
					self.lexer.input('\n' + txt)					
				else:
					parser.endTableCell()
					self.in_tablecell = 0
					parser.endTableRow()
					self.in_tablerow = 0
				
			elif tok.type == 'TABLE_END':
				if not self.in_table:
					# split | portion from "\n" portion
					m = re.match(self.t_TABLE_END, tok.value, re.M|re.I|re.S)
					parser.characters(m.group(1))
					# feed \n's back to parser
					txt = self.lexer.lexdata[self.lexer.lexpos:]
					self.lexer.input(m.group(2) + txt)
				else:
					parser.endTableCell()
					self.in_tablecell = 0
					parser.endTableRow()
					self.in_tablerow = 0
					parser.endTable()
					self.in_table = 0
					
			elif tok.type == 'TABLEROW_CAPTION':
				# watch for caption as first row of table
				if not self.in_table:
					parser.beginTable()
					self.in_table = 1
					
				m = re.match(self.t_TABLEROW_CAPTION, tok.value, re.M|re.I|re.S)
				parser.setTableCaption(m.group(1))
				
				txt = self.lexer.lexdata[self.lexer.lexpos:]
				
				# have to check for table ending since I grabbed the \n
				if re.match(r"[\t ]*[\n]", txt):
					parser.endTable()
					self.in_table = 0
					
			elif tok.type == 'PIPECHAR':
				if self.in_table and not (in_link or in_imglink):
					parser.endTableCell()

					# Start next cell UNLESS this is the end of the buffer.
					# Prevents having a false empty cell at the end of the
					# table if the row ends in EOF
					txt = self.lexer.lexdata[self.lexer.lexpos:]
					if not only_spaces(txt):
						parser.beginTableCell()
					else:
						self.in_tablecell = 0
						
				elif in_link or in_imglink:
					parser.linkSeparator()
				else:
					parser.characters(tok.value)
				
			elif tok.type == 'SEPARATOR':
				parser.separator()

			elif tok.type == 'CATCH_URL':
				if in_link or in_imglink:
					parser.characters(tok.value)
				else:
					# turn bare URL into full URL
					parser.beginLink()
					#parser.characters('%s|%s' % (tok.value, tok.value))
					parser.characters(tok.value)
					parser.linkSeparator()
					parser.characters(tok.value)
					parser.endLink()

			elif tok.type == 'NULLDOT':
				pass # nothing
				
			#elif tok.type == 'DELETE_ME':
			#	pass # nothing
	
			elif tok.type == 'XHTML_ENTITY':
				s = tok.value
				if s[-1] == ';': # remove ; if present
					addsemi = u';' # remember to add back (below), if needed
					s = s[:-1]
				else:
					addsemi = u''
					
				s = s[1:] # strip &
				
				if s == '#DeleteMe':
					continue
				
				# check for hex entity
				m = re.match(r'\#x([0-9a-h]+)', s, re.M|re.I|re.S)
				if m:
					if m.group(1) in ['200b','200B']:
						# &#x200b; is special - pass to XML layer
						parser.characters('&#x200b;')
					else:
						parser.characters(unichr(hex2int(m.group(1))))
						
					continue
					
				# check for decimal entity
				m = re.match(r'\#([0-9]+)', s, re.M|re.I|re.S)
				if m:
					parser.characters(unichr(int(m.group(1))))
					continue
					
				# see if name defined in htmlentitydefs
				import htmlentitydefs as hed
				if hed.name2codepoint.has_key(s):
					parser.characters(unichr(hed.name2codepoint[s]))
				else:
					# else, return as raw text (will be escaped in final output)
					parser.characters(u'&' + s + addsemi)
											
			#elif tok.type == 'HTML_HEX_ENTITY':
			#	# reparse hex part
			#	m = re.match(self.t_HTML_HEX_ENTITY, tok.value, re.M|re.I|re.S)
				
			elif tok.type == 'DASH':
				parser.dash()
				
			#elif tok.type == 'MACRO':
			#	# macro has already run, insert text ...
			#	#parser.characters(self.no_tags(tok.value))
			#	parser.characters(tok.value)
				
			elif tok.type == 'PYTHON_EMBED':
				# compile code and save in mcontext. doesn't do anything till
				# called as macro later
				import wikklytext.macro
				
				if self.wcontext.restricted_mode:
					self.wcontext.parser.error("Not allowed to define macros in Safe Mode",
									tok.rawtext, '')
					continue
					
				try:
					wikklytext.macro.insert_pycode(self.wcontext, tok.value)
				except WikError, exc:
					#print "ERROR B"
					# lexer already positioned after <?py .. ?> so nothing to reposition
					self.wcontext.parser.error(exc.message, exc.looking_at, exc.trace)
					
				# nothing sent to parser
				
			#elif tok.type == 'RAWHTML':
			#	print "** RAWHTML **",tok.value
			#	parser.characters(tok.value)

			elif tok.type == "HTML_BREAK":
				parser.linebreak()
				
			elif tok.type == 'EOLS':
				# Do NOT handle lists here - they have complex nesting rules so must be
				# handled separately (above)
				
				if in_heading:
					parser.endHeading()
					in_heading = 0
					
				#if in_tablerow:
				#	parser.endTableRow()
				#	in_tablerow = 0
					
				#if not in_table:
				parser.EOLs(tok.value)				

				if in_defterm:
					parser.endDefinitionTerm()
					in_defterm = 0
					
				if in_defdef:
					parser.endDefinitionDef()
					in_defdef = 0
				
			# remember for next pass
			last_token = (tok.type,tok.value)
			
