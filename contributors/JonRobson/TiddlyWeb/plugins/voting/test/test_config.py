votebag = "tiddlyvoting"
from tiddlyweb.config import config
from tiddlywebplugins import voting
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.user import User
from tiddlyweb.model.policy import Policy
from tiddlyweb.store import Store,NoTiddlerError, NoBagError, NoRecipeError
def setup(store):
  try:
    store.delete(Bag(votebag))
  except NoBagError:
    pass
  snowwhitebag = Bag("snow white")
  snowwhitebag.policy = Policy("jon",[],['admin'],['admin'],['admin'])
  mrmenbag = Bag("mr_and_mrs")
  mrmenbag.policy = Policy("jon",["jon","andrew","martin"],['admin'],['admin'],['admin'])
  films = Bag("films")
  try:
    store.delete(mrmenbag)
  except NoBagError:
    pass
  try:
    store.delete(snowwhitebag)
  except NoBagError:
    pass
  try:
    store.delete(films)
  except NoBagError:
    pass
  voting.setup_store(config)
  users = ["jon","FND","andrew","martin"]
  for user in users:
    store.put(User(user))
  mrmendata = [
    {"title":u"mr clumbsy","tags":["kitty","pet","cat"],"fields":{}},
    {"title":u"mr thin","tags":["dog","pet"],"fields":{}},
    {"title":u"mr tickle","tags":["cat","animal","bogof"],"fields":{"%s.increment"%votebag:"2"}},
    {"title":u"mr messy","tags":["lion"],"fields":{}},
    {"title":u"mr strong","tags":["monkey","lolcat"],"fields":{"%s.increment"%votebag:"923"}},
    {"title":u"mr tall","tags":["dinosaur","kitty","tiger"],"fields":{}},
    {"title":u"little miss naughty","tags":["cAt","pet"],"fields":{}},
    {"title":u"mr small","tags":["pet","animal","kitty"],"fields":{}}
  ]
  snowwhitedata = [
    {"title":u"snow white","tags":[],"fields":{}},
    {"title":u"grumpy","tags":[],"fields":{}}  
  ]
  filmdata = [{"title":"Kill Bill"},{"title":"Kill Bill 2"},{"title":"Pulp Fiction"},{"title":"Jackie Brown"}]
  configSnowWhite = Tiddler("config::snow white",votebag)
  configSnowWhite.text = """
increment.range::-5,30
increment.limit::2
"""
  store.put(configSnowWhite)
  store.put(snowwhitebag)
  store.put(mrmenbag)
  store.put(films)
  tiddlers = []
  for tid in mrmendata:
    tiddler = Tiddler(tid["title"],"mr_and_mrs")
    tiddler.fields = tid["fields"]
    tiddler.tags = tid["tags"]
    tiddlers.append(tiddler)
    store.put(tiddler)
  for tid in filmdata:
    tiddler = Tiddler(tid["title"],"films")
    tiddlers.append(tiddler)
    store.put(tiddler)
  for tid in snowwhitedata:
    tiddler = Tiddler(tid["title"],"snow white")
    tiddler.fields = tid["fields"]
    tiddler.tags = tid["tags"]
    tiddlers.append(tiddler)
    store.put(tiddler)    
  return tiddlers
