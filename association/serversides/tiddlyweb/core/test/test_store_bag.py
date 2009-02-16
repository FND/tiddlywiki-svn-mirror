"""
Store and retrieve a bag.

See about doing this lazily.
"""

import os
import sys
sys.path.append('.')

import py.test

from fixtures import tiddlers, bagone, reset_textstore, teststore
from tiddlyweb.store import NoBagError
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.tiddler import Tiddler

def setup_module(module):
    reset_textstore()
    module.store = teststore()

def test_simple_put():
    bagone.desc = 'I enjoy being stored'
    store.put(bagone)

    assert os.path.exists('store/bags/bagone'), \
            'path %s should be created' \
            % 'store/bags/bagone'
    assert os.path.exists('store/bags/bagone/policy'), \
            'path %s should be created' \
            % 'store/bags/bagone/policy'
    assert os.path.exists('store/bags/bagone/description'), \
            'path %s should be created' \
            % 'store/bags/bagone/description'
    assert os.path.exists('store/bags/bagone/tiddlers'), \
            'path %s should be created' \
            % 'store/bags/bagone/tiddlers'

def test_simple_get():

    tiddler = tiddlers[0]
    tiddler.bag = 'bagone'
    store.put(tiddler)

    bag = Bag(name='bagone')
    bag = store.get(bag)

    assert bag.list_tiddlers()[0].title == tiddler.title, 'stored tiddler title and retrieved tiddler.title the same'
    assert bag.list_tiddlers()[0].text == None
    assert bag.list_tiddlers()[0].tags == []
    assert bag.policy.read == bagone.policy.read
    assert bag.policy.write == bagone.policy.write
    assert bag.policy.create == bagone.policy.create
    assert bag.policy.delete == bagone.policy.delete
    assert bag.policy.manage == bagone.policy.manage
    assert bag.policy.owner == bagone.policy.owner
    assert bag.desc == 'I enjoy being stored'
    
    the_tiddler = bag.list_tiddlers()[0]
    the_tiddler = store.get(the_tiddler)
    assert the_tiddler.title == tiddler.title, 'stored tiddler title and retrieved tiddler.title the same'
    assert sorted(the_tiddler.tags) == sorted(tiddler.tags)

def test_failed_get():
    bag = Bag(name='bagnine')
    py.test.raises(NoBagError, 'store.get(bag)')

def test_list():
    bag = Bag('bagtwo')
    store.put(bag)
    bags = store.list_bags()

    assert len(bags) == 2
    assert u'bagone' in [bag.name for bag in bags]
    assert u'bagtwo' in [bag.name for bag in bags]
