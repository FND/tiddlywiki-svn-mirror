import os
tiddlyweb_root = os.environ["TIDDLYWEB_ROOT"] + "/tiddlyweb"
config = {
  # 'server_store': ['text', {'store_root': 'store'}],
  'hostname': 'tiddlyguv.org',
  'server_prefix': '/demo',
  'server_store': ['simpletext', {'store_root': 'store'}],
  # 'urls_map': tiddlyweb_root + "/urls.map", 
  # 'base_tiddlywiki': tiddlyweb_root + "/empty.html",
  'extension_types': { 'atom': 'application/atom+xml' },
  'serializers': {
    'application/atom+xml': ['atom.atom', 'application/atom+xml; charset=UTF-8'],
    'text/html': ['atom.htmlatom', 'text/html; charset=UTF-8']
  }
}


