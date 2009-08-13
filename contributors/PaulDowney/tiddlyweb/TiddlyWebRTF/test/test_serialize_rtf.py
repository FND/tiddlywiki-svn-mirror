
"""
Test serializing into Rich Text Format (RTF)
"""

import sys
sys.path.insert(0, '.')
import rtf

from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store
from tiddlyweb.config import config
from tiddlyweb.serializer import Serializer

def setup_module(module):
    module.serializer = Serializer('rtf')

def assert_rtf_document(string):
    assert string.startswith('{\\rtf1\\ansi')
    assert string.endswith('}\n')

def test_list_bags_as_rtf():
    bags = [Bag('bag' + str(name)) for name in xrange(2)]
    string = serializer.list_bags(bags)

    assert_rtf_document(string)
    assert '{\\pard \\fs44 Bags\\par}' in string
    assert ' bag0' in string
    assert ' bag1' in string

def test_list_recipes_as_rtf():
    recipes = [Recipe('recipe' + str(name)) for name in xrange(2)]
    string = serializer.list_recipes(recipes)

    assert_rtf_document(string)
    assert '{\\pard \\fs44 Recipes\\par}' in string
    assert 'recipe0' in string
    assert 'recipe1' in string

def test_list_tiddlers_as_rtf():
    bag = Bag('test bag')
    tiddlers = [Tiddler('tiddler' + str(name)) for name in xrange(2)]
    [bag.add_tiddler(tiddler) for tiddler in tiddlers]
    string = serializer.list_tiddlers(bag)

    assert_rtf_document(string)
    assert '{\\pard \\fs44 Tiddlers in Bag test bag\\par}' in string
    assert ' tiddler0' in string
    assert ' tiddler1' in string

def test_tiddler_fields_as_rtf():
    tiddler = Tiddler('Test Tiddler', bag='bag0')
    serializer.object = tiddler
    string = serializer.to_string()

    assert_rtf_document(string)
    assert '{\\pard \\fs44 Test Tiddler\\par}' in string

