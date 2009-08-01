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



def tiddlers_from_rss(rss_url):
    """Import an rss feed into a bag using a given rule number <url> <bag>"""
    rules = [u"<html><p><b><a href='%s'>%s </a><br>%s </p></html>"]
    
    rule =rules[0]
    d = feedparser.parse(rss_url)

    #print "got %s items from that feed"%len(d.entries)
    tiddlers = []
    for tiddler in d.entries:
        id = tiddler.id.replace("/","_") 
        imtiddler = Tiddler(id)
        imtiddler.heading = tiddler.title


        tags = []
        try:
          for tag in tiddler.tags:
            tags.append("["+tag.term+"]")
        except AttributeError:
          pass
  
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
        imtiddler.text = rule%(tiddler.link,imtiddler.heading,summary)
        try:
        	imtiddler.modifier = tiddler.author
        except AttributeError:
        	imtiddler.modifier = "Unknown"
        imtiddler.fields.update({"rssurl":rss_url})
        if "pos" in tiddler:
        	longlat = tiddler["gml_pos"].split(" ")
        	imtiddler.fields["longitude"] = longlat[0]
        	imtiddler.fields["latitute"] = longlat[1]
        tiddlers.append(imtiddler)
        
    
    return tiddlers

  
def savetiddlerstobag(tiddlers,bagname,overwrite=True):
  store = get_store(config)
  bag = store.get(Bag(bagname))
  puts = 0
  for imtiddler in tiddlers:
    imtiddler.bag = bagname
    try:
  	  print "%s"%imtiddler.title    	
  	  existing = store.get(imtiddler)
  	  if overwrite:
  	  	puts += 1
  	  	#print "put to %s"%bagname
  	  	store.delete(imtiddler)
  	  	imtiddler.revision = None
  	  	store.put(imtiddler)
    except NoTiddlerError:
  	  puts += 1
  	  #print "put to %s"%bagname
  	  store.put(imtiddler)
    
  print "put %s items from the feed into tiddlyweb others are probably outdated"%puts
  
@make_command()
def imrss(args):
    """Import an rss feed into a bag <url> <bag>"""
    rss_url = args[0]
    bagname = args[1]
    print "importing %s to %s"%(rss_url,bagname) 
    
    tiddlers = tiddlers_from_rss(rss_url)    
    #print "put rss item (%s) to tiddler %s"%(imtiddler.heading,imtiddler.title)
    savetiddlerstobag(tiddlers,bagname)

@make_command()
def imrsswithtags(args):  	
  """Import an rss feed into a bag and parse its words against tag words in bag2 or bag 3 to make tags <url> <bag> <bag2,bag3>"""
  rsstiddlers = tiddlers_from_rss(args[0])
  bagname = args[1]

  tagbags = args[2].split(",")

  for tagbag in tagbags:  
	  bag = Bag(tagbag)
	  store = get_store(config)
	  bag = store.get(bag)
	  tags = {}
	  for tiddler in bag.list_tiddlers():
	      tiddler = store.get(tiddler)
	      for tag in tiddler.tags:
	          tags[tag.lower()] = True
  newtiddlers = [] 
  for tiddler in rsstiddlers:
    description = tiddler.text
    newtags = []

    for word in description.split(" "):
      try:
        if len(word) > 0 and (word[0:] == "#" or word[0] == "@" or word[0:1] == "L:"): #look for twitter keywords
        	test = True
        	word = word[1:]
        else:
        	test = tags[word.lower()]
        #tag exists

        tag = word.lower().strip("!").strip(".").strip(":")
        #print "Tag %s matches"%tag
        #print "appending %s"%tag
        if not tag in newtags:
        	newtags.append(tag)

      except KeyError:
        pass
    tiddler.tags = newtags
    newtiddlers.append(tiddler)



  savetiddlerstobag(newtiddlers,bagname,overwrite=True)


def init(config_in):
    global config
    config = config_in
