"""
wikklytext.coremacros.py: Core WikklyText macros. Part of the WikklyText suite.

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

#--------------------------------------------------------------------
#
# XXX: TODO. I removed UserMacros for the time being. Need to do
# something else rather than hardcoding a name I think.
#
# To define you own macros, edit 'wikklytext.UserMacros.py', NOT this file!
#
#--------------------------------------------------------------------

__safe__ = ['echo', 'echos', 'set', 'get', 'info', 'infobox', 'warn', 'warnbox', 'codebox', 'indent', 'note',
			'if_full_mode', 'if_safe_mode', 'help', 'version', 'closeAll']
__unsafe__ = ['include', 'include_pyfunc', 'include_code', 'include_pymod', 'py_add_path',
				'debug']

from wikklytext.eval import eval_wiki_macro_args, eval_wiki_text
from wikklytext.base import xmltrace, load_wikitext, wikitext_as_unicode, \
			WikError, Text, Element, ElementList, DIV
#import elementtree.ElementTree as etree
import inspect, sys, os
from wikklytext.macro import my_get_module
from wikklytext.util import var_get_text

def function_module(func):
	"Get module that function 'func' belongs to."
	return sys.modules[func.__module__]

def generate_macro_docs(mod, names):
	unsafe = getattr(mod, '__unsafe__', [])

	txt = ''
	
	# write index
	for name in names:
		txt += '* [[%s|#MACRO_%s]]' % (name, name)
		
		if name in unsafe:
			txt += ' {{grayout{(//Full Mode only//)}}}'
		
		txt += '\n'
		
	for name in names:
		func = getattr(mod, name)
		txt += "''%s'' [[#MACRO_%s]] " % (name, name)
		if name in unsafe:
			txt += ' {{grayout{(//Full Mode only//)}}}'
		
		txt += '<<indent """%s""">>\n\n' % func.__doc__
	
	return txt
	
def help(mcontext):
	"""
	|!Usage|{{{<<help>>}}}|
	|!Description|Generates this help text.|
	|!Example|{{{<<help>>}}}|
	|!Result|//You're looking at it!//|
	"""
	from pkg_resources import resource_string

	txt = ''
	
	# get my own module
	mymod = function_module(help)
	
	#mypath,n = os.path.split(mymod.__file__)
	#if len(mypath):
	#	txt += load_wikitext(os.path.join(mypath,'helptext.txt'))
	#else:
	#	txt += load_wikitext('helptext.txt')

	txt += wikitext_as_unicode(resource_string('wikklytext', 'doc/helptext.txt'))
	
	# add macro documentation
	
	# built-in macros first
	txt += '!![[#MACRO_DOCS]]Built-in Macros\n'
	
	# only show user the functions they are allowed to use
	if mcontext.restricted_mode:
		names = __safe__
	else:
		names = __safe__ + __unsafe__
		
	names.sort()
	
	txt += generate_macro_docs(mymod, names)

	# user macros
	#txt += '!![[#USER_MACRO_DOCS]]User-defined Macros\n'

	#txt += '\n<<indent <quote>//This may not match the list of user-defined macros available at your site.//</quote>>>\n\n'
		
	#mUser = __import__('wikklytext.UserMacros')
	#mUser = my_get_module('wikklytext.UserMacros')
	
	# only show user the functions they are allowed to use
	#if mcontext.restricted_mode:
	#	names = getattr(mUser, '__safe__', [])
	#else:
	#	names = getattr(mUser, '__safe__', []) + getattr(mUser, '__unsafe__', [])
		
	#names.sort()
	
	#txt += generate_macro_docs(mUser, names)

	return txt

def debug(context, *elements):
	"""
	|!Usage|{{{<<debug arg arg ...>>}}}|
	|!Description|Prints arguments to stdout - does //not// become part of document.|
	|!Example|//No example, to prevent console noise.//|
	|!Result||
	"""
	print "** DEBUGGING TRACE **"		
	elements = eval_wiki_macro_args(context, elements)
	print xmltrace(elements)
	print "**********END DEBUG***********"
	
	return Text('')
	
def echo(context, *elements):
	"""
	|!Usage|{{{<<echo arg arg ...>>}}}|
	|!Description|Echo back input arguments. Arguments are wikified just as if they were inline.|
	|!Example|{{{<<echo "//Hello//-" world '''-__macro__'''>>}}}|
	|!Result|<<echo "//Hello//-" world '''-__macro__'''>>|
	"""
	elements = eval_wiki_macro_args(context, elements)
	out = ElementList()
	for e in elements:
		out.append(e)
		
	return out

def echos(context, *elements):
	"""
	|!Usage|{{{<<echos arg arg ...>>}}}|
	|!Description|Like {{{echo}}} but adds a space between arguments.|
	|!Example|{{{<<echos "AAA" BBB '''CCC'''>>}}}|
	|!Result|<<echos "AAA" BBB '''CCC'''>>|
	"""
	elements = eval_wiki_macro_args(context, elements)
	out = ElementList()
	for e in elements:
		out.append(e)
		out.append(Text(' '))
		
	return out

def if_safe_mode(context, *elements):
	"""
	|!Usage|{{{<<if_safe_mode arg arg ...>>}}}|
	|!Description|If running in Safe Mode, return wikified args, else return nothing.|
	|!Example|{{{<<if_safe_mode "Hello ''Safe Mode''">>}}}|
	|!Result|<<if_safe_mode "Hello ''Safe Mode''">>|
	"""	
	if context.restricted_mode is True:
		return eval_wiki_macro_args(context, elements)
	else:
		return ElementList()

def if_full_mode(context, *elements):
	"""
	|!Usage|{{{<<if_full_mode arg arg ...>>}}}|
	|!Description|If running in Full Mode, return wikified args, else return nothing.|
	|!Example|{{{<<if_full_mode "Hello ''Full Mode''">>}}}|
	|!Result|<<if_full_mode "Hello ''Full Mode''">>|
	"""	
	if context.restricted_mode is False:
		return eval_wiki_macro_args(context, elements)
	else:
		return ElementList()
	
def set(context, name, *elements):
	"""
	|!Usage|{{{<<set name arg arg ... >>}}}|
	|!Description|Create a named variable containing the given wiki text. The text is evaluated (just as if it was inline) and stored. It can be retrieved later with {{{get()}}}.<br><br>//NOTE: Names beginning with {{{$}}} are reserved for system use.//|
	|!Example|{{{<<set TestVar "Some __text__ ''here''">>}}}|
	|!Result|//No return value.//|
	"""
	name = name.text
	
	elements = eval_wiki_macro_args(context, elements)
	
	#if not hasattr(context, 'vars'):
	#	setattr(context, 'vars', {})
		
	#context.vars[name] = elements
	
	# '$' vars go into .sysvars
	if name[0] == '$': 
		# strip '$'
		context.sysvars[name[1:]] = elements
	else: 
		# others go into .uservars
		context.uservars[name] = elements
	
	return ElementList() # no output

def get(context, name):
	"""
	|!Usage|{{{<<get name>>}}}|
	|!Description|Get the wikitext stored in the named variable (from an earlier call to {{{<<set>>}}}).|
	|!Example|{{{<<set TestVar "Some __text__ ''here''">>}}}<br><br>{{{<<get TestVar>>}}}|
	|!Result|<<set TestVar "Some __text__ ''here''">><<get TestVar>>|
	"""
	name = name.text
	
	if name[0] == '$':
		elements = context.sysvars.get(name[1:], Text('* ERROR in get() - unknown var $%s *' % name[1:]))
	else:
		elements = context.uservars.get(name, Text('* ERROR in get() - unknown var %s *' % name))
	
	return elements

def infobox(context, title, *elements):
	"""
	|!Usage|{{{<<infobox title content [...]>>}}}<br>{{{<<infobox content>>}}}|
	|!Description|First form: Create an information box with a title.<br>Second form: Create a box with no title.|
	|!Example|{{{<<infobox "A Title" AA BB CC " and //italic text//">>}}}<br>{{{<<infobox "This box has no title and uses a ''different'' __style__.">>}}}|
	|!Result|<<infobox "A Title" AA BB CC " and //italic text//">><br><<infobox "This box has no title and uses a ''different'' __style__.">>|
	"""
	if len(elements):
		container = DIV('wikkly-infobox-container')
		# have one or more elements, so use 'title' as the title
		titlediv = DIV('wikkly-infobox-title')
		for node in eval_wiki_macro_args(context, [title]):
			titlediv.append(node)
			
		container.append(titlediv)
	
		body = DIV('wikkly-infobox-body')
		for node in eval_wiki_macro_args(context, elements):
			body.append(node)
	
		container.append(body)
	else:
		# no elements, so 'title' is really the content
		container = DIV('wikkly-infobox-mini')
		for node in eval_wiki_macro_args(context, [title]):
			container.append(node)
	
	return [container]

def info(context, title, *elements):
	"""
	This is an alias for {{{<<infobox>>}}}.
	|!Example|{{{<<info "Hello title" Hello " " content>>}}}|
	|!Result|<<info "Hello title" Hello " " content>>|
	"""
	return infobox(context, title, *elements)
	
def warnbox(context, title, *elements):
	"""
	|!Usage|{{{<<warnbox title content [...]>>}}}<br>{{{<<warnbox content>>}}}|
	|!Description|First form: Create an warning box with a title.<br>Second form: Create a box with no title.|
	|!Example|{{{<<warnbox "A Title" AA BB CC " and //italic text//">>}}}<br>{{{<<warnbox "This box has no title and uses a ''different'' __style__.">>}}}|
	|!Result|<<warnbox "A Title" AA BB CC " and //italic text//">><br><<warnbox "This box has no title and uses a ''different'' __style__.">>|
	"""
	if len(elements):
		container = DIV('wikkly-warnbox-container')
		# have one or more elements, so use 'title' as the title
		titlediv = DIV('wikkly-warnbox-title')
		for node in eval_wiki_macro_args(context, [title]):
			titlediv.append(node)
			
		container.append(titlediv)
		
		body = DIV('wikkly-warnbox-body')
		for node in eval_wiki_macro_args(context, elements):
			body.append(node)
	
		container.append(body)
	else:
		# no elements, so 'title' is really the content
		container = DIV('wikkly-warnbox-mini')
		for node in eval_wiki_macro_args(context, [title]):
			container.append(node)
	
	return [container]

def warn(context, title, *elements):
	"""
	This is an alias for {{{<<warnbox>>}}}.
	|!Example|{{{<<warn "Hello title" Hello " " content>>}}}|
	|!Result|<<warn "Hello title" Hello " " content>>|
	"""
	return warnbox(context, title, *elements)

def codebox(context, title, codetext):
	"""
	|!Usage|{{{<<codebox title arg [arg ...]>>}}}|
	|!Description|Like a regular code box, except with a title.|
	|!Example|{{{<<codebox "A Title" '''
for i in range(10):
	print i'''>>}}}|
	|!Result|<<codebox "A Title" '''
for i in range(10):
	print i'''>>|
	"""	
	if codetext.tag != 'MacroText':
		raise WikError("'codetext' must be a single text argument - got %s" % codetext.tag)
		
	container = DIV('wikkly-codebox-container')
	titlediv = DIV('wikkly-codebox-title')
	for node in eval_wiki_macro_args(context, [title]):
		titlediv.append(node)
		
	container.append(titlediv)
	
	body = DIV('wikkly-codebox-body')

	# place in TextCode element so it will get the proper code-style escaping
	#textnode = etree.Element('TextCode')
	#textnode.text = codetext.text
	textnode = Text(codetext.text, 'TextCode')
	
	body.append(textnode)
	
	container.append(body)
	
	return [container]

def note(context, *elements):
	"""
	|!Usage|{{{<<note text>>}}}|
	|!Description|Create a simple note box without a title.|
	|!Example|{{{<<note "Here is a note with //italic text// and ''bold text''.">>}}}|
	|!Result|<<note "Here is a note with //italic text// and ''bold text''.">>|
	"""
	box = DIV('wikkly-notebox')
	for node in eval_wiki_macro_args(context, elements):
		box.append(node)

	return [box]
	
def indent(context, *elements):
	"""
	|!Usage|{{{<<indent arg arg ...>>}}}|
	|!Description|<<echo <quote>Do a block indent, preserving all other formatting. Functionally, this is the
	same as:
		{{{
{{indent{ ... }}&#x200b;}
}}}<br> ... but sometimes a macro is more convenient.</quote>>>|
	|!Example|{{{Next line<br><<indent 'is indented'>>}}}|
	|!Result|Next line<br><<indent 'is indented'>>|
	"""
	block = DIV('wikkly-indent')
	for node in eval_wiki_macro_args(context, elements):
		block.append(node)
		
	return block

def filepath(context, filename):
	"Convert filename to absname by prepending $FS_CWD"
	if os.path.isabs(filename):
		return filename
	else:
		return os.path.normpath(os.path.join(var_get_text(context, '$FS_CWD'), filename))
		
def include(context, filename):
	"""
	|!Usage|{{{<<include filename>>}}}|
	|!Description|Include the entire contents of a file (contents will be parsed as wiki text).<br>The included file is allowed to have a different text encoding than the current file.|
	|!Example|{{{
''An ASCII encoded file:'' <<include "doc/mbsamples/english.txt">>
''An ISO-8859-7 (Greek) encoded file:'' <<include "doc/mbsamples/greek.txt">>}}}|
	|!Result|''An ASCII encoded file:'' <<include "doc/mbsamples/english.txt">><br>''An ISO-8859-7 (Greek) encoded file:'' <<include "doc/mbsamples/greek.txt">>|
	"""
	from pkg_resources import resource_string, resource_exists

	name = filepath(context, filename.text)
	if os.path.isfile(name):
		return eval_wiki_text(context, load_wikitext(name))
	
	# see if its a builtin resource
	if resource_exists('wikklytext',filename.text):
		txt = wikitext_as_unicode(resource_string('wikklytext', filename.text))
		return eval_wiki_text(context, txt)	
	else:
		return eval_wiki_text(context, u'{{highlight{ERROR - No such file or resource "%s"}}}' % filename.text)	

def include_pyfunc(context, modulename, funcname, title=None):
	"""
	|!Usage|{{{<<include_pyfunc modulename funcname title>>}}}|
	|!Description|<<echo <quote>Include the source code for a single Python function from 
	the named module. Module must be in {{{sys.path}}} or {{{'.'}}}.
	{{{title}}} is the title for the box. If not given it defaults to ''modulename.funcname()''.</quote> >>|
	|!Example|{{{<<include_pyfunc atexit register>>}}}|
	|!Result|<<include_pyfunc atexit register>>|
	"""	
	# these must both be Text* nodes
	modulename = modulename.text
	funcname = funcname.text
	
	if title is None:
		title = '%s.%s()' % (modulename, funcname)
	else:
		title = title.text
		
	try:
		mod = my_get_module(modulename)
		func = getattr(mod,funcname)
		src = inspect.getsource(func)
	except:
		return warnbox(context, Text(u'ERROR', 'MacroText'),
					Text(u'Unable to get source for "%s.%s"' % (modulename, funcname), 'MacroText'))
		
	code = ''
	
	for line in src.splitlines():
		code += line + '\n'
		
	del sys.modules[modulename]
	
	# pass it off to codebox() to do formatting (remember it expects <MacroText> args)
	return codebox(context, Text(title, 'MacroText'), Text(code, 'MacroText')) 
	
def py_add_path(context, path):
	"""
	|!Usage|{{{<<py_add_path path>>}}}|
	|!Description|Add the given path to {{{sys.path}}}. This is useful when you want to use {{{include_code}}}, {{{include_pyfunc}}} or {{{include_pymod}}} on a module in an arbitrary location.|
	|!Example|{{{<<set TestVar "Some __text__ ''here''">>}}}|
	|!Result|//No return value.//|
	"""
	p = path.text
	p = os.path.abspath(p)
	#print "*** ADD PATH ***",p
	sys.path.insert(0,p)
	return ElementList()

def include_code(context, filename, title=None):
	"""
	|!Usage|{{{<<include_pyfunc filename title>>}}}|
	|!Description|<<echo <quote>Include a file as a block of code (as if it
	were included inside {{{{{{ .. }}&#x200b;}&#x200b;}}}). Searches in {{{sys.path}}} and {{{'.'}}} if
	absolute path not given. {{{title}}} is the title for the box. If not given it defaults to ''filename''.</quote> >>|
	|!Example|{{{<<include_code doc/sample.py>>}}}|
	|!Result|<<include_code doc/sample.py>>|
	"""	
	from pkg_resources import resource_string, resource_exists

	name = filename.text
	fullname = filepath(context, name)
	
	# search in sys.path also
	if not os.path.isfile(fullname):
		for path in sys.path:
			if os.path.isfile(os.path.join(path,name)):
				fullname = os.path.join(path,name)
				break
	
	# if still not found, try resources
	if not os.path.isfile(fullname):
		if resource_exists('wikklytext', filename.text):
			buf = resource_string('wikklytext', filename.text)
			if title is None:
				title = os.path.basename(filename.text)
			else:
				title = title.text
		else:
			return eval_wiki_text(context, u'{{highlight{ERROR - No such file or resource "%s"}}}' % filename.text)	
	else:
		buf = open(fullname,'r').read()
		
		if title is None:
			title = os.path.basename(fullname)
		else:
			title = title.text
			
	return codebox(context, Text(title, 'MacroText'), Text(buf, 'MacroText'))
	
def include_pymod(context, modulename, title=None):
	"""
	|!Usage|{{{<<include_pymod modulename title>>}}}|
	|!Description|<<echo <quote>Include the source code for a Python module. 
	Module must be in {{{sys.path}}} or {{{'.'}}}.
	{{{title}}} is the title for the box. If not given it defaults to ''modulename''.</quote> >>|
	|!Example|{{{<<include_pymod statvfs "A Title">>}}}|
	|!Result|<<include_pymod statvfs "A Title">>|
	"""	
	modulename = modulename.text
	
	try:
		mod = my_get_module(modulename)
		src = inspect.getsource(mod)			
	except:
		return warnbox(context, Text(u'ERROR', 'MacroText'), 
						Text(u"Unable to import module '%s'" % modulename, 'MacroText'))
		
	if title is None:
		title = modulename
	else:
		title = title.text
	
	txt = ''
	
	for line in src.splitlines():
		txt += line + '\n'
		
	del sys.modules[modulename]
	
	return codebox(context, Text(title, 'MacroText'), Text(txt, "MacroText"))
	
def version(context):
	"""
	|!Usage|{{{<<version>>}}}|
	|!Description|Get the WikklyText version number.|
	|!Example|{{{<<version>>}}}|
	|!Result|<<version>>|
	"""	
	from wikklytext.base import get_version
	
	return Text(get_version())
	
def closeAll(context):
	"""
	|!Usage|{{{<<closeAll>>}}}|
	|!Description|//This only exists for compatibility with TiddlyWiki texts.<br><br>It does not do anything.//|
	|!Example|{{{<<closeAll>>}}}|
	|!Result|<<closeAll>>|
	"""	
	return Text('')
	
