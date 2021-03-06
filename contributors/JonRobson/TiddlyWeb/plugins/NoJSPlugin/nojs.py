global templates, viewtemplates
global template_sub_path
from jinja2 import Environment, FileSystemLoader,TemplateNotFound
template_sub_path = "nojs/"
templates= ["PageTemplate","MarkupPreHead","StyleSheet","SiteTitle","StyleSheetLayout","StyleSheetColors"]
viewtemplates = ["ViewTemplate","myblogViewTemplate","rssfeedsViewTemplate"]
template_env = Environment(loader=FileSystemLoader('templates/'))

from tiddlyweb.wikitext import render_wikitext
from wikklytextrender import wikitext_to_wikklyhtml

from tiddlyweb.manage import make_command
import logging
# Data entities
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlywebplugins import replace_handler
# Data storage system
from tiddlyweb.store import Store, NoBagError,NoTiddlerError,NoRecipeError

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

import os
import re
import shutil
@make_command()
def refreshnojstemplates(args):
  """clears all template files used by nojs forcing any changes to PageTemplate etc to be picked up"""
  try:
    shutil.rmtree('templates/nojs')
  except IOError:
    pass
    
    
def define_js_redirect(location):
  text = "<script type='text/javascript'>window.location= window.location+'?j=y';</script>"
  fileObj = open(nojspath+"%sjs.html"%location,"w") #open for write
  fileObj.write(text)
  fileObj.close()      

def define_index(location):
  pathname = template_sub_path+ location
  create_file_if_new("%sindex.html"%location)
  text = "<html><head>{%% include '%sMarkupPreHead.html' %%}"%pathname+\
  "<title>{%% if tiddlers|length == 1 %%}{{tiddlers[0].title}} - {%% endif%%}{%% include '%sSiteTitle.html' %%}</title>"%pathname+\
  "<style type='text/css'>.hide_nojavascript {display:none;}"+\
  "{%% include '%sStyleSheetColors.html'%%}"%pathname+\
  "{%% include '%sStyleSheetLayout.html'%%}{%% include '%sStyleSheet.html' %%}"%(pathname,pathname)+\
  "#saveTest {display:none;}\n#messageArea {display:none;}\n#copyright {display:none;}\n#storeArea {display:none;}\n#storeArea div {padding:0.5em; margin:1em 0em 0em 0em; border-color:#fff #666 #444 #ddd; border-style:solid; border-width:2px; overflow:auto;}\n#shadowArea {display:none;}\n#javascriptWarning {width:100%; text-align:center; font-weight:bold; background-color:#dd1100; color:#fff; padding:1em 0em;}</style>"+\
  "</head>"+\
  "<body><noscript><div class='nojsplugin_indexheader'><a href='{{environ['nojs_index']}}.nojswiki'>index</a></div><div id='contentWrapper' class='backstageVisible'>{%% include '%sPageTemplate.html' %%}</div></noscript>{%% include '%sjs.html' %%}</body></html>"%(pathname,pathname)
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
  
  
def create_tiddler(tiddler_name,location,environ):
  store = environ['tiddlyweb.store']
  try:
    tiddler = store.get(Tiddler(tiddler_name,get_bag(tiddler_name,environ)))
    text = wikitext_to_wikklyhtml(environ["nojs_base"], environ["nojs_path"], tiddler.text)
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
    recipe_name = environ['selector.vars']['recipe_name']
    try:
      recipe = store.get(Recipe("beefcaked_"+recipe_name))
    except NoRecipeError:
      recipe = store.get(Recipe(recipe_name))
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
  
  
def get_location(environ):
  try:
    location ="bags/"+environ['selector.vars']['bag_name']+"/"
  except KeyError:
    location = "recipes/"+environ['selector.vars']['recipe_name']+"/"
  return location
    
def setup_filters(environ):
  environ["nojs_base"] = environ["tiddlyweb.config"]['server_prefix']+"/"
  try:
     bag = environ['selector.vars']['bag_name']
     environ["nojs_path"] = "bags/%s/tiddlers"%(bag)
     environ["nojs_path_nobeefcake"] = environ["nojs_path"]
     environ["nojs_index"] = environ["nojs_base"]+environ["nojs_path"]
  except KeyError:
    recipe_name = environ['selector.vars']['recipe_name']
    environ["nojs_path"] = "recipes/%s/tiddlers"%(recipe_name)
    environ["nojs_path_nobeefcake"] = environ["nojs_path"]
    environ["nojs_index"] = environ["nojs_base"]+environ["nojs_path"]
    store = environ['tiddlyweb.store'] 
    try:
      recipe = store.get(Recipe("beefcaked_"+recipe_name))
      
      environ["nojs_path"] ="beefcaked/%s"%environ["nojs_path"]
    except NoRecipeError:
      pass
      
  def wikifier(text):
    if "<html>" in text and "</html>" in text:
      return text
    else:
      text =re.sub("\<\<([^\>]*)\>\>","= !macroerror! =",text)
      text= wikitext_to_wikklyhtml(environ["nojs_base"], environ["nojs_path"], text)
      text = re.sub("= !macroerror! =","<a class='errorButton'>Error in macro - javascript is required!</a>",text)
      return text
  def linkifier(str):
    try:
      linkto = environ["tiddlyweb.store"].get(Tiddler(str,get_bag(str,environ)))
    except NoTiddlerError:
      linkto = False
    if linkto:
      return "<a href='%s%s/%s'>%s</a>"%(environ["nojs_base"], environ["nojs_path"],str,str)
    else:
      return str
  template_env.filters['wikified'] =wikifier
  template_env.filters['tiddlerlink'] = linkifier
  
def setup_templates(environ):
  location = get_location(environ)
  try:
    generatedindex = open("%s%sindex.html"%(nojspath,location),"r")
  except IOError:
    define_default_templates(location)
    
  for template_name in merge(templates,viewtemplates):
    try:
      fileObj = open("%s%s%s.html"%(nojspath,location,template_name),"r") #open for write
    except IOError:
      create_template(template_name,location,environ)
  
def generate_without_js(environ,tiddler_name):
  setup_filters(environ)
  setup_templates(environ)

  location = get_location(environ)  
  
  template = template_env.get_template('%s%sindex.html'%(template_sub_path,location))    
  
  if tiddler_name:
    store = environ['tiddlyweb.store']
    try:
      bag_name = get_bag(tiddler_name,environ)
      tiddlertoview = store.get(Tiddler(tiddler_name,bag_name))
    except NoTiddlerError:
      tiddlertoview = Tiddler(tiddler_name)
      tiddlertoview.text = ""
    tiddlers = [tiddlertoview]
  else:
    tiddlers = []
  return generate_template(template,tiddlers,environ)


def generate_index(environ,bag):
  
  setup_filters(environ)
  setup_templates(environ)
  tiddlers = bag.list_tiddlers()
  store = environ['tiddlyweb.store']  
  try:
    sitetitle_tiddler = store.get(Tiddler("SiteTitle",get_bag("SiteTitle",environ)))
    sitetitle = "%s (index)"%sitetitle_tiddler.text
  except NoTiddlerError:
    sitetitle = "%s (index)"%get_location(environ)
  indextiddler = Tiddler(sitetitle)
  indextext = ""
  tiddlers.sort(lambda x, y: cmp(x.title, y.title))
  for tiddler in tiddlers:
    indextext += "[[%s]]\n"%(tiddler.title)

  indextiddler.text = indextext
  location = get_location(environ)
  template = template_env.get_template('%s%sindex.html'%(template_sub_path,location))    
  return generate_template(template,[indextiddler],environ)

EXTENSION_TYPES = {'nojswiki': 'text/html',
'html': 'text/html+x'}
SERIALIZERS = {
		'text/html+x':['html','text/html; charset=UTF-8'],
        'text/html': ['nojs', 'text/html; charset=UTF-8']
}
        
from tiddlyweb.serializations.html import Serialization as HTMLSerialization
from tiddlyweb.serializer import Serializer
class Serialization(HTMLSerialization):
    
    def __init__(self, environ={}):
        self.environ = environ
    
    def list_tiddlers(self, bag):
        try:
          qs = self.environ["tiddlyweb.query"]["j"][0]
          js = True
        except KeyError:
          js = False
        
        if not js:
          try:
            host = "http://"+self.environ['HTTP_HOST']

            refer = self.environ["HTTP_REFERER"]
            if refer == host or refer == "%s%s"%(host,self.environ['REQUEST_URI']):
              js = True
            else:
              js = False
          except KeyError:
            js = False
        if js:
          s = Serializer("tiddlywebwiki.serialization",self.environ)
          return s.list_tiddlers(bag)
        else:
          if bag.tiddlers[0] and bag.tiddlers[0].recipe:            
            try:
              beefcaked_recipe ="beefcaked_"+bag.tiddlers[0].recipe
              store = self.environ['tiddlyweb.store'] 
              recipe = store.get(Recipe(beefcaked_recipe))
              return generate_index(self.environ,self.get_tiddlers_bag_for_recipe(beefcaked_recipe))
            except NoRecipeError:
              return generate_index(self.environ,bag)
          else:
            return generate_index(self.environ,bag)

    def get_tiddlers_bag_for_recipe(self,recipe_name):
        store = self.environ['tiddlyweb.store'] 
        recipe = store.get(Recipe(recipe_name))
        list_tiddlers = control.get_tiddlers_from_recipe(recipe)
    
        tiddlers = []

        tempbag = Bag("tempbag",tmpbag=True)
    
        tempbag.add_tiddlers(list_tiddlers)
        return tempbag
    def tiddler_as(self, tiddler):
        store = self.environ['tiddlyweb.store'] 
        try:
          qs = self.environ["tiddlyweb.query"]["j"][0]
          js = True
        except KeyError:
          js = False
        
        if not js:  
          try:
            host = "http://"+self.environ['HTTP_HOST']
            refer = self.environ["HTTP_REFERER"]
            if refer == host or refer == "%s%s"%(host,self.environ['REQUEST_URI']):
              js = True
            else:
              js = False
          except KeyError:
            js = False
            
        if js:
            s = Serializer("tiddlywebwiki.serialization",self.environ)
            #s.object = tiddler
            if tiddler.recipe: 
                recipe_name = tiddler.recipe
                tempbag = self.get_tiddlers_bag_for_recipe(recipe_name)
                defaultTiddler = Tiddler("DefaultTiddlers")
                defaultTiddler.text = "[["+tiddler.title +"]]"
                tempbag.add_tiddlers([defaultTiddler])
                return s.list_tiddlers(tempbag)
            else:
                tempbag = Bag(tiddler.bag)   
                tempbag = store.get(tempbag)         
                return s.list_tiddlers(tempbag)
           
        else:
            return generate_without_js(self.environ,tiddler.title)
         
           
        

def getBeefcakedTiddler(environ,start_response):
    store = environ['tiddlyweb.store']  
     
    start_response('200 OK', [
        ('Content-Type', 'text/html; charset=utf-8')
        ])
    
    tiddler_name = environ['wsgiorg.routing_args'][1]['tiddler']
    tiddler =Tiddler(tiddler_name)
    try:
      initial_recipe_name = environ['wsgiorg.routing_args'][1]['recipe'] 
      recipe_name = "beefcaked_"+initial_recipe_name
      environ['selector.vars']['recipe_name'] = environ['wsgiorg.routing_args'][1]['recipe'] 
      recipe = store.get(Recipe(recipe_name))
      bag = control.determine_tiddler_bag_from_recipe(recipe, Tiddler(tiddler_name))
      bag_name = bag.name
      tiddler.recipe = initial_recipe_name
    except KeyError:
      bag_name = environ['wsgiorg.routing_args'][1]['bag']
      environ['selector.vars']['bag_name'] = bag_name
    tiddler.bag = bag_name
    
    s = Serialization(environ)
    return s.tiddler_as(store.get(tiddler))
    
def init(config):
    global nojspath
    nojspath = "templates/"+template_sub_path
    config['selector'].add('/beefcaked/test', GET=getBeefcakedTiddler)
    config['selector'].add('/beefcaked/recipes/{recipe:segment}/tiddlers/{tiddler:segment}', GET=getBeefcakedTiddler)
    config['selector'].add('/beefcaked/bags/{recipe:segment}/tiddlers/{tiddler:segment}', GET=getBeefcakedTiddler)
    config['extension_types'].update(EXTENSION_TYPES)    
    config['serializers'].update(SERIALIZERS)
    config['serializers']['default'] =['nojs', 'text/html;charset=UTF-8']