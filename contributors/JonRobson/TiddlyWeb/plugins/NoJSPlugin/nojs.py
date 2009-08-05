from tiddlyweb.wikitext import render_wikitext
# The templating system, chosing because it is
# django like without requiring the rest of django.
from jinja2 import Environment, FileSystemLoader,TemplateNotFound

import re
import datetime

from twplugins import do_html, entitle, require_any_user #should say please install tiddlyweb-plugins not twplugins

# make_command is a decorator that creates a 
# command for twanager, the command line tool
from tiddlyweb.manage import make_command

# Data entities
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler

# Data storage system
from tiddlyweb.store import Store, NoBagError,NoTiddlerError

# The put method from the tiddler web handler
# is used to allow us to put a tiddler, via a
# different URL.
from tiddlyweb.web.handler.tiddler import put

# The HTMLPresenter wraps outgoing HTML when
# a browser makes a web request. It is part
# of the WSGI stack, as diagrammed here: 
# http://cdent.tumblr.com/post/55167654/tiddlyweb-plugins
from tiddlyweb.web.wsgi import HTMLPresenter

# function to handle figuring out which bag tiddlers are in given a recipe
from tiddlyweb import control

# TiddlyWeb has built in logging. See pydoc logging.
import logging

# Set a template environment that describes where to
# load template files from.


template_env = Environment(loader=FileSystemLoader('./templates/'))


import os
import re

def define_index():
  create_file_if_new("index.html")
  text = "<html><head>{% include 'nojs/MarkupPreHead.html' %}"+\
  "<title>{% include 'nojs/SiteTitle.html' %}</title>"+\
  "<style type='text/css'>.hide_nojavascript {display:none;}"+\
  "{% include 'nojs/StyleSheetColors.html'%}"+\
  "{% include 'nojs/StyleSheetLayout.html'%}{% include 'nojs/StyleSheet.html' %}"+\
  "#saveTest {display:none;}\n#messageArea {display:none;}\n#copyright {display:none;}\n#storeArea {display:none;}\n#storeArea div {padding:0.5em; margin:1em 0em 0em 0em; border-color:#fff #666 #444 #ddd; border-style:solid; border-width:2px; overflow:auto;}\n#shadowArea {display:none;}\n#javascriptWarning {width:100%; text-align:center; font-weight:bold; background-color:#dd1100; color:#fff; padding:1em 0em;}</style>"+\
  "</head>"+\
  "<body><div id='contentWrapper' class='backstageVisible'>{% include 'nojs/PageTemplate.html' %}</div></body></html>"
  fileObj = open(nojspath+"index.html","w") #open for write
  fileObj.write(text)
  fileObj.close()
  
def define_default_templates():
  define_index()
def create_file_if_new(filename):
  d = os.path.dirname(nojspath+filename)
  if not os.path.exists(d):
      os.makedirs(d)


def cleanup_text(text):
  text =text.replace("/*{{{*/","")
  text =text.replace("/*}}}*/","")
  text =text.replace("<!--}}}-->","")
  text =text.replace("<!--{{{-->","")
  return text

global tiddlers_in_memory
tiddlers_in_memory = {}
def templatify(text,environ): 

  def import_tiddler(m):
    tiddler_name = m.group(2)
    create_tiddler(tiddler_name,environ)
    newtext = "%s%s%s>{%% include 'nojs/%s.html' %%}"%(m.group(1),m.group(2),m.group(3),m.group(2))
    return newtext
  text = re.sub("(tiddler=[\'\"])([^\'\"]*)([\'\"][^>]*)>",import_tiddler,text)
  
  def override_tiddler_display(m):
    return "%s {%% for tiddler in tiddlers %%}<div class='tiddler' id=\"tiddler{{tiddler.title|escape}}\">{%% include 'nojs/ViewTemplate.html' with context %%}</div>{%% endfor %%}"%(m.group(0))
    
  def override_view_macro_with_wikifying(m):
    fieldname = m.group(1)
    if fieldname not in ["text","title"]:
      fieldname = "fields[\"%s\"]"%fieldname
    return "%s{{tiddler.%s|wikified}}"%(m.group(2),fieldname)
    
  def override_view_macro_without_wikifying(m):
    fieldname = m.group(1)
    if fieldname not in ["text","title"]:
      fieldname = "fields[\"%s\"]"%fieldname
    return "%s{{tiddler.%s}}"%(m.group(2),fieldname)


  def import_tiddler_slice(m):
    tiddler_name = m.group(1)
    tiddler_slice = m.group(2)
    try:
      store = environ['tiddlyweb.store']  
      try:
        tiddler = store.get(Tiddler(tiddler_name,get_bag(tiddler_name,environ)))
        tiddler_text = tiddler.text
      except NoTiddlerError:
        tiddler_text = get_shadowed_text(tiddler_name)
      tiddlers_in_memory[tiddler_name] = tiddler_text
      lines = tiddlers_in_memory[tiddler_name].split("\n")
      for line in lines:
        name_value = line.split(":")
        if name_value[0] == tiddler_slice:
          return name_value[1]
      return ""
    except KeyError:
      return ""
  
  def addtags(m):
        return "%s{%% for tag in tiddler.tags %%}{{tag|tiddlerlink}}{%% if not loop.last %%}<br>{%%endif%%}{%%endfor%%}"%(m.group(1))
        
  def noscriptmessage(m):
    return "%s<a class='errorButton'>Error in macro &lt;&lt;%s&gt;&gt; - javascript is required!</a>"%(m.group(2),m.group(1))
  text = re.sub("macro=['\"]view ([^ ]*) wikified['\"]([^>]*>)",override_view_macro_with_wikifying,text)
  text = re.sub("macro=['\"]view ([^ ]*)['\"]([^>]*>)",override_view_macro_without_wikifying,text)
  text = re.sub("macro='tags'([^>]*>)",addtags,text)
  
  text = re.sub("macro=['\"]([^ ]*)['\"]([^>]*>)",noscriptmessage,text)
  
  text = re.sub(".*id='tiddlerDisplay'[^>]*>",override_tiddler_display,text)
  
  text = re.sub("\[\[([^:]*)::([^\]]*)\]\]",import_tiddler_slice,text)
  return text
  
  
def create_tiddler(tiddler_name,environ):
  store = environ['tiddlyweb.store']
  try:
    tiddler = store.get(Tiddler(tiddler_name,get_bag(tiddler_name,environ)))
    text = render_wikitext(tiddler, environ)
  except NoTiddlerError:
    text = ""
  create_jinja_template_file(tiddler_name,"%s"%(text))

def get_shadowed_text(tiddler_name):
  try:
    shadow = open("templates/DefaultShadows/%s.html"%(tiddler_name))
    text = shadow.read()
  except IOError:
    text = ""
  return text
    
def create_template(template_name,environ):
  store = environ['tiddlyweb.store']
  bag = get_bag(template_name,environ)  
  try:
    tiddler = store.get(Tiddler(template_name,bag))
    text =  tiddler.text
  except NoTiddlerError:
    text = get_shadowed_text(template_name)

  text =templatify(cleanup_text(text),environ)
  create_jinja_template_file(template_name,text)


def create_jinja_template_file(template_name,text):
  create_file_if_new(template_name)
  path="templates/nojs/%s.html"%template_name
  
  fileObj = open(path,"w")
  fileObj.write(text)
  fileObj.close()
      
def generate_template(template,tiddlers,environ):
    return template.generate(environ=environ,tiddlers=tiddlers)

def get_bag(tiddler_name,environ):
  try:
    bag = environ['selector.vars']['bag_name']
  except KeyError:
    store=environ['tiddlyweb.store']
    recipe = store.get(Recipe(environ['selector.vars']['recipe_name']))
    try:
      bagobj = control.determine_tiddler_bag_from_recipe(recipe, Tiddler(tiddler_name))
      bag = bagobj.name
    except NoBagError:
      bag = ""
  return bag
def generate_without_js(environ,start_response):

  def wikifier(str):
      tiddler = Tiddler("foo")
      tiddler.text = str
      return render_wikitext(tiddler,environ)
      
  def linkifier(str):
    return "<a href='%s'>%s</a>"%(str,str)
  template_env.filters['wikified'] =wikifier
  template_env.filters['tiddlerlink'] = linkifier
  try:
    fileObj = open("%s/index.html"%nojspath,"r") #open for write
  except IOError:
    define_default_templates()
  
  templates= ["PageTemplate","MarkupPreHead","ViewTemplate","StyleSheet","SiteTitle","StyleSheetLayout","StyleSheetColors"]
  for template_name in templates:
    try:
      fileObj = open("%s%s.html"%(nojspath,template_name),"r") #open for write
    except IOError:
      create_template(template_name,environ)
    
  
  template = template_env.get_template('nojs/index.html')  
  start_response('200 OK', [
      ('Content-Type', 'text/html; charset=utf-8')
  ])
  
  
  try:
    tiddler_name = environ['selector.vars']['tiddler_name']
    store = environ['tiddlyweb.store']
    tiddlers = [store.get(Tiddler(tiddler_name,get_bag(tiddler_name,environ)))]
  except KeyError,NoTiddlerError:
    tiddlers = []
  return generate_template(template,tiddlers,environ)

from tiddlywebplugins import replace_handler
def init(config_in):
    global config

    global nojspath 
    nojspath = "templates/nojs/"
    config = config_in
    
    
    logging.debug('going to add /jinx to selector')
    replace_handler(config['selector'],"/recipes/{recipe:segment}/tiddlers/{tiddler:segment}",dict(GET=generate_without_js))
    replace_handler(config['selector'],"/bags/{bag:segment}/tiddlers/{tiddler:segment}",dict(GET=generate_without_js))
    config["selector"].add("/nojs",GET=generate_without_js)
