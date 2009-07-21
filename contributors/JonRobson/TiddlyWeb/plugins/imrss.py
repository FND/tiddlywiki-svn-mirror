"""
Twanager import rss to tiddlyweb plugin
Requires easy_install of feedparser
twanager_plugins: ['imrss']
"""
import feedparser
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
def imrss(args):
    rules = [u"<html>From rss feed %s<p><b><a href='%s'>%s</a><br>%s</p></html>"]
    """Import an rss feed into a bag using a given rule number <url> <bag> <int=1>"""
    rss_url = args[0]
    bagname = args[1]
    
    rule = rules[0]
    print "importing %s to %s"%(rss_url,bagname) 
    d = feedparser.parse(rss_url)
    store = get_store(config)
    bag = store.get(Bag(bagname))
    print "got %s items from that feed"%len(d.entries)
    puts = 0
    for tiddler in d.entries:
      id = tiddler.id.replace("/","_")
     
      imtiddler = Tiddler(id,bagname)
      imtiddler.heading = tiddler.title
      tags = []
      try:
        for tag in tiddler.tags:
          tags.append(tag.term)
      except AttributeError:
        pass
      
      tags.append(bagname)
      imtiddler.tags = tags
      summary = None
      try: 
        summary = tiddler.summary
      except AttributeError:
        pass
      
      if not summary:
        try:
          summary = tiddler.content[0]["value"]
        except AttributeError:
          summary = u"No description."
      
      #print "%s"%imtiddler.heading
      imtiddler.text = rule%(tiddler.link,tiddler.link,imtiddler.heading,summary)
      try:
      	imtiddler.modifier = tiddler.author
      except AttributeError:
      	imtiddler.modifier = "Unknown"
      
      #print "put rss item (%s) to tiddler %s"%(imtiddler.heading,imtiddler.title)
      
      try:
      	existing = store.get(imtiddler)
      except NoTiddlerError:
      	puts += 1
      	store.put(imtiddler)
      
    print "put %s items from the feed into tiddlyweb others are probably outdated"%puts

def init(config_in):
    global config
    config = config_in
