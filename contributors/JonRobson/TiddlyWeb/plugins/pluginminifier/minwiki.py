from pluginminifier import jsmin
from tiddlywebwiki.serialization import Serialization as Wiki
class Serialization(Wiki):
    def list_tiddlers(self,bag):
      for tiddler in bag.tiddlers:
        if "systemConfig" in tiddler.tags:
          tiddler.text= jsmin(tiddler.text)
          if not "minified" in tiddler.tags:
            tiddler.tags.append("minified")
          
      return Wiki.list_tiddlers(self,bag)
