# A default config, make your own changes here.
config = {
    'secret': 'f1348429e0b12eb24bc2f63688a30ead59e7160a',
    'log_level': 'DEBUG',
    'stats':{
        "increment":{
          "allowed":["ideas/*/points"]
        }
    },
    'system_plugins': ['atomplugin','static','jinjaFilters','tiddlywebwiki','logout','stats','ideas_staticpages', 'tagCloud', 'form'],
    'twanager_plugins': ['get_mail','static','tiddlywebwiki'],
    'static_dir': 'static',
    'server_prefix': '/ideas',
    'server_host': {
        'scheme': 'http',
        'host': 'localhost',
        'port': '8080'
    },
    'css_uri':'/ilga/static/css/main_stylesheet.css'

    
}
