from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
import logging
from tiddlyweb import control

def get_tags_from_bag(environ,start_response):
    bagName = environ['wsgiorg.routing_args'][1]['bagName']
    try:
        limit = int(environ['tiddlyweb.query']['max'][0])
    except KeyError:
        limit = 0
    store = environ['tiddlyweb.store']    
    bag = store.get(Bag(bagName))
    tiddlers = control.filter_tiddlers_from_bag(bag,environ['tiddlyweb.filters'])
    
    #bag = Bag(bagName)

    #bag = store.get(bag)
    tags = {}
    for tiddler in tiddlers:
        tiddler = store.get(tiddler)
        for tag in tiddler.tags:
            try:
                tags[tag] += 1
            except KeyError:
                tags[tag] = 1
    tagList = []
    tags = [(key, value) for key, value in tags.items()]
    def sort_func(x, y):
        return x[1]-y[1]
    tags.sort(sort_func)
    for key, value in tags:
        view = environ['tiddlyweb.query'].get("view", None) or ['list']
        if  view[0]== "cloud":
            tagList.append("<a href='/ideas?select=tag:"+key+"'>"+key+"</a>"+' '+str(value))
        else:
            tagList.append("<a href='/ideas?select=tag:"+key+"''>"+key+'</a> ('+str(value)+')<br/>')
            
        
    tagList = list(set(tagList))
    if limit != 0:
        tagList = tagList[0:limit]
    start_response('200 OK', [
    ('Content-Type', 'text/html; charset=utf-8')
    ])
    return "\n".join(tagList)


def create_dynamic_recipe(environ,recipeDefinition):
    recipe = Recipe('myRecipe')
    logging.debug("havaz a %s"%recipeDefinition)
    recipe.set_recipe(recipeDefinition)
    recipe.store = environ['tiddlyweb.store']
    return recipe

    
def init(config):
    config["selector"].add("/tags/{bagName:segment}",GET=get_tags_from_bag)