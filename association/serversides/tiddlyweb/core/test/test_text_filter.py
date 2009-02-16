"""
Tests for a [text[<string>]] style filter.
"""

import sys
sys.path.append('.')

from tiddlyweb import control
from tiddlyweb import filter
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.bag import Bag

from fixtures import muchdata, reset_textstore, teststore

def setup_module(module):
    module.store = teststore()
    reset_textstore()
    muchdata(module.store)

def test_filter_by_text():
    bag = Bag('bag0')
    bag = store.get(bag)

    bags_tiddlers = bag.list_tiddlers()
    assert len(bags_tiddlers) == 10

    found_tiddlers = control.filter_tiddlers_from_bag(bag, filter.by_text, 'tiddler 0')
    assert len(found_tiddlers) == 1
    assert found_tiddlers[0].title == 'tiddler0'

def test_filter_by_text_string():
    bag = Bag('bag0')
    bag = store.get(bag)

    bags_tiddlers = bag.list_tiddlers()
    assert len(bags_tiddlers) == 10

    found_tiddlers = control.filter_tiddlers_from_bag(bag, '[text[tiddler 0]]')
    assert len(found_tiddlers) == 1
    assert found_tiddlers[0].title == 'tiddler0'

def test_filter_by_text_string_negate():
    bag = Bag('bag0')
    bag = store.get(bag)

    bags_tiddlers = bag.list_tiddlers()
    assert len(bags_tiddlers) == 10

    found_tiddlers = control.filter_tiddlers_from_bag(bag, '[!text[tiddler 0]]')
    assert len(found_tiddlers) == 9
