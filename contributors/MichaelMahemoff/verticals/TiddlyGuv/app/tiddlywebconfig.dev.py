import cgi
import os
import tiddlyweb.web.handler.recipe
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe

tiddlyweb_root = os.environ["TIDDLYWEB_ROOT"] + "/tiddlyweb"
config = {
  # 'server_store': ['text', {'store_root': 'store'}],
  'hostname': '0.0.0.0',
  'server_prefix': '',
  'server_store': ['simpletext', {'store_root': 'store'}],
  # 'urls_map': tiddlyweb_root + "/urls.map", 
  # 'base_tiddlywiki': tiddlyweb_root + "/empty.html",
  'extension_types': { 'atom': 'application/atom+xml' },
  'serializers': {
    'application/atom+xml': ['atom.atom', 'application/atom+xml; charset=UTF-8'],
    'text/html': ['atom.htmlatom', 'text/html; charset=UTF-8']
  },
  'auth_systems': [
      'ldap',
      # 'cookie_form',
      # 'openid',
  ]
}

def info(v):
  for name, val in vars(obj):
    return 'INFO  .%s: %r' % (name, val)

# orig_determine_recipe = tiddlyweb.web.handler.recipe._determine_recipe
def my_determine_recipe(environ):

  username="private-"+environ['tiddlyweb.usersign']['name']
  print "USER " + username
  recipe=orig_determine_recipe(environ)
  recipe_list = recipe.get_recipe()
  print "PREVIOUS RECIPE"
  print recipe_list
  bag = Bag(name="private-mike")
  store = environ['tiddlyweb.store']
  # store.get(bag)
  print "bag"
  print bag
  print bag.name
  recipe_list.append([bag, ''])
  print "FINAL RECIPE: "
  print recipe_list
  recipe.set_recipe(recipe_list)

  try:
      store.get(recipe)
  except NoRecipeError, exc:
      raise HTTP404('%s not found, %s' % (recipe.name, exc))

  return recipe # recipe.set_recipe([recipe.get_recipe()+[Bag(name=username), '']])

  # recipe.set_recipe(recipe.get_recipe()+[Bag(name="private-mike"), ''])

# tiddlyweb.web.handler.recipe._determine_recipe = my_determine_recipe

def my_get(environ, start_response):
  start_response("200 OK", [('Content-Type', 'text/html')])
  return "Nothing"

print "GREAT STUFF:"
