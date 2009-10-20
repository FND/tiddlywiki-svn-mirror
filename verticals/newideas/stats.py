import logging
#Data entities
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.filters import FILTER_PARSERS,sort_by_attribute, sort
#Data storage system
from tiddlyweb.store import Store, NoBagError,NoTiddlerError

def get_tiddler_title_for_stats(environ):
  try:
    title = environ['tiddlyweb.config']['stats']['tiddler']
  except KeyError:
    try:
      title= environ['tiddlyweb.query']['tiddler'][0]
    except KeyError:
      title = False
  return title

def allowed_operation(policy,bag,title, field,value):
  try:
    maxval =  policy[bag]["max"]
  except KeyError:
    maxval = False
  
  try:
    minval = policy[bag]["min"]
  except KeyError:
    minval= False
    
  if maxval and int(value) > maxval:
    return False
  if minval and int(value) < minval:
    return False
  
  allowed = policy["allowed"]
  if bag in allowed or bag +"/"+title in allowed or bag +"/"+title+"/"+field in allowed or bag+"/*" in allowed or bag+"/*/"+field in allowed or "*/" in allowed or "*/"+title in allowed or "*/*/"+field in allowed:
    return True
  else:
    return False
  
def stat_mode(environ):
  logging.debug("in statadd")
  success = False
  title = get_tiddler_title_for_stats(environ)
  
  try:
    value= environ['tiddlyweb.query']['value'][0]
  except KeyError:
    value = False  
  try:
    bag = environ["tiddlyweb.query"]["bag"][0]
  except KeyError:
    bag = False
    
  try:
    field= environ['tiddlyweb.query']['field'][0].lower()
    field = field.encode('ascii','ignore')
  except KeyError:
    field = False  
    
  statsconfig =environ["tiddlyweb.config"]["stats"]
  avgconfig = statsconfig["average"]
  
  if title and bag and value and field:
    allowed = allowed_operation(avgconfig,bag,title,field,value)
  else:
    allowed = False
  
  
  if allowed:
    store = environ['tiddlyweb.store']
    tid =Tiddler(title, bag)
    try:
      tiddler = store.get(tid)
      try:
        data = tiddler.fields[field+"_mode_data"]
        occurances = data.split(";")
        calc = {}
        total_clicks = 0
        for o in occurances:
          logging.debug("errow %s",o)
          bits = o.split("=")
          if len(bits)==2:
            num = bits[0]
            val = bits[1]
            calc[num] = int(val)
            total_clicks += calc[num]
        try:
          calc[value] +=1
        except KeyError:
          calc[value] = 1
        
        newmode=  value
        newdata=""
        bestcount=0
        newavg = 0
        for total in calc:
          newavg += (int(total) * calc[total])
          newdata += "%s=%d;"%(total,calc[total])
          if calc[total] > bestcount:
            bestcount = calc[total]
            newmode = total
        
        newavg = float(newavg / total_clicks)
      except KeyError:
        newdata = "%s=1;"%(value)
        newmode = value
        newavg = value
        pass
    except NoTiddlerError:
      return False
    tiddler.fields[field+"_mode_data"] = "%s"%(newdata)
    tiddler.fields[field+"_mode"] = "%s"%(newmode)
    tiddler.fields[field+"_average"] = "%s"%(newavg)
    store.put(tiddler)
    return True
  else:
    return False
       
def stat_increment(environ):
  logging.debug("stats.py:stat_increment enter")
  title = get_tiddler_title_for_stats(environ)
  try:
    config = environ["tiddlyweb.config"]["stats"]["increment"]
  except KeyError:
    return False
  
  value = 1
  try:
    bag = environ["tiddlyweb.query"]["bag"][0]
  except KeyError:
    bag = False

  try:
    field= environ['tiddlyweb.query']['field'][0].lower()
    logging.debug("stats.py: fieldname %s"%type(field))
  except KeyError:
    field = False
  if allowed_operation(config,bag,title,field,value):
    store = environ['tiddlyweb.store']
    tid =Tiddler(title, bag)
    try:
      tiddler = store.get(tid)
      logging.debug("stats.py: got tiddler with title %s"%tiddler.title)
      logging.debug("stats.py: got tiddler with text %s"%tiddler.text)
      try:
        count = int(tiddler.fields[field])
      except KeyError:
        count = 0
    except NoTiddlerError:
      return False
      count = 0
    tiddler.fields[field] = str(count + 1)
    logging.debug("stats.py: putting tiddler %s"%tid.title)
    store.put(tiddler)
    return True
  else:
    return False

def operate_on_stats(environ,start_response):
  start_response('303 See Other', [('Content-Type', 'text/html; charset=utf-8')])
  action = environ['wsgiorg.routing_args'][1]['action']
  
  success = True
  if action == 'INCREMENT':
  	success = stat_increment(environ)
  elif action == 'DO':
  	success = stat_mode(environ)
  else:
    success = False
  if success:
    return "OK"
  else:
    return "FAIL"

oldsort = FILTER_PARSERS["sort"]  
def sort_parse(attribute):
    """
    Create a function which will sort a collection of
    tiddlers.
    """
    if attribute.startswith('-'):
        attribute = attribute.replace('-', '', 1)

        def sorter(tiddlers):
            good = []
            bad = []
            for t in tiddlers:
              
              try:
                att = getattr(t,attribute)
              except AttributeError:
                att = False
                
              logging.debug("tiddlersorter %s att:%s "%(t,att))
              if att or attribute in t.fields:
                good.append(t)
              else:
                bad.append(t)
            result = sort_by_attribute(attribute, good, reverse=True)
            
            result.extend(bad)
            logging.debug("jr says reversa %s"%result)
            return result

    else:

        def sorter(tiddlers):
            good = []
            bad = []
            for t in tiddlers:
              try:
                att = getattr(t,attribute)
              except AttributeError:
                att = False
                
              if att or attribute in t.fields:
                good.append(t)
              else:
                bad.append(t)
            result= sort_by_attribute(attribute,good)
            result.extend(bad)
            logging.debug("jr says no reversa %s"%result)
            return result

    return sorter

from tiddlyweb.model import policy
def do_reset(environ,start_response):
  start_response('303 See Other', [('Content-Type', 'text/html; charset=utf-8')])
  title = get_tiddler_title_for_stats(environ)
  try:
    bagname = environ["tiddlyweb.query"]["bag"][0]
  except KeyError:
    bagname = False
    
  try:
    field= environ['tiddlyweb.query']['field'][0].lower()
  except KeyError:
    field = False
    
  if bagname and field and title:
    store = environ['tiddlyweb.store']
    b =Bag(bagname)
    try:
      bag = store.get(b)
    except KeyError:
      bag = False
    if bag and bag.policy.allows(environ["tiddlyweb.usersign"],"write"):
      tid = Tiddler(title,bagname)
      try:
        tiddler = store.get(tid)
        tid.fields[field] = "0"
        store.put(tid)
        return "OK"
      except NoTiddlerError:
        return "FAIL"    
  else:
    return "FAIL"    
FILTER_PARSERS["sort"] = sort_parse

def string_to_float(x):
    return float(x)

sort.ATTRIBUTE_SORT_KEY["rating_average"] = string_to_float
sort.ATTRIBUTE_SORT_KEY["reports"] = string_to_float        
        
        
def init(config_in):
    global config
    #adds a selector stats which takes an action value and tiddler to operate on
    config = config_in
    config["selector"].add("/stats/reset",POST=do_reset)
    config["selector"].add("/stats/{action:segment}",POST=operate_on_stats)