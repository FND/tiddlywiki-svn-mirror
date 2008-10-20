
"""
An experiment to push data to a server using the 
tiddlywebweb store tools. Created to get data
onto a googleappengine server.
"""

import sys

sys.path.append('/Users/cdent/src/osmo/Tiddlyweb')

from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.tiddler import Tiddler

from tiddlywebweb.tiddlywebstore import Store

environ = {
        'tiddlyweb.config': {
            #'server_store': [ None, {'server_base': 'http://tiddlyweb.appspot.com'} ],
            'server_store': [ None, {'server_base': 'http://localhost:8000'} ],
            }
        }

def do_recipe(name, bag_name):
    store = Store(environ)
    recipe = Recipe(name)
    recipe.set_recipe([['TiddlyWeb', ''],[bag_name, '']])
    store.recipe_put(recipe)

def do_bag(name):
    store = Store(environ)
    bag = Bag(name)
    store.bag_put(bag)

def do_tiddler(name, bag_name):
    store = Store(environ)
    tiddler = Tiddler(name, bag=bag_name)
    tiddler.text = 'wow this is %s in %s' % (name, bag_name)
    store.tiddler_put(tiddler)

def do_bin(name, bag_name):
    store = Store(environ)
    tiddler = Tiddler(name, bag=bag_name)
    tiddler.type = 'image/png'
    tiddler.text = file(name, 'rb').read()
    store.tiddler_put(tiddler)

def usage():
    print "you need to tell me what to do"

if __name__ == '__main__':
    try:
        if sys.argv[1] == 'recipe':
            do_recipe(sys.argv[2], sys.argv[3])
        elif sys.argv[1] == 'bag':
            do_bag(sys.argv[2])
        elif sys.argv[1] == 'tiddler':
            do_tiddler(sys.argv[2], sys.argv[3])
        elif sys.argv[1] == 'bin':
            do_bin(sys.argv[2], sys.argv[3])
        else:
            usage()
    except IndexError:
        usage()

