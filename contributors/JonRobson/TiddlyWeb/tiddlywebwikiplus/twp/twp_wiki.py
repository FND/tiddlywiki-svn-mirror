from tiddlywebwiki.serialization import Serialization as Wiki
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from wikklytextrender import wikitext_to_wikklyhtml
import logging
from tiddlyweb import control
from templatifier import Templatifier
import re

class Serialization(Wiki):
  def __init__(self, environ={}):
      self.environ = environ
      self.tiddlers = {}
      from tiddlywebwiki.serialization import MARKUPS
      self._dependencies =[]
      for i in MARKUPS:
        self._dependencies.append(i)
      self.store = environ['tiddlyweb.store']
      self.environ['tiddlywebwiki_plus']= {"slices":{}}
  def _build_slices(self):
    stored_slices= {"Config":{}}
    for title in ['ColorPalette','Config']:
      if title in self.tiddlers:
        slices = self.tiddlers[title].text.split("\n")
        stored_slices[title] = {}
        for s in slices:
          data = s.split(":")
          if len(data) == 2:
            stored_slices[title][data[0]] = data[1].replace("\\n","<br/>") 
    stored_slices['Config']["options.txtUserName"] = self.environ["tiddlyweb.usersign"]["name"]
    self.environ['tiddlywebwiki_plus']["slices"]= stored_slices
  def make_nonjs_head(self):
    #store = self.environ['tiddlyweb.store']
    style = u"<style type='text/css'>#javascriptWarning,.template-error, .wikkly-error-container,.error-container{display:none;}"
    for title in ['StyleSheetColors','StyleSheetLayout','StyleSheetLocale','StyleSheetPrint','StyleSheet']:
      try:
        tiddler = self.tiddlers[title]
        text = tiddler.text
        style += "%s"%(text)
      except KeyError:
        pass
      
    style += "</style>"
    return u"%s"%(style)

  def make_page_template(self,default):
    pt =self.tiddlers["PageTemplate"]
    engine= Templatifier(self.environ,self.bag,tiddlers=self.tiddlers,default=default)
    return engine.run(u"<template>"+pt.text+"</template>",pt)
    
  def make_splash_screen(self,default):
    pagetemplate = self.make_page_template(default)
    js = u"<script type='text/javascript'>var da =document.getElementById('s_contentWrapper'); da.parentNode.removeChild(da);</script>"
    return u"<div id='s_contentWrapper'>%s</div>%s"%(pagetemplate,js)
    
  def build_non_js_version(self,bag,default=False):
    self.bag = bag
    nojshead = self.make_nonjs_head()
    splashscreen = self.make_splash_screen(default=default)
    twstring= self.make_basic_tw(bag)
    twstring = twstring.replace("<!--PRE-HEAD-START-->",nojshead)
    twstring = twstring.replace("<!--POST-BODY-START-->",splashscreen)
    twstring =twstring.replace('class="wikkly-','class="')
    return twstring
    
  def _match_slices(self):
    stored_slices=self.environ['tiddlywebwiki_plus']["slices"]
    def match(m):
      slice_title = m.group(1)
      delimiter = m.group(2)
      slice_id = m.group(3)
      #logging.debug("match slice %s with delimiter %s and id %s"%(slice_title,delimiter,slice_id))
      try:
        tslice = stored_slices[slice_title]
        #logging.debug("matched %s"%tslice)
        mappings = tslice
        value = mappings[slice_id]
        
      except KeyError:
        value = m.group(0)
      return value
    for title in self.tiddlers:
      text = self.tiddlers[title].text
      self.tiddlers[title].text = re.sub("\[\[([^:]*)(::)([^\]]*)\]\]",match,text)
  def tiddler_as(self, tiddler):
      logging.debug("###################################\nDOING TIDDLER_AS\n\n\n###################################")
      """
      Take the single tiddler provided and inject it into
      a TiddlyWiki.
      """
      environ = self.environ
      store = self.environ["tiddlyweb.store"]
      try:
        resource = Bag(tiddler.bag)
        bag = store.get(resource)
      except AttributeError:
        resource = Recipe(tiddler.recipe)
        resource= store.get(resource)
        tiddlers = control.get_tiddlers_from_recipe(resource)
        bag =Bag("tmp",tmpbag=True)
        logging.debug("have tiddlers %s"%tiddlers)
        for a_tiddler in tiddlers:
          bag.add_tiddler(store.get(a_tiddler))
        
      self._prepare_twp(bag)
      return self.build_non_js_version(bag,default=[tiddler])
  def _prepare_twp(self,bag):
      for tiddler in bag.list_tiddlers():
        self.tiddlers[tiddler.title] = self.store.get(tiddler)
      
      shadows = self.store.get(Bag("tiddlywebwikiplus"))
      for shadow in shadows.list_tiddlers():
        if shadow.title not in self.tiddlers:
          dependency = self.store.get(shadow)
          self.tiddlers[shadow.title] = dependency
          bag.add_tiddler(dependency)
        self._dependencies.append(shadow.title)
      self._build_slices()
      self._match_slices()  
  def make_basic_tw(self,bag):
      return self._put_tiddlers_in_tiddlywiki(bag.list_tiddlers())
  def list_tiddlers(self, bag):
      """
      Take the tiddlers from the given bag and inject
      them into a TiddlyWiki.
      """
      self._prepare_twp(bag)
      return self.build_non_js_version(bag)
