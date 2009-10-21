from ideas_staticpages import template_env
from datetime import date,timedelta
import urllib
import logging
import re
import httplib2
from tiddlyweb.filters.sort import sort_by_attribute
def dateformat(str, format='%d/%m/%Y'):
    try:
      d = date(int(str[0:4]),int(str[4:6]), int(str[6:8]))
      return d.strftime(format)
    except ValueError:
      return ""
      
def load_from_url(url,method="GET",qs=False):
  h = httplib2.Http()
  #url = urllib.quote(url)
  url = urllib.quote(url.encode("utf-8"))
  if url[0:4] != "http":
    sh = config['server_host']
    url =sh["scheme"] +"://" + sh["host"] +":"+sh["port"]+ url

  if qs:
    url += "?"+qs
  logging.debug("load_from_url: %s"%url)
  try:
    resp,content = h.request(url,method=method)
  except Exception, e:
    logging.error("load_from_url: cannot request url: %s (%s)"%(url,e))
    return ""
  if resp.status == 200:
    decoded_content = content.decode('utf-8')
    logging.debug("returning %s",decoded_content)
    return decoded_content
  else:
    return ""


    
def template_exists(path):
  try:
    open("./templates/"+path,"r")
    return True
  except IOError:
    return False
def asratingid(str):
  str = re.sub("[() ',]","-",str.lower())
  str = str.encode('ascii','ignore')
  return str
def quote(str):
  return urllib.quote_plus(str.encode("utf-8"))
def unquote(str):
  return urllib.unquote(str)


def sort_those_tiddlers(listoftiddlers,attribute):
  from stats import sort_parse
  return sort_parse(attribute)(listoftiddlers)
template_env.filters['template_exists'] = template_exists
template_env.filters['dateformat'] = dateformat
template_env.filters['asratingid'] = asratingid
template_env.filters['unquote'] = unquote
template_env.filters['quote'] = quote
template_env.filters['tiddlersort'] = sort_those_tiddlers
template_env.filters['load_from_url'] =load_from_url
def init(config_in):
  global config
  config = config_in
  pass