import os
import json
config = {
    'debug_level': 'DEBUG',
    'secret': 'bc483adf6e27220b50de493ab0a6550ee4fd943c',
    'system_plugins': ['static', 'methodhack', 'pathinfohack', 'trails', 'trail'],
    'twanager_plugins': ['wserver'],
    'server_store': ['simpletext', {'store_root': 'store'}],
    'static_dir': 'static',
    'server_prefix': '/comments',
    'server_host':{
        'scheme': 'http',
        'host': 'comments.boz',
        'port': '8080',
    }
}
