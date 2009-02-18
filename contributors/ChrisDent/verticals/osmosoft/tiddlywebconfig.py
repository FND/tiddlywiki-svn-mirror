# A default config, make your own changes here.
config = {
    'secret': '0e45a778ae3a45d05c04c2930467aa261b1a6c5d',
    'server_prefix': '/wiki',
    'server_host': {
        'scheme': 'http',
        'host': 'labs.osmosoft.com',
        'port': '80',
    },
    'debug_level': 'DEBUG',
    'system_plugins': ['logout', 'cachinghoster'],
    'css_uri': 'http://peermore.com/tiddlyweb.css',
    'extension_types': {
        'atom': 'application/atom+xml',
        },
    'serializers': {
        'application/atom+xml': ['atom.atom', 'application/atom+xml; charset=UTF-8'],
        'text/html': ['atom.htmlatom', 'text/html; charset=UTF-8'],
        },
}
