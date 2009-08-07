global templates, viewtemplates
global template_sub_path
from jinja2 import Environment, FileSystemLoader,TemplateNotFound
template_sub_path = "nojs/"
templates= ["PageTemplate","MarkupPreHead","StyleSheet","SiteTitle","StyleSheetLayout","StyleSheetColors"]
viewtemplates = ["ViewTemplate","myblogViewTemplate","rssfeedsViewTemplate"]
template_env = Environment(loader=FileSystemLoader('templates/'))

from tiddlyweb.wikitext import render_wikitext

from tiddlyweb.manage import make_command
import logging
# Data entities
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from twplugins import replace_handler
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


# Set a template environment that describes where to
# load template files from.





import os
import re

def define_js_redirect(location):
  text = "<script type='text/javascript'>\nvar links = document.getElementsByTagName(\"a\");\n\nfor(var i=0; i < links.length; i++){\n  links[i].onclick = function(e){\n    var link = this.href;\n    if(link.indexOf(\"/tiddlers/\") != -1){\n      link = link.replace(/\/tiddlers\/([^/]*)/,\"/tiddlers.wiki#[[$1]]\");\n    }\n    this.href= link;\n   window.location = link;\n  };\n}\n</script>"
  fileObj = open(nojspath+"%sjs.html"%location,"w") #open for write
  fileObj.write(text)
  fileObj.close()      

def define_index(location):
  pathname = template_sub_path+ location
  create_file_if_new("%sindex.html"%location)
  text = "<html><head>{%% include '%sMarkupPreHead.html' %%}"%pathname+\
  "<title>{%% include '%sSiteTitle.html' %%}</title>"%pathname+\
  "<style type='text/css'>.hide_nojavascript {display:none;}"+\
  "{%% include '%sStyleSheetColors.html'%%}"%pathname+\
  "{%% include '%sStyleSheetLayout.html'%%}{%% include '%sStyleSheet.html' %%}"%(pathname,pathname)+\
  "#saveTest {display:none;}\n#messageArea {display:none;}\n#copyright {display:none;}\n#storeArea {display:none;}\n#storeArea div {padding:0.5em; margin:1em 0em 0em 0em; border-color:#fff #666 #444 #ddd; border-style:solid; border-width:2px; overflow:auto;}\n#shadowArea {display:none;}\n#javascriptWarning {width:100%; text-align:center; font-weight:bold; background-color:#dd1100; color:#fff; padding:1em 0em;}</style>"+\
  "</head>"+\
  "<body><div id='contentWrapper' class='backstageVisible'>{%% include '%sPageTemplate.html' %%}</div>{%% include '%sjs.html' %%}</body></html>"%(pathname,pathname)
  fileObj = open(nojspath+"%sindex.html"%location,"w") #open for write
  fileObj.write(text)
  fileObj.close() 

def define_default_templates(location):  
  define_index(location)
  define_js_redirect(location)
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
def templatify(text,location,environ): 
  
  def import_tiddler(m):
    tiddler_name = m.group(2)
    create_tiddler(tiddler_name,location,environ)
    newtext = "%s%s%s>{%% include '%s%s%s.html' %%}"%(m.group(1),m.group(2),m.group(3),template_sub_path,location,m.group(2))
    return newtext
  text = re.sub("(tiddler=[\'\"])([^\'\"]*)([\'\"][^>]*)>",import_tiddler,text)
  
  def override_tiddler_display(m):
    pathname = template_sub_path + location
    return "%s {%% for tiddler in tiddlers %%}<div class='tiddler' id=\"tiddler{{tiddler.title|escape}}\">{%% set templates_choices = tiddler.tags %%}\n{%% set res = templates_choices.append(\"\") %%}\n{%% set found = False %%}\n{%% for tag in templates_choices %%}\n{%% if tag+\"ViewTemplate\" in global_viewtemplates and not found%%}\n{%% include '%s'+tag+'ViewTemplate.html' with context %%}\n{%% set found = True %%}\n{%% endif %%}\n{%% endfor %%}</div>{%% endfor %%}"%(m.group(0),pathname)
    
  def override_view_macro_with_wikifying(m):
    fieldname = m.group(1)
    if fieldname not in ["text","title"]:
      fieldname = "fields[\"%s\"]"%fieldname
    return "%s{{tiddler.%s|wikified(tiddler.title)}}"%(m.group(2),fieldname)
    
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
  
  
def create_tiddler(tiddler_name,location,environ):
  store = environ['tiddlyweb.store']
  try:
    tiddler = store.get(Tiddler(tiddler_name,get_bag(tiddler_name,environ)))
    text = render_wikitext(tiddler, environ)
  except NoTiddlerError:
    text = ""
  create_jinja_template_file("%s%s"%(location,tiddler_name),"%s"%(text))

def get_shadowed_text(tiddler_name):
  try:
    shadow = open("templates/DefaultShadows/%s.html"%(tiddler_name))
    text = shadow.read()
  except IOError:
    text = ""
  return text
    
def create_template(template_name,location,environ):
  store = environ['tiddlyweb.store']
  bag = get_bag(template_name,environ)  
  try:
    tiddler = store.get(Tiddler(template_name,bag))
    text =  tiddler.text
  except NoTiddlerError:
    text = get_shadowed_text(template_name)

  text =templatify(cleanup_text(text),location,environ)
  create_jinja_template_file("%s%s"%(location,template_name),text)


def create_jinja_template_file(template_name,text):
  create_file_if_new(template_name)
  path="templates/%s%s.html"%(template_sub_path,template_name)
  
  fileObj = open(path,"w")
  fileObj.write(text)
  fileObj.close()
      
def generate_template(template,tiddlers,environ):
    return template.render(environ=environ,tiddlers=tiddlers,global_viewtemplates=viewtemplates)

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

def merge(list1, list2):
  newlist = list1
  for i in list2:
    newlist.append(i)
    
  return newlist
def generate_without_js(environ,tiddler_name):
  try:
    location ="bags/"+environ['selector.vars']['bag_name']+"/"
  except KeyError:
    location = "recipes/"+environ['selector.vars']['recipe_name']+"/"
  try:
    generatedindex = open("%s%sindex.html"%(nojspath,location),"r")
  except IOError:
    define_default_templates(location)
  

  for template_name in merge(templates,viewtemplates):
    try:
      fileObj = open("%s%s%s.html"%(nojspath,location,template_name),"r") #open for write
    except IOError:
      create_template(template_name,location,environ)
    
  
  template = template_env.get_template('%s%sindex.html'%(template_sub_path,location))    
  
  if tiddler_name:
    store = environ['tiddlyweb.store']
    try:
      tiddlertoview = store.get(Tiddler(tiddler_name,get_bag(tiddler_name,environ)))
    except NoTiddlerError:
      tiddlertoview = Tiddler(tiddler_name)
      tiddlertoview.text = ""
    tiddlers = [tiddlertoview]
  else:
    tiddlers = []
  return generate_template(template,tiddlers,environ)

EXTENSION_TYPES = {'nojswiki': 'nojs'}
SERIALIZERS = {
        'nojs': ['nojs', 'text/html; charset=UTF-8'],
}
        
from tiddlyweb.serializations.html import Serialization as HTMLSerialization

class Serialization(HTMLSerialization):
    
    def __init__(self, environ={}):
        def wikifier(mystr,title):
            tiddler = Tiddler("foo",get_bag(title,environ))
            tiddler.text = mystr
            return render_wikitext(tiddler,environ)
        def linkifier(str):
          return "<a href='%s'>%s</a>"%(str,str)
        template_env.filters['wikified'] =wikifier
        template_env.filters['tiddlerlink'] = linkifier
        self.environ = environ
        
    def tiddler_as(self, tiddler):
        return generate_without_js(self.environ,tiddler.title)

def init(config_in):
    global config
    global nojspath 
    
    nojspath = "templates/"+template_sub_path
    config = config_in
    config['extension_types'].update(EXTENSION_TYPES)    
    config['serializers'].update(SERIALIZERS)
    
    config['serializers']['default'] =['nojs', 'text/html; charset=UTF-8']
