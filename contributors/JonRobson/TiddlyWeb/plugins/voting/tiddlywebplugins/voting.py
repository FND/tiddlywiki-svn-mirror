import logging
from tiddlyweb.model import policy
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.filters import FILTER_PARSERS,sort_by_attribute, sort
from tiddlyweb.store import Store, NoBagError,NoTiddlerError
from tiddlywebplugins.utils import get_store


def read_slices(title,bag):
  slices = {}
  try:
    tiddler = store.get(Tiddler(title,bag))
    text = tiddler.text.split("\n")
    for line in text:
      try:
        name,val = line.split("::")
        slices[name] = val
      except ValueError:
        pass
  except NoTiddlerError:
    pass
  return slices
def stat_increment(parameters):
    
    value = parameters["value"]
    bag = parameters["bag"]
    title =parameters["title"]
    tiddler =Tiddler(title, bag)
    votingLog = read_slices(u"data::%s in %s"%(title,bag),"tiddlyvoting")
   
    try:
      grandtotal = int(votingLog["total"])
    except KeyError:
      grandtotal = 0
    try:
      frequency = int(votingLog["frequency"])
    except KeyError:
      frequency = 0
    try:
      tiddler = store.get(tiddler)
      logging.debug("tiddlywebplugins.voting got tiddler with title %s"%tiddler.title)
    except NoTiddlerError:
      logging.debug("tiddlywebplugins.voting tiddler %s doesn't exist!"%title)
      return (False,6)
    newgrandtotal = grandtotal + value
    newfrequency= (frequency + 1)
    newmode = value
    try:
      modescore = int(votingLog[u"%s"%value]) +1
    except KeyError:
      modescore = 1

    for candidate in votingLog:
      if candidate not in ["total","frequency"]:
        if int(votingLog[candidate]) > modescore:
          newmode = candidate
      
    tiddler.fields["tiddlyvoting.increment"] = "%s"%newgrandtotal
    tiddler.fields["tiddlyvoting.average"] = "%.2f"%(float(newgrandtotal)/float(newfrequency))
    tiddler.fields["tiddlyvoting.mode"] = "%s"%newmode
    
    logging.debug("tiddlywebplugins.voting putting tiddler %s"%tiddler.title)
    store.put(tiddler)
    return (True,"ok")
    
def allowed_operation(params):
    allowed = False
    reason = 0
    #check the user has read access
    try:
      bag = store.get(Bag(params["bag"]))
      try:
        bag.policy.allows(params["user"],"read")
        allowed = True
      except (policy.UserRequiredError,policy.ForbiddenError):
        allowed = False
        reason = 1
    except NoBagError:
      reason = 2
      allowed = False

    #check the limit of votes for that user hasnt been exceeded
    if 'increment.limit' in params['config']:
      limit = int(params['config']['increment.limit'])
      if limit <= 0:
        allowed = False
        reason = 3
      try:
        tid = store.get(Tiddler("%s increment %s in %s"%(params['username'],params['title'],params['bag']),"tiddlyvoting"))
        if tid.revision >= limit:
          allowed = False
          reason = 4
      except NoTiddlerError:
        pass
    
    #check it meets the range
    value = int(params['value'])
    if 'increment.range' in params['config']:
      lower = params['config']['increment.range'][0]
      higher = params['config']['increment.range'][1]
      if value < lower or value > higher:
        allowed = False
        reason = 7
    #what is the decision?
    return (allowed,reason)
           
def get_parameters(environ):
  result = {}
  try:
    bag = environ['tiddlyweb.query']['bag'][0]
  except KeyError:
    bag = False
  try:
    title= environ['tiddlyweb.query']['tiddler'][0]
  except KeyError:
    title = False
  try:
    value = environ['tiddlyweb.query']['value'][0]
  except KeyError:
    value = "1"
    
  username= environ['tiddlyweb.usersign']["name"]
  result["value"] = int("%.0f"%float(value))
  
  result["username"] = username
  result["title"]=title
  result["bag"] = bag
  result["user"]=environ["tiddlyweb.usersign"]
  result["vote_id"]= "%s increment %s in %s"%(username,title,bag)
  
  #load the config
  tvconfig = {}
  try:
    tvconfigname = "config::%s"%bag
    tiddler = store.get(Tiddler(tvconfigname,"tiddlyvoting"))
    splices = tiddler.text.split("\n")
    
    for splice in splices:
      try:
        name,val = splice.split("::")
        name = name.strip()
        val =val.strip()
        if name == 'increment.range':
          lower,higher = val.split(",")
          val = [int(lower),int(higher)]
        tvconfig[name]=val
      except ValueError:
        pass
  except NoTiddlerError:
    pass
  result['config'] = tvconfig
  return result

  
def perform_action(environ):
  success = True
  reason = -1
  try:
    params = get_parameters(environ)
  except ValueError:
    return (False,5)
  allowed,reason = allowed_operation(params)
  if allowed:
    success,reason = stat_increment(params)
  else:
    success = False
  if success:
    save_vote(params)
  return (success,reason)
  
def save_vote(params):
  tiddler = Tiddler(params["vote_id"],"tiddlyvoting")
  value = u"%s"%params["value"]
  tiddler.modifier = params["username"]
  tiddler.fields["topic"] = params["title"]
  tiddler.fields["value"] = value
  store.put(tiddler)
  
  #save the data
  voteTitle = "data::%s in %s"%(params["title"],params["bag"])
  slices = read_slices(voteTitle,"tiddlyvoting")
  
  try:
    slices[value] = u"%s"%(int(slices[value]) +1)
  except KeyError:
    slices[value] = u"1"
    
  try:
    slices[u"total"] = u"%s"%(int(slices[u"total"]) +  int(value))
  except KeyError:
    slices[u"total"] = u"%s"%value
  try:
    slices[u"frequency"] = u"%s"%(int(slices[u"frequency"]) +1)
  except KeyError:
    slices[u"frequency"] = u"1"


  voteText =u""
  for value in slices:
    voteText += """%s::%s
"""%(value,slices[value])
  
  voteLog = Tiddler(voteTitle,"tiddlyvoting")
  voteLog.text = voteText
  store.put(voteLog)
  
'''
reasons for failure:
"-1": "unknown error"
"1": "user not allowed to read that bag",
"2": "bag doesn't exist",
"3": "voting not allowed in bag",
"4": "user has exceeded their amount of votes",
"5": "invalid argument passed",
"6": "tiddler voting on doesn't exist"
"7": "vote is too big or too small"
'''
def operate_on_stats(environ,start_response):
  (success,reason) = perform_action(environ)
  logging.debug("operate_on_stats: operation done")
  #deal with success by preventing future success
  if success:
    start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
    return "OK"
  else:
    start_response('403 Forbidden', [('Content-Type', 'text/html; charset=utf-8')])
    return ["%s"%reason]


def string_to_float(x):
    return float(x)
def string_to_int(x):
    return int(x)

sort.ATTRIBUTE_SORT_KEY["tiddlyvoting.increment"] = string_to_float          
sort.ATTRIBUTE_SORT_KEY["tiddlyvoting.mode"] = string_to_float   
sort.ATTRIBUTE_SORT_KEY["tiddlyvoting.average"] = string_to_float   

def setup_store(config):
    global store
    store = get_store(config)
    bag = Bag("tiddlyvoting")
    try:
      store.get(bag)
    except NoBagError:
      store.put(bag)
      
def init(config_in):
    global config
    #adds a selector stats which takes an action value and tiddler to operate on
    config = config_in
    setup_store(config)
    config["selector"].add("/tiddlyvoting",POST=operate_on_stats)
    config["selector"].add("/tiddlyvoting/{action:segment}",POST=operate_on_stats)