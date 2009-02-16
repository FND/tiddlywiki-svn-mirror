
"""
Confirm the store knows how to fail
to load a module.
"""

import sys
sys.path.append('.')

import py.test

from tiddlyweb.config import config
from tiddlyweb.store import Store

def setup_module(module):
    pass

def test_module_load_fail():
    py.test.raises(ImportError, 'store = Store("notexiststore")')

def test_unsupported_class():
    class Foo(object):
        pass

    foo = Foo()
    store = Store(config['server_store'][0], environ={'tiddlyweb.config': config})
    py.test.raises(AttributeError, 'store.put(foo)')
