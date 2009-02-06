# A default config, make your own changes here.
config = {
    'secret': '0e45a778ae3a45d05c04c2930467aa261b1a6c5d',
    'server_host': {
        'scheme': 'http',
        'host': 'labs.osmosoft.com',
        'port': '80',
    },
    #'server_prefix': '/demo',
    'debug_level': 'DEBUG',
    #'system_plugins': ['logout', 'static', 'gzipper'],
    'system_plugins': ['static','logout', 'osmosoft'],
    'static_dir': 'images',
		'auth_systems': ['openid'],

}
