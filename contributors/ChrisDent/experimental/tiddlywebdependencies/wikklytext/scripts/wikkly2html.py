"""
wikkly2html.py: WikklyText to HTML, command-line program. Part of the WikklyText suite.

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

import sys, os, shutil
from time import time, ctime
from wikklytext import copy_CSS_elements
from wikklytext.base import load_wikitext, bytes_to_str, HTML_PRE, HTML_POST, ifelse, Text
from wikklytext import WikklyText_to_InnerHTML
import wikklytext.base, wikklytext.coremacros

OPTS = None

# catch any unhandled exceptions and write traceback to output file
def my_except_hook(etype, evalue, etraceback):
	import wikklytext.error
	global OPTS
	
	if OPTS.outname == '*stdout*':
		outname = None
	else:
		outname = OPTS.outname

	wikklytext.error.exception_to_html_exit((etype,evalue,etraceback), HTML_PRE(ENCODING), 
										HTML_POST(ENCODING), ENCODING, outname)

sys.excepthook = my_except_hook

def treehook(rootnode, context):
	from wikklytext.wikwords import wikiwordify
	# no wikiwords here, just removal of '~' escapes.
	wikiwordify(rootnode, context, {})

def do_main():
	global OPTS
	
	# parse command line
	from wikklytext.cmdline import BasicOptParser
	op = BasicOptParser('wikkly2html.py', 'Converts WikklyText to HTML')
	op.add_stropt('o', 'output', 'outname', 'Set output filename', '*stdout*')
	op.add_stropt('m', 'mode', 'mode', 'Set mode (full|safe)', 'full')
	op.add_intopt('t', 'maxtime', 'maxtime', 'Set maximum run time (-1 for unlimited)', -1)
	op.add_boolopt('h', 'help', 'help', 'Display this help')
	op.add_boolopt('c', 'css', 'copy_css', 'Copy .CSS file to destination directory (unless it already exists)')
	OPTS,args = op.process(sys.argv[1:])
	
	# check args
	if OPTS.help or len(args) != 1 or OPTS.mode not in ['safe','full']:
		op.show_usage('filename.txt')
		sys.exit(0)
	
	if OPTS.copy_css and OPTS.outname == '*stdout*':
		print "** ERROR: When using '-c' you must also use '-o'"
		sys.exit(1)
	
	# make outname absolute in case of chdir later
	if OPTS.outname != '*stdout*':
		OPTS.outname = os.path.abspath(OPTS.outname)
		
	# change if desired ...
	ENCODING = 'utf-8'
	
	t_begin = time()
	
	# enable logging (in case an exception happens)
	wikklytext.base.enable_logging(True)

		
	# set full/safe mode
	safe_mode = ifelse(OPTS.mode == 'full', False, True)
	
	# make infilename absolute path in case of chdir later
	infilename = os.path.abspath(args[0])
	
	# vars to set in WikContext
	setvars = {
		'$FS_CWD': os.path.split(infilename)[0],
	}		
	
	# add document path to sys.path -- ONLY if not in safe mode to prevent
	# untrusted users from overriding standard modules
	if not safe_mode:
		sys.path.insert(0, os.path.split(infilename)[0])
		
	buf = load_wikitext(infilename)
	in_bytes = len(buf)
	
	inner, context = WikklyText_to_InnerHTML(buf, ENCODING, safe_mode, setvars, 
						max_runtime=OPTS.maxtime, tree_posthook=treehook)
	
	# see if wikitext set a $TITLE
	from wikklytext.util import var_get_text
	
	doc_title = var_get_text(context, '$TITLE')
	if not len(doc_title):
		doc_title = None # don't set a title if empty
		
	# log in case an error occurred (so test case can be reproduced)
	wikklytext.base.log_content(buf, inner)
	
	out_bytes = len(inner)
	
	t_end = time()
	
	# add "Processed by ..." tag. I find it annoying to have the banner on short content, so only
	# add if content is of significant length. It's the OUTPUT length that matters here, since
	# even a short input like <<help>> can generate a lot of output.
	if out_bytes > 1000:
		ptag = u"WikklyText %s on %s" % (wikklytext.base.get_version(), ctime(time()))
		ptag += " [%s, %.1fs] " % (bytes_to_str(out_bytes), t_end-t_begin)
		
		tag = u''
		tag += u"<div class='wikkly-generated-by'>"
		tag += u"Written in <a class='wikkly-a-www' title='%s' href='http://wikklytext.com'>WikklyText</a>." % ptag
		tag += "</div>"
	
		tag = tag.encode(ENCODING)
	else:
		tag = ''.encode(ENCODING)
	
	output = HTML_PRE(ENCODING, doc_title, include_navmenu=False) + inner + tag + HTML_POST(ENCODING)
	
	if OPTS.outname == '*stdout*':
		print output
	else:
		outname = OPTS.outname
		
		open(outname,'wb').write(output)
		
		# does user want the .css file copied as well?
		if OPTS.copy_css:
			path = os.path.split(os.path.abspath(outname))[0]
			path = os.path.join(path,'css')
			if not os.path.isdir(path):
				os.makedirs(path)
				
			copy_CSS_elements(os.path.join(path))

if __name__ == '__main__':
	do_main()
	
