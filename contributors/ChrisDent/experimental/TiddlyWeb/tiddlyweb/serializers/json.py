"""
Text based serializers.
"""

import re
import urllib
import simplejson

from tiddlyweb.serializer import TiddlerFormatError

def list_recipes(recipes):
    return simplejson.dumps([recipe.name for recipe in recipes])

def list_bags(bags):
    return simplejson.dumps([bag.name for bag in bags])

def recipe_as(recipe):
    """
    Recipe as json.
    """
    return simplejson.dumps(recipe)

def as_recipe(recipe, input):
    """
    Turn a json string back into a recipe.
    """
    info = simplejson.loads(input)
    recipe.set_recipe(info)
    return recipe

def bag_as(bag):
    """
    List the tiddlers in a bag as text.
    """
    return simplejson.dumps([tiddler.title for tiddler in bag.list_tiddlers()])

def as_bag(bag, input):
    pass

def tiddler_as(tiddler):
    tiddler_dict = {}
    for key in ['title', 'modifier', 'created', 'modified', 'tags', 'text']:
        tiddler_dict[key] = getattr(tiddler, key, None)

    return simplejson.dumps(tiddler_dict)

def as_tiddler(tiddler, input):
    dict_from_input = simplejson.loads(input)
    for key, value in dict_from_input.iteritems():
        setattr(tiddler, key, value)

    return tiddler

