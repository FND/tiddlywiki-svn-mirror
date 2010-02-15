config = {
    'system_plugins': ['tiddlywebplugins.tiddlydocs', 'tiddlywebplugins.static', 'tiddlyeditor_plus', 'gadget', 'html_validator', 'tiddlywiki_validator'],
    'secret': '7d72e845d6ba23821a76c6ff3d7d3be17220a409',
    'twanager_plugins': ['tiddlywebwiki'],
    'log_level':'DEBUG',
	'reserved_bag_names': ['tdocs', 'system'],
    'wikklytext.safe_mode': False,
 	'static_url_dir': 'doccollab/static',
    'server_host' : {
       'scheme' : 'http',
        'host' : '127.0.0.1',
        'port' : '8081'
   },
	'tiddlyeditor_recipe':[
	        ['tdocs',''],
	        ['system','']
	]
}
