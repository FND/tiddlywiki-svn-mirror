'''
This plugin adds the url /count/<<fieldname>>/<<bagname>>

It will provide a summary of all the different values that fieldname takes next to the number of times they occur in the bag

eg. 

/count/tags/foo

will return a list of all the tags that exist in the bag foo next to a count of how many times they occur.

This is based on work by Jon Lister in his tags.py plugin.
'''

from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
import logging
from tiddlyweb import control

def get_thing_from_bag(environ,start_response):
    bagName = environ['wsgiorg.routing_args'][1]['bagName']
    try:
      fieldName =  environ['wsgiorg.routing_args'][1]['fieldName']
    except KeyError:
      fieldName = "tags"
    try:
        limit = int(environ['tiddlyweb.query']['max'][0])
    except KeyError:
        limit = 0
    store = environ['tiddlyweb.store']    
    bag = store.get(Bag(bagName))
    tiddlers = control.filter_tiddlers_from_bag(bag,environ['tiddlyweb.filters'])
    start_response('200 OK', [
    ('Content-Type', 'text/plain; charset=utf-8')
    ])
    return get_tags_from_bag(environ,tiddlers,fieldName,limit)
    
def get_tags_from_bag(environ,tiddlers,field,limit):
    count = {}
    store = environ['tiddlyweb.store']  
    for tiddler in tiddlers:
        tiddler = store.get(tiddler)
        if field == "tags":
          for tag in tiddler.tags:
              try:
                count[tag] += 1
              except KeyError:
                count[tag] = 1
        else:
          try:
            val = tiddler.get(field)
          except AttributeError:
            try:
              val = tiddler.fields[field]
            except KeyError:
              pass
          if val:
            try:
              count[val] += 1
            except KeyError:
              count[val] = 1
    finalList = []
    count = [(key, value) for key, value in count.items()]
    def sort_func(x, y):
        return x[1]-y[1]
    count.sort(sort_func)
    for key, value in count:
        view = environ['tiddlyweb.query'].get("view", None) or ['list']
        finalList.append(key+' '+str(value))
            
    finalList = list(set(finalList))
    if limit != 0:
        finalList = finalList[0:limit]
    return "\n".join(finalList)


def create_dynamic_recipe(environ,recipeDefinition):
    recipe = Recipe('myRecipe')
    logging.debug("havaz a %s"%recipeDefinition)
    recipe.set_recipe(recipeDefinition)
    recipe.store = environ['tiddlyweb.store']
    return recipe

    
def init(config):
    config["selector"].add("/tags/{bagName:segment}",GET=get_thing_from_bag)
    config["selector"].add("/count/tags/{bagName:segment}",GET=get_thing_from_bag)
    config["selector"].add("/count/{fieldName:segment}/{bagName:segment}",GET=get_thing_from_bag)