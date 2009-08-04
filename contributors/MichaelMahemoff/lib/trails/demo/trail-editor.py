from tiddlyweb.model.bag import Bag
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import NoUserError, NoRecipeError, NoBagError, NoTiddlerError
from tiddlywebplugins import do_html, entitle
from jinja2 import Environment, FileSystemLoader
from urllib import unquote_plus
from string import whitespace
import re
import simplejson as json

from tiddlyweb.serializations.html import Serialization as HTMLSerialization
# from tiddlyweb.model.tiddler import Tiddler

class Serialization(HTMLSerialization):

  def __init__(self, environ=None):
    self.environ = environ

  def tiddler_as(self, tiddler):
    trail = json.loads(tiddler.text)
    template = Environment(loader=FileSystemLoader('templates')).get_template("trail-editor.html")
    return template.render(tiddler=tiddler, trail=trail, server_prefix=self.environ['tiddlyweb.config']['server_prefix'])

  def as_tiddler(self, tiddler, input_string):
    print "AS TIDDLER"
    print "input"
    print tiddler
    print input_string
    return tiddler

def init(config):
  config['extension_types']['trail-editor'] = 'application/trail-editor'
  config['serializers']['application/trail-editor'] = ['trail-editor', 'text/html; charset=UTF-8']
