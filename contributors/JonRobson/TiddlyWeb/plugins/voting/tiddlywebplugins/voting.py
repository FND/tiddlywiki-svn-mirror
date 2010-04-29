import logging
from tiddlyweb.model import policy
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.filters import FILTER_PARSERS,sort_by_attribute, sort
from tiddlyweb.store import Store, NoBagError,NoTiddlerError
from tiddlywebplugins.utils import get_store
from tiddlyweb.web.validator import TIDDLER_VALIDATORS  

def tiddlyvoting_validator(tiddler,environ):
  slices = read_slices(get_vote_data_title(tiddler.title,tiddler.bag),"tiddlyvoting")
  for reserved in ['tiddlyvoting.total','tiddlyvoting.average','tiddlyvoting.mode']:
    if reserved in tiddler.fields:
      this = tiddler.fields[reserved]
    else:
      this = None
    
    try:
      expected = slices[reserved]
    except KeyError:
      expected = None
    
    if expected != this:  
      tiddler.fields[reserved] = expected


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
    try:
      tiddler = store.get(tiddler)
      logging.debug("tiddlywebplugins.voting got tiddler with title %s"%tiddler.title)
    except NoTiddlerError:
      logging.debug("tiddlywebplugins.voting tiddler %s doesn't exist!"%title)
      return (False,6)

    #params['tiddlyvoting.increment'] = tiddler.fields["tiddlyvoting.increment"]
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

def get_tv_config(environ,bag):
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
  return tvconfig          
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
  tvconfig = get_tv_config(environ,bag)
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

def get_vote_data_title(tiddler,bag):
  return "data::%s in %s"%(tiddler,bag)
def save_vote(params):
  tiddler = Tiddler(params["vote_id"],"tiddlyvoting")
  value = u"%s"%params["value"]
  title = params["title"]
  bag = params["bag"]
  tiddler.modifier = params["username"]
  tiddler.fields["topic"] = title
  tiddler.fields["value"] = value
  tiddler.fields["topic.bag"]=bag
  tiddler.tags = [u"tiddlyvotingrecord"]
  store.put(tiddler)
  
  #save the data
  voteTitle = get_vote_data_title(params["title"],params["bag"])
  votingLog= read_slices(voteTitle,"tiddlyvoting")
  
  try:
    votingLog[value] = u"%s"%(int(votingLog[value]) +1)
  except KeyError:
    votingLog[value] = u"1"
  
  value =  int(value)
  try:
    new_grand_total = int(votingLog[u"tiddlyvoting.total"]) + value
    votingLog[u"tiddlyvoting.total"] = u"%s"%(new_grand_total)
  except KeyError:
    new_grand_total = value
    votingLog[u"tiddlyvoting.total"] = u"%s"%value
  try:
    new_frequency = int(votingLog[u"tiddlyvoting.frequency"]) +1
    votingLog[u"tiddlyvoting.frequency"] = u"%s"%(new_frequency)
  except KeyError:
    new_frequency = 1
    votingLog[u"tiddlyvoting.frequency"] = u"1"

  new_mode = value
  try:
    modescore = int(votingLog[u"%s"%value]) +1
  except KeyError:
    modescore = 1
  for candidate in votingLog:
    if candidate not in ["tiddlyvoting.frequency",'tiddlyvoting.total','tiddlyvoting.mode','tiddlyvoting.average']:
      if int(votingLog[candidate]) > modescore:
        new_mode = candidate
  
  new_average = "%.2f"%(float(new_grand_total)/float(new_frequency))
  new_grand_total = "%s"%new_grand_total
  new_mode = "%s"%new_mode
  votingLog['tiddlyvoting.mode'] = new_mode
  votingLog['tiddlyvoting.average'] = new_average
  votingLog['tiddlyvoting.total'] = new_grand_total
  voteText =u""
  for saved_value in votingLog:
    voteText += """%s::%s
"""%(saved_value,votingLog[saved_value])
  
  voteLog = Tiddler(voteTitle,"tiddlyvoting")
  voteLog.text = voteText
  voteLog.tags = [u"tiddlyvotingdata"]
  store.put(voteLog)
  
  #save on the tiddler too
  tiddler = store.get(Tiddler(title,bag))  
  tiddler.fields["tiddlyvoting.total"] = new_grand_total
  tiddler.fields["tiddlyvoting.average"] = new_average
  tiddler.fields["tiddlyvoting.mode"] = new_mode
  logging.debug("tiddlywebplugins.voting putting tiddler %s"%tiddler.title)
  store.put(tiddler)
  
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
    if not x:
      return 0
    return float(x)
def string_to_int(x):
    if not x:
      return 0
    return int(x)

sort.ATTRIBUTE_SORT_KEY["tiddlyvoting.total"] = string_to_float          
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

def setup_validator():
  TIDDLER_VALIDATORS.extend([tiddlyvoting_validator])     
def init(config_in):
    global config
    #adds a selector stats which takes an action value and tiddler to operate on
    config = config_in
    setup_store(config)
    setup_validator()
    config["selector"].add("/tiddlyvoting",POST=operate_on_stats)
    config["selector"].add("/tiddlyvoting/{action:segment}",POST=operate_on_stats)