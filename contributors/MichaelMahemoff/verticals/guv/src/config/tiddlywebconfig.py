config = {
  'secret': 'bc4jr4jnckn93e9rdeoxjxdosh06550ee4fd943c',
  'server_store': ['devtext', {'store_root': 'store'}],
  'auth_systems': [
      'ldap'
  ],
  'twanager_plugins': ['migrate'],
  'system_plugins': ['methodhack', 'tiddlywebwiki', 'atomplugin'], #, 'status'],
  'log_level': 'DEBUG',
  'target_store': ['text', {'store_root': 'textstore'}, 'migrate']
  # 'server_prefix': '/guv'
  # 'server_host':{
      # 'scheme': 'http',
      # 'host': 'tiddlyguv.softwareas.com',
      # 'port': '80',
  # }
}
