import logging
#Data entities
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler

#Data storage system
from tiddlyweb.store import Store, NoBagError,NoTiddlerError

def stat_average(environ):
  logging.debug("in statadd")
  success = False
  try:
    title= environ['tiddlyweb.query']['tiddler'][0]
  except KeyError:
    title = False
  
  try:
    value= environ['tiddlyweb.query']['value'][0]
  except KeyError:
    value = False  
  

  try:
    field= environ['tiddlyweb.query']['field'][0]
  except KeyError:
    field = False  
  
    
  avgconfig = environ["tiddlyweb.config"]["stats"]["average"]
  if title and value and field and field in avgconfig["fields"] and int(value) <= avgconfig["max"] and int(value) > avgconfig["min"]:
    store = environ['tiddlyweb.store']
    tid =Tiddler(title, "stats")
    count = 0
    lastvalue = 0
    try:
      tiddler = store.get(tid)
      count = int(tiddler.fields[field+"_count"])
      lastvalue =  int(tiddler.fields[field+"_lastvalue"])
      store.delete(tiddler)
    except NoTiddlerError:
      pass

    tid.fields[field+"_lastvalue"] = value
    tid.fields[field+"_count"] = count +1
    
    total = float(tid.fields[field+"_count"])
    try:
      oldavg = tid.fields[field+"_average"]
      newavg = ((float(oldavg) * count)  + int(value)) / (count + 1)
    except KeyError:
      newavg = value
    tid.fields[field+"_average"] = "%s"%(newavg)
    tid.revision = "1"
    store.put(tid)
    return True
  else:
    return False
        
def stat_increment(environ,start_response):
  try:
    title= environ['tiddlyweb.query']['tiddler'][0]
  except KeyError:
    title = False
    	
  try:
    field= environ['tiddlyweb.query']['field'][0]
  except KeyError:
    field = False
    
  if title and field and field in environ["tiddlyweb.config"]["stats"]["increment"]["fields"]:
    tid =Tiddler(title, "stats")	
       
    try:
      tiddler = store.get(tid)
      tid.fields[field] =  "%s"%int(tid.fields[field]) +1
      store.delete(tiddler)
    except NoTiddlerError:
      tid.fields[field] = "0"
      pass
    
    tid.revision = "1"
    store.put(tid)
  

def operate_on_stats(environ,start_response):
  start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
  action = environ['wsgiorg.routing_args'][1]['action']
  
  success = True
  logging.debug("allgoodsofar")
  if action == 'AVERAGE':
    success = stat_average(environ)
  elif action == 'INCREMENT':
  	success = stat_increment(environ)
  else:
    success = False
  if success:
    return "OK"
  else:
    return "FAIL"
  
def init(config_in):
    global config
    #adds a selector stats which takes an action value and tiddler to operate on
    config = config_in
    config["selector"].add("/stats/{action:segment}",GET=operate_on_stats)