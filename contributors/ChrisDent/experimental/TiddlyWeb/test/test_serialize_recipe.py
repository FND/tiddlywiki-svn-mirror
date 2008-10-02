
"""
Test turning a recipe into other forms.
"""

import sys
sys.path.append('.')

from tiddlyweb.recipe import Recipe
from tiddlyweb.serializer import Serializer

from fixtures import recipe_list

expected_string = """desc: 
policy: {"read": [], "create": [], "manage": [], "write": [], "owner": null, "delete": []}

/bags/bagone/tiddlers?filter=TiddlerOne
/bags/bagtwo/tiddlers?filter=TiddlerTwo
/bags/bagthree/tiddlers?filter=[tag[tagone]] [tag[tagthree]]"""

no_desc = """/bags/bagone/tiddlers?filter=TiddlerOne
/bags/bagtwo/tiddlers?filter=TiddlerTwo
/bags/bagthree/tiddlers?filter=[tag[tagone]] [tag[tagthree]]"""

expected_html_string = """<div id="recipedesc" class="description">Courage of Bags</div>
<ul id="recipe">
<li><a href="/bags/bagone/tiddlers?filter=TiddlerOne">bag: bagone filter:TiddlerOne</a></li>
<li><a href="/bags/bagtwo/tiddlers?filter=TiddlerTwo">bag: bagtwo filter:TiddlerTwo</a></li>
<li><a href="/bags/bagthree/tiddlers?filter=%5Btag%5Btagone%5D%5D%20%5Btag%5Btagthree%5D%5D">bag: bagthree filter:[tag[tagone]] [tag[tagthree]]</a></li>
</ul>"""

def setup_module(module):
    module.recipe = Recipe(name='testrecipe')
    module.recipe.set_recipe(recipe_list)

def test_generated_text():
    serializer = Serializer('text')
    serializer.object = recipe
    string = serializer.to_string()

    assert string == expected_string, \
            'serialized recipe looks like we expect. should be %s, got %s' \
            % (expected_string, string)

    assert '%s' % serializer == expected_string, \
            'serializer goes to string as expected_string'

def test_simple_recipe():
    recipe = Recipe('other')
    recipe.set_recipe([['bagbuzz', '']])
    recipe.policy.manage = ['a']
    recipe.policy.read = ['b']
    recipe.policy.create = ['c']
    recipe.policy.delete = ['d']
    recipe.policy.owner = 'e'
    serializer = Serializer('text')
    serializer.object = recipe
    string = serializer.to_string()
    print string

    new_recipe = Recipe('other')
    serializer.object = new_recipe
    serializer.from_string(string)

    assert recipe == new_recipe, 'recipe and new_recipe have equality'

    recipe = Recipe('other')
    recipe.set_recipe([['bagboom', '']])
    assert recipe != new_recipe, 'modified recipe not equal new_recipe'

def test_json_recipe():
    """
    JSON serializer roundtrips.
    """
    recipe = Recipe('other')
    recipe.set_recipe([['bagbuzz', '']])
    recipe.policy.manage = ['a']
    recipe.policy.read = ['b']
    recipe.policy.create = ['c']
    recipe.policy.delete = ['d']
    recipe.policy.owner = 'e'
    serializer = Serializer('json')
    serializer.object = recipe
    string = serializer.to_string()
    print string

    other_recipe = Recipe('other')
    serializer.object = other_recipe
    serializer.from_string(string)

    assert recipe == other_recipe

    serializer.object = other_recipe
    other_string = serializer.to_string()
    print other_string

    assert string == other_string

def test_old_text():
    """
    Send in text without a description
    and make sure we are able to accept it.
    """
    recipe = Recipe('other')
    serializer = Serializer('text')
    serializer.object = recipe
    serializer.from_string(no_desc)

    output = serializer.to_string()

    assert output == expected_string

def test_generated_html():
    serializer = Serializer('html')
    recipe.desc = 'Courage of Bags'
    serializer.object = recipe
    string = serializer.to_string()

    assert expected_html_string in string
    assert expected_html_string in '%s' % serializer

