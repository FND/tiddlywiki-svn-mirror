
"""
Test turning a bag into other forms.
"""

import sys
sys.path.append('.')

import simplejson

from tiddlyweb.serializer import Serializer
from tiddlyweb.model.bag import Bag
from tiddlyweb.config import config

from fixtures import bagfour

expected_string = """TiddlerOne
TiddlerTwo
TiddlerThree"""

expected_revbag_string = """TiddlerOne:0
TiddlerTwo:0
TiddlerThree:0"""

expected_html_string = """<ul id="tiddlers" class="listing">
<li><a href="/bags/bagfour/tiddlers/TiddlerOne">TiddlerOne</a></li>
<li><a href="/bags/bagfour/tiddlers/TiddlerTwo">TiddlerTwo</a></li>
<li><a href="/bags/bagfour/tiddlers/TiddlerThree">TiddlerThree</a></li>
</ul>"""

prefix_expected_html_string = """<ul id="tiddlers" class="listing">
<li><a href="/salacious/bags/bagfour/tiddlers/TiddlerOne">TiddlerOne</a></li>
<li><a href="/salacious/bags/bagfour/tiddlers/TiddlerTwo">TiddlerTwo</a></li>
<li><a href="/salacious/bags/bagfour/tiddlers/TiddlerThree">TiddlerThree</a></li>
</ul>"""

expected_html_revbag_string = """<ul id="tiddlers" class="listing">
<li><a href="/bags/bagfour/tiddlers/TiddlerOne/revisions/0">TiddlerOne:0</a></li>
<li><a href="/bags/bagfour/tiddlers/TiddlerTwo/revisions/0">TiddlerTwo:0</a></li>
<li><a href="/bags/bagfour/tiddlers/TiddlerThree/revisions/0">TiddlerThree:0</a></li>
</ul>"""

expected_bag_html = """
<div id="bagdesc" class="description">a tasty little bag</div>
<div class="tiddlerslink"><a href="bagfour/tiddlers">Tiddlers in Bag bagfour</a></div>
"""

def setup_module(module):
    module.serializer = Serializer('text')

def test_generate_json():
    serializer = Serializer('json')
    bagfour.desc = 'a tasty little bag'
    bagfour.policy.manage = ['NONE']
    serializer.object = bagfour
    string = serializer.to_string()

    json = simplejson.loads(string)
    assert json['policy']['manage'] == ['NONE']
    assert json['desc'] == 'a tasty little bag'


def test_generated_string():
    string = serializer.list_tiddlers(bagfour)

    assert string == expected_string

def test_generated_string_with_revbag():
    bagfour.revbag = True
    string = serializer.list_tiddlers(bagfour)

    assert string == expected_revbag_string
    bagfour.revbag = False

def test_generated_html():
    html_serializer = Serializer('html')
    string = html_serializer.list_tiddlers(bagfour)

    assert expected_html_string in string

def test_generated_html_with_prefix():
    new_config = config.copy()
    new_config['server_prefix'] = '/salacious'
    environ = {'tiddlyweb.config': new_config}
    html_serializer = Serializer('html', environ)
    string = html_serializer.list_tiddlers(bagfour)

    assert prefix_expected_html_string in string

def test_generated_wiki():
    environ = {'tiddlyweb.config': config}
    wiki_serializer = Serializer('wiki', environ)
    # work around a limitation in the serializations
    # when store is not set, we assume the bag has not been reified
    string = wiki_serializer.list_tiddlers(bagfour)

    assert '<div title="TiddlerOne' in string
    assert '<div title="TiddlerTwo' in string
    assert '<div title="TiddlerThree' in string

def test_generated_html_with_revbag():
    html_serializer = Serializer('html')
    bagfour.revbag = True
    string = html_serializer.list_tiddlers(bagfour)

    assert expected_html_revbag_string in string
    bagfour.revbag = False

def test_json_to_bag():
    serializer = Serializer('json')

    json_string = simplejson.dumps(dict(policy=dict(read=['user1'], manage=['NONE']), desc='simply the best'))
    newbag = Bag('bagho')
    serializer.object = newbag
    serializer.from_string(json_string)

    assert newbag.name == 'bagho'
    assert newbag.policy.read == ['user1']
    assert newbag.policy.manage == ['NONE']
    assert newbag.desc == 'simply the best'

def test_bag_to_html():
    serializer = Serializer('html')

    serializer.object = bagfour
    html = serializer.to_string()

    assert html == expected_bag_html

def test_text_list():
    serializer = Serializer('text')
    bags = [Bag('bag' + str(name)) for name in xrange(2)]
    string = serializer.list_bags(bags)

    assert string == 'bag0\nbag1'

def test_html_list():
    serializer = Serializer('html')
    bags = [Bag('bag' + str(name)) for name in xrange(2)]
    string = serializer.list_bags(bags)

    assert 'href="bags/bag0' in string
    assert 'href="bags/bag1' in string
