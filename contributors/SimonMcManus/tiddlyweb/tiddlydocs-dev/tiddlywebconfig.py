config = {
    'system_plugins': ['tiddlywebwiki', 'static'],
    'secret': '7d72e845d6ba23821a76c6ff3d7d3be17220a409',
    'twanager_plugins': ['tiddlywebwiki'],
    'log_level':'DEBUG',
    'wikklytext.safe_mode': False,
 	'static_url_dir': 'doccollab/static',
    'server_host' : {
       'scheme' : 'http',
        'host' : '127.0.0.1',
        'port' : '8081'
   },
   'server_store': ['devstore', { 'store_root': 'devstore' }],
   'instance_tiddlers': [
       ('tiddlydocs_core', ['../../../../verticals/tiddlydocs/index.html.recipe']),
       ('system', ['../../../../verticals/TiddlyWebWiki/plugins.recipe']),
       ('common', [])
   ],
   'log_level': 'DEBUG',
	'tiddlyeditor_recipe':[
	        ['tdocs',''],
	        ['system','']
	]
}


	