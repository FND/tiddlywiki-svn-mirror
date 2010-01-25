# -*- coding: utf-8 -*-
__safe__ = ['view','tiddlyWebComments','message','tiddlers','tiddler','url','tags']
import re
from wikklytextrender import wikitext_to_wikklyhtml
import urllib
import logging
from wikklytext.base import Text
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store, NoBagError,NoTiddlerError
from twp.filterer import Filterer as FilterThingy
from tiddlyweb import control
logging.debug("cwd now loading plugins")

def tiddlyWebComments(context,*args):
  ctiddler = context.tiddler
  if ctiddler:
    comments = control.filter_tiddlers_from_bag(context.bag,"select=root:%s&sort=-created"%ctiddler.title)
    res = ""
    for comment in comments:
      res += "<div class='comment'><div class='heading'><div class='commentTitle'>comment</div></div><div class='commentText'>%s</div></div>"%comment.text
  return res
  
def tiddler(context, *args):
  logging.debug("in tiddler macro")
  environ = context.environ
  if context.bag:
    bag = context.bag
    try:
      tiddler_requested = args[0].text
    except Exception:
      tiddler_requested = ""
    for tiddler in bag.list_tiddlers():
      if tiddler.title == tiddler_requested:
        
        text = wikitext_to_wikklyhtml(environ["tw_url_base"], environ["tw_url_path"], tiddler.text, environ,tiddler=context.tiddler,suffix_url=environ["tw_url_suffix"],bag=context.bag)
        #text = text.replace("&lt;","<").replace("&gt;",">")
        return text
    return "no tiddler with name %s"%tiddler_requested
  else:
    return "no bag"
global TIDDLER_MACRO
TIDDLER_MACRO = tiddler
def tiddlers(context, *args):
  logging.debug("in tiddlers macro")
  environ = context.environ
  params = []
  template = args[0]

  newargs = []
  for i in args:
    newargs.append(i)
    params.append(i.text)
  named_args = get_named_args(params)
  tw_filter = named_args["filter"]
  if context.bag:
    logging.debug("in tiddlers with tw filter %s"%(tw_filter))
    f = FilterThingy() #finding an old version of Filterer but not sure where!
    filtered_tiddler_list = f.get_filter_tiddlers(context.bag,tw_filter)
    logging.debug("in tiddlers with result %s"%filtered_tiddler_list)
    result = u""
    listlen = 0
    for newtiddler in filtered_tiddler_list:
      listlen +=1
      newcontext = context.clone()
      newcontext.environ = environ
      newcontext.tiddler = newtiddler
      newcontext.bag= context.bag
      tiddler_result = TIDDLER_MACRO(newcontext,template)
      result += tiddler_result    
    if listlen > 0:
      return result
    else:
      if "ifEmpty" in named_args:
        template_arg = Text(named_args["ifEmpty"])
        return TIDDLER_MACRO(context,template_arg)
      elif "ifEmptyString" in named_args:
        return named_args["ifEmptyString"]
      else:
        return ""
  else:
    return "no bag"  

def get_named_args(params):
  named = {}
  # hello world x:'args' y:"this should work to" z: andme
  for p in params:
    try:
      i = p.index(":")
      name = p[:i]
      val = p[i+1:]
      named[name]=val
    except ValueError:
      pass
  logging.debug("namedresult is %s"%named)
  return named
    
def _do_transclusion(str,tiddler):
  if not tiddler:
    return str
  else:
    def matcher(match):
      field = match.group(0)[1:]
      try:
        val= getattr(tiddler,field)
      except AttributeError:
        try:
          val = tiddler.fields[field]
        except KeyError:
          val = ""
      return val
    return re.sub("(\$.*)$|(\$[^ ]*) ",matcher,str)
def _view_transform(context,value,vtype,params=[]):
  
  #value = value.encode("ascii","ignore")
  environ = context.environ

    
  named_args = get_named_args(params)
  logging.debug("got named args %s from %s"%(named_args,params))
  try:
    prefix = named_args["prefix"]
    prefix =_do_transclusion(prefix,context.tiddler)
  except KeyError:
    prefix = ""
  try:
    suffix =named_args["suffix"]
    suffix =_do_transclusion(suffix,context.tiddler)
  except KeyError:
    suffix = ""
  try:
    label = named_args["label"]
    label = _do_transclusion(label,context.tiddler)
  except KeyError:
    label = value
  #logging.debug("view_transform %s %s %s"%(value,vtype,params))
  if not vtype or vtype =='text':
    transformed = value.decode("utf-8")
    return transformed
  elif vtype == 'wikified':
    return value#wikitext_to_wikklyhtml(environ["tw_url_base"], environ["tw_url_path"], value, environ,tiddler=context.tiddler,suffix_url=link_suffix,bag=context.bag)
  elif vtype =='link':
    value = "[[%s]]"%value
    return wikitext_to_wikklyhtml(environ["tw_url_base"], environ["tw_url_path"], value, environ,tiddler=context.tiddler,suffix_url=environ["tw_url_suffix"],bag=context.bag)
  elif vtype=='date':
    YYYY = value[0:4]
    MM = value[4:6]
    DD = value[6:8]
    h = value[8:10]
    m = value[10:12]
    s = value[12:14]
    return "%s/%s/%s"%(DD,MM,YYYY)
    #return "%s/%s/%s %s:%s:%s"%(DD,MM,YYYY,h,m,s)
  elif vtype == 'linkexternal':
    return u'<a href="%s%s%s">%s</a>'%(prefix,value,suffix,label)
  else:
    logging.debug("unknown view type %s"%vtype)
    transformed = ""#"%s(%s)"%(vtype,value)
  
  #logging.debug("returning %s"%transformed)
  return transformed

def tags(context,*args):
  tiddler = context.tiddler
  tagresult = "<ul>"
  
  if len(tiddler.tags) == 0:
    tagresult += "<li>no tags</li>"
  else:
    tagresult +=u"<li class=\"listTitle\">tags: </li>"
    for tag in tiddler.tags:
      #taglink ="<a href='javascript:void()'>%s</a>"%tag
      taglink = "[[%s]]"%tag
      tagresult += "<li>%s</li>"%(taglink)
  
  tagresult += "</ul>"
  return tagresult
def message(context,*args):
  
  params = []
  for p in args:
    params.append(p.text)
    
  config_location = args[0].text
  try:
    viewtype = args[1].text
  except IndexError,KeyError:
    viewtype = ""
    
  logging.debug("in message macro %s show as %s"%(config_location,viewtype))
  logging.debug("msg macro %s"%config_location)
  if 'tiddlywebwiki_plus' in context.environ:
    twpctx = context.environ['tiddlywebwiki_plus']
    if "slices" in twpctx:
      slices = twpctx['slices']
      logging.debug("msg macro got slices")
      if "Config" in slices:
        val_location = slices["Config"]
        
        try:
          val = val_location[config_location]
        except KeyError:
          val = ""
        val = val.encode('utf-8')
        logging.debug("msg lastnamed args %s"%params)
        p = params[2:]
        logging.debug("lastnamed p has len %s"%len(p))
        return _view_transform(context,val,viewtype,p)
  return ""

def url(context,*args):
  
  try:
    url = context.environ['SCRIPT_URL']
  except KeyError:
    url = context.environ['REQUEST_URI']
  
  if len(args) > 0:
    if url[:1] == '/':
      url = url[1:]
    url_parts = url.split("/")
    where =args[0].text

    url=url_parts[int(where)]
  return urllib.unquote(url)
  
def view(context, *args):
  params = []
  for p in args:
    params.append(p.text)
  try:
    field = params[0]
  except IndexError:
    pass
  try:
    viewtype = params[1]
  except IndexError:
    viewtype = False
  try:
    tiddler = context.tiddler
  except AttributeError:
    tiddler = False
  val = ""
  if tiddler and field:  
    if field in tiddler.fields:
      val = tiddler.fields[field]
    else:
      val = getattr(tiddler,field,"")
  #logging.debug("view lastnamed args %s"%params)
  p = params[2:]

  
  res = _view_transform(context,val,viewtype,p)
  return res