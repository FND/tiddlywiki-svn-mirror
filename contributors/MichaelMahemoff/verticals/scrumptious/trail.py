from tiddlyweb.serializations.html import Serialization as HTMLSerialization
# from tiddlyweb.model.tiddler import Tiddler

class Serialization(HTMLSerialization):

  def __init__(self, environ=None):
    print "hi"

  def tiddler_as(self, tiddler):
    return "woohoo " + tiddler.title

def init(config):
  config['extension_types']['trail'] = 'application/trail'
  config['serializers']['application/trail'] = ['trail', 'text/html; charset=UTF-8']
