"""
Setup.py for tiddlyweb-plugins
"""

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

VERSION = 0.6

setup(name = 'tiddlywebplugins',
        version = VERSION,
        description = 'Tools and methods for managing TiddlyWeb plugins',
        author = 'Chris Dent',
        author_email = 'cdent@peermore.com',
        url = 'http://svn.tiddlywiki.org/Trunk/association/serversides/tiddlyweb/plugins',
        packages = ['tiddlywebplugins'],
        platforms = 'Posix; MacOS X; Windows',
        install_requires = ['tiddlyweb'],
        )




