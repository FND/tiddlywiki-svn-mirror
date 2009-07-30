from tiddlyweb.model.bag import Bag
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import NoUserError, NoRecipeError, NoBagError, NoTiddlerError
from tiddlywebplugins import do_html, entitle
from jinja2 import Environment, FileSystemLoader
from urllib import unquote_plus
from string import whitespace
import re

import simplejson as json

def make_trail_tiddler(environ):
  trail_id=environ['wsgiorg.routing_args'][1]['trail_id']
  trail_owner=environ['wsgiorg.routing_args'][1]['trail_owner']
  tiddler = Tiddler(title=trail_id)
  tiddler.bag = 'trails-'+trail_owner
  tiddler.owner = trail_owner
  try:
    environ['tiddlyweb.store'].get(tiddler)
    return tiddler
  except NoTiddlerError:
    return None

@do_html()
def trail_player(environ, start_response):
  tiddler = make_trail_tiddler(environ)
  if (not tiddler):
    return ['no tiddlers']
  trail = json.loads(tiddler.text)
  template = Environment(loader=FileSystemLoader('templates')).get_template("player.html")
  return template.generate(tiddler=tiddler, trail=trail, server_prefix=environ['tiddlyweb.config']['server_prefix'])
  # TODO say there are no bags


@do_html()
def trail_editor(environ, start_response):
  tiddler = make_trail_tiddler(environ)
  if (not tiddler):
    tiddler = Tiddler(title=environ['wsgiorg.routing_args'][1]['trail_id'], text='{"resources": []}')
  trail = json.loads(tiddler.text)
  template = Environment(loader=FileSystemLoader('templates')).get_template("editor.html")
  return template.generate(tiddler=tiddler, trail=trail, server_prefix=environ['tiddlyweb.config']['server_prefix'])

def trail_updater(environ, start_response):
  # http://is.gd/1GTCG
  tiddler = make_trail_tiddler(environ)
  trail = dict()
  trail['name'] = environ['tiddlyweb.query']['name'][0]
  # trail['resources'] = environ['tiddlyweb.query']['resources'][0].split(whitespace)
  trail['resources'] = re.split('\s+',environ['tiddlyweb.query']['resources'][0].strip())
  # edit_url=environ['HTTP_HOST']+'/trails/'+ environ['wsgiorg.routing_args']['owner']+ '/'+ trail['name']

  tiddler = make_trail_tiddler(environ)
  tiddler.text = json.dumps(trail)

  environ['tiddlyweb.store'].put(tiddler)

  edit_url="http://"+environ['HTTP_HOST']+environ['tiddlyweb.config']['server_prefix']+"/trails/"+environ['wsgiorg.routing_args'][1]['trail_owner']+'/'+trail['name']+'.editor'
  start_response("303 See Other", [('Location', edit_url)]);
  return ['---']

def init(config):
  config['selector'].add('/trails/{trail_owner}/{trail_id}.player', GET=trail_player)
  config['selector'].add('/trails/{trail_owner}/{trail_id}.editor', GET=trail_editor)
  config['selector'].add('/trails/{trail_owner}/{trail_id}', PUT=trail_updater)
  # config['selector'].add('/trails/{trail_id}.player', GET=trail_player)
