
"""
Test serializing into Rich Text Format (RTF)
"""

import sys
sys.path.insert(0, '.')

from tiddlyweb.serializer import Serializer
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.bag import Bag

import rtf

def setup_module(module):
    module.serializer = Serializer('rtf')

def test_list_bags():
    bags = [Bag('bag' + str(name)) for name in xrange(2)]
    string = serializer.list_bags(bags)

    assert string.startswith('{\\rtf1\\ansi')
    assert string.endswith('}\n')
    assert "{\\pard \\fs44 Bags\\par}\\line\n" in string
    assert 'bag0' in string
    assert 'bag1' in string
