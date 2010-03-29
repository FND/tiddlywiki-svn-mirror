"""
Quick twanager hack to lowercase all tags in 
a bag.

twanager_plugins: ['lowertags']
"""

from tiddlyweb.model.bag import Bag
from tiddlyweb.manage import make_command
from tiddlyweb.store import Store
from tiddlywebplugins.utils import get_store


        
@make_command()
def removefield(args):
  """A utility that will remove a field from all tiddlers in a bag.. Usage: removefield <bag> <fieldname>"""
  bag_name = args[0]
  field_name = args[1]
  store = get_store(config)

  bag = store.get(Bag(bag_name))
  for tiddler in bag.list_tiddlers():
    tid = store.get(tiddler)
    if field_name in tid.fields:
      del tid.fields[field_name]
      print "deleted %s"%tid.title
      store.put(tid)
      
@make_command()
def maptags(args):
  """Replace certain tags with another tag in a given bag. Example usage: maptags <bag> "rugby=sport;soccer=sport;" will replace any tiddler tagged with rugby or soccer with the tag sport"""
  bag_name = args[0]
  mappings = {}
 
  mappingstring = args[1].split(";")
  print "have %s"%mappingstring
  for pair in mappingstring:
    try:
      namevalue = pair.split("=")
      try:
        mappings[namevalue[0]] = namevalue[1] 
      except KeyError:
        pass
    except IndexError:
      pass
  store = get_store(config)
  
  bag = store.get(Bag(bag_name))
  for tiddler in bag.list_tiddlers():
      tiddler = store.get(tiddler)
      
      newtags = []
      for tag in tiddler.tags:
        try:
          newtag = mappings[tag]
        except KeyError:
          newtag = tag
      
        newtags.append(newtag)
      if tiddler.tags != newtags:
        print "replaced %s with %s"%(tiddler.tags,newtags)
        tiddler.tags = newtags
      
      #store.delete(tiddler)
      #tiddler.revision = None
      store.put(tiddler) 

@make_command()
def setfield(args):
  """provide a bag and all tiddlers in that bag will be marked with the given field and value bag: <bag> <field> <value>"""
  bag_name = args[0]
  field_name = args[1]
  value = args[2]
  store = get_store(config)

  bag = store.get(Bag(bag_name))
  for tiddler in bag.list_tiddlers():
      tiddler = store.get(tiddler)
      tiddler.fields[field_name] = value
      store.put(tiddler)


@make_command()
def nospacetags(args):
    """Lower case all the tags in all the tiddlers in the named bag: <bag>"""
    bag_name = args[0]

    store = get_store(config)

    bag = store.get(Bag(bag_name))
    for tiddler in bag.list_tiddlers():
        tiddler = store.get(tiddler)
        tiddler.tags = [tag.replace(" ","") for tag in tiddler.tags]
        store.put(tiddler)      
        
@make_command()
def lowertags(args):
    """Lower case all the tags in all the tiddlers in the named bag: <bag>"""
    bag_name = args[0]

    store = get_store(config)

    bag = store.get(Bag(bag_name))
    for tiddler in bag.list_tiddlers():
        tiddler = store.get(tiddler)
        tiddler.tags = [tag.lower() for tag in tiddler.tags]
        store.put(tiddler)

@make_command()
def uppertags(args):
    """Lower case all the tags in all the tiddlers in the named bag: <bag>"""
    bag_name = args[0]

    store = get_store(config)

    bag = store.get(Bag(bag_name))
    for tiddler in bag.list_tiddlers():
        tiddler = store.get(tiddler)
        tiddler.tags = [tag.upper() for tag in tiddler.tags]
        store.put(tiddler)

def init(config_in):
    global config
    config = config_in
