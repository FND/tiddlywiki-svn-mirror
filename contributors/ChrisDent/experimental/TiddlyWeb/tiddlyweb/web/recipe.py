"""
Access to Recipe objects via the web. List recipes,
GET a recipe, PUT a recipe, GET the tiddlers 
produced by a recipe.
"""
import urllib

from tiddlyweb.recipe import Recipe
from tiddlyweb.bag import Bag
from tiddlyweb.store import Store, NoRecipeError
from tiddlyweb.serializer import Serializer
from tiddlyweb.web.http import HTTP415, HTTP404, HTTP403
from tiddlyweb import control
from tiddlyweb.web import util as web

def get(environ, start_response):
    recipe = _determine_recipe(environ)

    serialize_type, mime_type = web.get_serialize_type(environ)
    if serialize_type not in ['json', 'html', 'text']:
        raise HTTP415, '%s not supported' % serialize_type
    serializer = Serializer(serialize_type, environ)
    serializer.object = recipe

    # setting the cookie for text/plain is harmless
    start_response("200 OK",
            [('Content-Type', mime_type)])
    return [serializer.to_string()]

def get_tiddlers(environ, start_response):
    filter_string = urllib.unquote(environ['QUERY_STRING'])
    usersign = environ['tiddlyweb.usersign']
    store = environ['tiddlyweb.store']
    recipe = _determine_recipe(environ)

    # get the tiddlers from the recipe and uniquify them
    tiddlers = control.get_tiddlers_from_recipe(recipe)
    tmp_bag = Bag('tmp_bag1', tmpbag=True)
    for tiddler in tiddlers:
        tmp_bag.add_tiddler(tiddler)

    # then filter those tiddlers
    tiddlers = control.filter_tiddlers_from_bag(tmp_bag, filter_string)
    tmp_bag = Bag('tmp_bag2', tmpbag=True)

    # Make an optimization so we are not going
    # to the database to load the policies of
    # the same bag over and over.
    policies = {}
    for tiddler in tiddlers:
        bag_name = tiddler.bag
        try:
            policies['bag_name'].allows(usersign, 'read')
        except KeyError:
            bag = Bag(tiddler.bag)
            store.get(bag)
            policy = bag.policy
            policies['bag_name'] = policy
            policies['bag_name'].allows(usersign, 'read')

        tiddler.recipe = recipe.name
        tmp_bag.add_tiddler(tiddler)

    return web.send_tiddlers(environ, start_response, tmp_bag)

def list(environ, start_response):
    store = environ['tiddlyweb.store']
    recipes = store.list_recipes()

    serialize_type, mime_type = web.get_serialize_type(environ)
    serializer = Serializer(serialize_type, environ)

    start_response("200 OK",
            [('Content-Type', mime_type)])

    return [ serializer.list_recipes(recipes) ]

def put(environ, start_response):
    recipe_name = environ['wsgiorg.routing_args'][1]['recipe_name']
    recipe_name = web.handle_extension(environ, recipe_name)

    recipe = Recipe(recipe_name)
    store = environ['tiddlyweb.store']
    length = environ['CONTENT_LENGTH']

    serialize_type, mime_type = web.get_serialize_type(environ)
    if serialize_type not in ['json']:
        raise HTTP415, '%s not supported' % serialize_type
    serializer = Serializer(serialize_type, environ)
    serializer.object = recipe
    content = environ['wsgi.input'].read(int(length))
    serializer.from_string(content.decode('UTF-8'))

    store.put(recipe)

    start_response("204 No Content",
            [('Location', web.recipe_url(environ, recipe))])

    return []

def _determine_recipe(environ):
    recipe_name = environ['wsgiorg.routing_args'][1]['recipe_name']
    recipe_name = web.handle_extension(environ, recipe_name)
    recipe = Recipe(recipe_name)

    store = environ['tiddlyweb.store']

    try:
        store.get(recipe)
    except NoRecipeError, e:
        raise HTTP404, '%s not found, %s' % (recipe.name, e)

    return recipe

