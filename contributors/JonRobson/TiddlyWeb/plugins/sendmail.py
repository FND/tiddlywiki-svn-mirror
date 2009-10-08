SENDMAIL = "/usr/sbin/sendmail" # sendmail location
import os
from tiddlyweb.model.bag import Bag
from tiddlyweb.manage import make_command
from tiddlyweb.store import Store
import logging
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store, NoBagError,NoTiddlerError

def get_store(config):
    """
    Given the config, return a reference to the store.
    """
    return Store(config['server_store'][0], {'tiddlyweb.config': config})


@make_command()
def sendmail(args):
  """send a tiddler to an address <email-address> <bag> <tiddler>"""
  email= args[0]
  bag = args[1]
  title = args[2]
  p = os.popen("%s -t" % SENDMAIL, "w")
  p.write("To: "+args[0]+"\n")
  p.write("Subject: %s/tiddlers/%s\n"%(bag,title))
  p.write("\n")
  store = get_store(config)
  tiddler = Tiddler(title,bag)
  tiddler = store.get(tiddler)
  fieldString = ""
  tagString = ""
  for tag in tiddler.tags:
    tagString += tag + " "
    
  for field in tiddler.fields:
    fieldString += "%s: %s\n"%(field,tiddler.fields[field])
  p.write("tags: %s\n"%tagString) # blank line separating headers from body
  p.write("%s"%fieldString) # blank line separating headers from body
  p.write("%s\n\n"%tiddler.text)
  sts = p.close()

  print "Mail sent!"


def init(config_in):
    global config
    config = config_in