"""
Twanager import rss to tiddlyweb plugin
Requires easy_install of feedparser
twanager_plugins: ['imrss']
"""
from tiddlywebplugins.utils import get_store
import feedparser, logging,httplib2
from tiddlyweb.model.bag import Bag
from tiddlyweb.manage import make_command
from tiddlyweb.store import Store
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store, NoBagError,NoTiddlerError


def _start_media_thumbnail(self, attrsD):
  context = self._getContext()
  context.setdefault('media_thumbnail', [])
  context['media_thumbnail'].append(attrsD)
feedparser._FeedParserMixin._start_media_thumbnail = _start_media_thumbnail


def tiddlers_from_rss(rss_url):
  """Import an rss feed into a bag using a given rule number <url> <bag>"""
  DEFAULT_TIDDLER_TEXT =  u"<html><p><a href=\"%s\">%s</a><br/>%s</p></html>"
  
  h = httplib2.Http()
  try:
    resp,content = h.request(rss_url,method='GET')
  except httplib2.RelativeURIError:
    try:
      content = open(rss_url,"r")
      content = "".join(content.readlines())
    except IOError:
      pass
    resp = {"status":200}
    
  content = content.replace("media:thumbnail","media_thumbnail") #this is a workaround to allow media thumbnails to work.
  content = content.replace("media:content","media_thumbnail") #this is a workaround to allow media thumbnails to work.
  feed = feedparser.parse(content)
  print "url returned status code %s"%resp["status"]
  
  tiddlers = []
  for entry in feed.entries:
      try:
        unique_title = entry.id
      except AttributeError:
        try:
          unique_title= entry.link
        except AttributeError:
          unique_title= "%s_%s"%(entry.title,rss_url)
      unique_title = unique_title.replace("/","_").replace(".","_").replace(":","_")
      imtiddler = Tiddler(unique_title)
      imtiddler.fields["heading"] = entry.title #save the original title for display purposes


      tags = []
      try:
        for tag in entry.tags:
          tags.append("["+tag.term+"]")
      except AttributeError:
        pass
      imtiddler.tags = tags
      
      
      description = None
      try: 
        description = entry.summary
      except AttributeError:
        try:
          description = entry.content[0]["value"]
        except AttributeError:
          description = u"No description."
            
      try:
        imtiddler.modifier = entry.author
      except AttributeError:
        imtiddler.modifier = "Unknown" 


      try:
        posted_date = entry["updated_parsed"]
        yr = posted_date[0]
        mo = posted_date[1]
        dy = posted_date[2]
        hr = posted_date[3]
        mi = posted_date[4]
        sec = posted_date[5]
        imtiddler.modified = "%02d%02d%02d%02d%02d%02d"%(yr,mo,dy,hr,mi,sec)
      except KeyError:
        pass #use default
        
      if "pos" in entry:
        longlat = entry["pos"].split(" ")
        imtiddler.fields["geo.lat"] = longlat[0]
        imtiddler.fields["geo.long"] = longlat[1]
      elif "point" in entry:
        longlat = entry["point"].split(" ")
        imtiddler.fields["geo.lat"] = longlat[0]
        imtiddler.fields["geo.long"] = longlat[1]
      try:
        link = entry.link
      except AttributeError:
        link = ""
      imtiddler.text = DEFAULT_TIDDLER_TEXT%(link,entry.title,description)
      imtiddler.fields.update({"rssurl":rss_url})
      try:
        name = config['imrss']['module']
        f = __import__(name)
        imtiddler = f.handler(rss_url,imtiddler,entry,feed=feed)
      except KeyError:
        pass
      if imtiddler:
        tiddlers.append(imtiddler)
  
  return tiddlers

  
def savetiddlerstobag(tiddlers,bagname,overwrite=False):
  store = get_store(config)
  bag = store.get(Bag(bagname))
  puts = 0
  for imtiddler in tiddlers:
    imtiddler.bag = bagname
    try:
           
      existing = store.get(imtiddler)
      if overwrite:
        puts += 1
        store.delete(imtiddler)
        imtiddler.revision = None
        store.put(imtiddler)
        print "successfully overwrote %s"%imtiddler.title 
    except NoTiddlerError:
      print "successfully put %s"%imtiddler.title
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
