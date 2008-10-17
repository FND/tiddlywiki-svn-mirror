"""
Test extended fields on tiddlers.
Some tiddlers have additional fields what we don't
know about ahead of time, but we'd like to handle.
Most straightforward things to do here seems to be
to do what TiddlyWiki does: have a fields field.
"""

import sys
sys.path.append('.')

import simplejson

from tiddlyweb.config import config
from tiddlyweb.serializer import Serializer
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.bag import Bag

from fixtures import reset_textstore, teststore

def setup_module(module):
    reset_textstore()
    module.store = teststore()

def test_tiddler_has_fields():
    tiddler = Tiddler('feebles')
    assert hasattr(tiddler, 'fields')

def test_tiddler_fields_dict():
    tiddler = Tiddler('feebles')
    assert type(tiddler.fields) == dict

def test_tiddler_fields_contains_stuff():
    tiddler = Tiddler('feebles')
    tiddler.fields = {'this':'is cool', 'so':'is that'}
    assert tiddler.fields['this'] == 'is cool'
    assert tiddler.fields['so'] == 'is that'

def test_tiddler_fields_are_stored():
    bag = Bag('bag0')
    store.put(bag)
    tiddler = Tiddler('feebles', bag='bag0')
    tiddler.fields = {'field1': 'value1', 'field2': 'value2'}
    store.put(tiddler)

    tiddler_second = Tiddler('feebles', bag='bag0')
    store.get(tiddler_second)
    assert tiddler_second.fields['field1'] == 'value1'
    assert tiddler_second.fields['field2'] == 'value2'

def test_tiddler_fields_ignore_server():
    bag = Bag('bag0')
    store.put(bag)
    tiddler = Tiddler('serverimpostor', bag='bag0')
    tiddler.fields = {'field1': 'value1', 'server.host': 'value1', 'server.type': 'value2'}
    store.put(tiddler)

    tiddler_second = Tiddler('serverimpostor', bag='bag0')
    store.get(tiddler_second)
    assert tiddler_second.fields['field1'] == 'value1'
    assert 'server.host' not in tiddler_second.fields.keys()
    assert 'server.type' not in tiddler_second.fields.keys()

# these following rely on the previous
def test_tiddler_fields_as_text():
    tiddler = Tiddler('feebles', bag='bag0')
    store.get(tiddler)
    serializer = Serializer('text')
    serializer.object = tiddler
    text_of_tiddler = serializer.to_string()
    assert 'field1: value1\n' in text_of_tiddler
    assert 'field2: value2\n' in text_of_tiddler

def test_tiddler_fields_as_json():
    tiddler = Tiddler('feebles', bag='bag0')
    store.get(tiddler)
    serializer = Serializer('json')
    serializer.object = tiddler
    json_string = serializer.to_string()
    tiddler_info = simplejson.loads(json_string)
    assert tiddler_info['fields']['field1'] == 'value1'
    assert tiddler_info['fields']['field2'] == 'value2'
    assert tiddler_info['bag'] == 'bag0'

    tiddler = Tiddler('new feebles', bag='bag0')
    serializer.object = tiddler
    serializer.from_string(json_string)

    assert tiddler.fields['field1'] == 'value1'
    assert tiddler.fields['field2'] == 'value2'
    assert tiddler.bag == 'bag0'

def test_tiddler_fields_as_wiki():
    tiddler = Tiddler('feebles', bag='bag0')
    store.get(tiddler)
    environ = {'tiddlyweb.config': config}
    serializer = Serializer('wiki', environ)
    serializer.object = tiddler
    wiki_string = serializer.to_string()

    assert 'field1="value1"' in wiki_string
    assert 'field2="value2"' in wiki_string
    assert 'server.bag="bag0"' in wiki_string

def test_tiddler_fields_as_html():
    tiddler = Tiddler('feebles', bag='bag0')
    store.get(tiddler)
    serializer = Serializer('html')
    serializer.object = tiddler
    wiki_string = serializer.to_string()

    assert 'field1="value1"' in wiki_string
    assert 'field2="value2"' in wiki_string
    assert 'title="feebles"' in wiki_string

#def test_fields_in_tiddler_put():
#def test_fields_in_tiddler_get():
