"""
This is a sample TiddlyWeb configuration override file.

This particular configuration adds support for atom feed
serializations with links in the HTML serialization to those
feeds (so browsers will show chicklets for feeds).

To use, rename this file to tiddlywebconfig.py and place it
in the same directory from which you are starting the server 
and start the server. tiddlyweb.config will be read and itself
read tiddlywebconfig.py, merging in its information.
"""
config = {
        'extension_types': {
            'cake': 'cake/x-fudge',
            },
        'serializers': {
            'cake/x-fudge': ['cake.cake', 'image/jpeg'],
            },
        }
