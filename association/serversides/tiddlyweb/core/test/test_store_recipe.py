"""
Exploratory testing for storing recipes.

"""

import os
import sys
import shutil
sys.path.append('.')

from fixtures import textstore, reset_textstore, recipe_list_string, teststore
from tiddlyweb.model.recipe import Recipe

expected_stored_filename = os.path.join(textstore.recipe_store, 'testrecipe')

expected_stored_content = """desc: I enjoy being stored
policy: {"read": [], "create": [], "manage": [], "write": [], "owner": null, "delete": []}

/bags/bagone/tiddlers?filter=TiddlerOne
/bags/bagtwo/tiddlers?filter=TiddlerTwo
/bags/bagthree/tiddlers?filter=[tag[tagone]] [tag[tagthree]]"""

def setup_module(module):
    """
    Need to clean up the store here.
    """
    reset_textstore()
    module.store = teststore()

def test_recipe_put():
    """
    put a recipe to disk and make sure it is there.
    """

    recipe = Recipe('testrecipe')
    recipe.desc = 'I enjoy being stored'
    recipe.set_recipe(recipe_list_string)
    store.put(recipe)

    assert os.path.exists(expected_stored_filename), \
            'path %s should be created' \
            % expected_stored_filename

    f = file(expected_stored_filename)
    content = f.read()

    assert content == expected_stored_content, \
            'stored content should be %s, got %s' \
            % (expected_stored_content, content)

def test_recipe_get():
    """
    get a recipe from disk and confirm it has proper form.
    """

    stored_recipe = Recipe('testrecipe')
    stored_recipe = store.get(stored_recipe)

    assert stored_recipe == recipe_list_string

def test_recipe_no_recipe():
    """
    make a sure a recipe that is stored without a recipe is retrievable
    """
    recipe = Recipe('testrecipe2')
    recipe.desc = 'I enjoy being stored'
    store.put(recipe)

    stored_recipe = Recipe('testrecipe2')
    stored_recipe = store.get(stored_recipe)

    assert stored_recipe.desc == recipe.desc

def test_list():
    recipe = Recipe('testrecipe3')
    store.put(recipe)
    recipes = store.list_recipes()

    assert len(recipes) == 3
    assert u'testrecipe' in [recipe.name for recipe in recipes]
    assert u'testrecipe2' in [recipe.name for recipe in recipes]
    assert u'testrecipe3' in [recipe.name for recipe in recipes]
