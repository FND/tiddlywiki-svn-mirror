"""
Access to Recipe objects via the web. List recipes,
GET a recipe, PUT a recipe, GET the tiddlers
produced by a recipe.
"""

import urllib

from tiddlyweb.filter import FilterError
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.policy import \
        create_policy_check, UserRequiredError, ForbiddenError
from tiddlyweb.store import NoRecipeError, NoBagError, StoreMethodNotImplemented
from tiddlyweb.serializer import Serializer, NoSerializationError
from tiddlyweb.web.http import HTTP400, HTTP415, HTTP404
from tiddlyweb.web.sendtiddlers import send_tiddlers
from tiddlyweb import control
from tiddlyweb.web import util as web


def delete(environ, start_response):
    """
    Delete a recipe, where what delete means
    depends on the store used.
    """
    recipe = _determine_recipe(environ)

    recipe.policy.allows(environ['tiddlyweb.usersign'], 'manage')

    try:
        recipe.store.delete(recipe)
    except StoreMethodNotImplemented:
        raise HTTP400('Recipe DELETE not supported')

    start_response("204 No Content", [])
    return []


def get(environ, start_response):
    """
    Get the representation of a recipe, based on the
    requested serialization. Will usually show the list
    of bags and filters that make up the recipe.
    """
    recipe = _determine_recipe(environ)
    recipe.policy.allows(environ['tiddlyweb.usersign'], 'read')

    try:
        serialize_type, mime_type = web.get_serialize_type(environ)
        serializer = Serializer(serialize_type, environ)
        serializer.object = recipe
        content = serializer.to_string()
    except NoSerializationError:
        raise HTTP415('Content type %s not supported' % mime_type)

    # setting the cookie for text/plain is harmless
    start_response("200 OK",
            [('Content-Type', mime_type)])
    return [content]


def get_tiddlers(environ, start_response):
    """
    Get the list of tiddlers produced by this
    recipe.
    """
    filter_string = web.filter_query_string(environ)
    usersign = environ['tiddlyweb.usersign']
    store = environ['tiddlyweb.store']
    recipe = _determine_recipe(environ)

    recipe.policy.allows(usersign, 'read')

    # get the tiddlers from the recipe and uniquify them
    try:
        tiddlers = control.get_tiddlers_from_recipe(recipe)
        tmp_bag = Bag('tmp_bag1', tmpbag=True)
        tmp_bag.add_tiddlers(tiddlers)
    except NoBagError, exc:
        raise HTTP404('recipe %s lists an unknown bag: %s' % (recipe.name, exc))

    # then filter those tiddlers
    try:
        tiddlers = control.filter_tiddlers_from_bag(tmp_bag, filter_string)
    except FilterError, exc:
        raise HTTP400('malformed filter: %s' % exc)
    tmp_bag = Bag('tmp_bag2', tmpbag=True)

    # Make an optimization so we are not going
    # to the database to load the policies of
    # the same bag over and over.
    policies = {}
    for tiddler in tiddlers:
        bag_name = tiddler.bag
        try:
            policies[bag_name].allows(usersign, 'read')
        except KeyError:
            bag = Bag(tiddler.bag)
            store.get(bag)
            policy = bag.policy
            policies[bag_name] = policy
            policies[bag_name].allows(usersign, 'read')

        tiddler.recipe = recipe.name
        tmp_bag.add_tiddler(tiddler)

    return send_tiddlers(environ, start_response, tmp_bag)


def list(environ, start_response):
    """
    Get a list of all recipes the current user can read.
    """
    store = environ['tiddlyweb.store']
    recipes = store.list_recipes()
    kept_recipes = []
    for recipe in recipes:
        try:
            store.get(recipe)
            recipe.policy.allows(environ['tiddlyweb.usersign'], 'read')
            kept_recipes.append(recipe)
        except(UserRequiredError, ForbiddenError):
            # if we got a perm error, just pass
            # and don't add anything to the kept recipes
            pass

    serialize_type, mime_type = web.get_serialize_type(environ)
    serializer = Serializer(serialize_type, environ)

    start_response("200 OK",
            [('Content-Type', mime_type)])

    return [serializer.list_recipes(kept_recipes)]


def put(environ, start_response):
    """
    Put a new recipe to the server.
    """
    recipe_name = environ['wsgiorg.routing_args'][1]['recipe_name']
    recipe_name = urllib.unquote(recipe_name)
    recipe_name = unicode(recipe_name, 'utf-8')
    recipe_name = web.handle_extension(environ, recipe_name)

    recipe = Recipe(recipe_name)
    store = environ['tiddlyweb.store']
    length = environ['CONTENT_LENGTH']

    usersign = environ['tiddlyweb.usersign']

    try:
        store.get(recipe)
        recipe.policy.allows(usersign, 'manage')
    except NoRecipeError:
        create_policy_check(environ, 'recipe', usersign)

    try:
        serialize_type = web.get_serialize_type(environ)[0]
        serializer = Serializer(serialize_type, environ)
        serializer.object = recipe
        content = environ['wsgi.input'].read(int(length))
        serializer.from_string(content.decode('UTF-8'))

        store.put(recipe)
    except NoSerializationError:
        raise HTTP415('Content type %s not supported' % serialize_type)

    start_response("204 No Content",
            [('Location', web.recipe_url(environ, recipe))])

    return []


def _determine_recipe(environ):
    """
    Interpret URL information to determine the target
    recipe and then get it from the store.
    """
    recipe_name = environ['wsgiorg.routing_args'][1]['recipe_name']
    recipe_name = urllib.unquote(recipe_name)
    recipe_name = unicode(recipe_name, 'utf-8')
    recipe_name = web.handle_extension(environ, recipe_name)
    recipe = Recipe(recipe_name)

    store = environ['tiddlyweb.store']

    try:
        store.get(recipe)
    except NoRecipeError, exc:
        raise HTTP404('%s not found, %s' % (recipe.name, exc))

    return recipe
