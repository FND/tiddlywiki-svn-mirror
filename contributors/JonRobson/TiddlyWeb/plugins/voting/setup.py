# YOU NEED TO EDIT THESE
AUTHOR = 'Jon Robson'
AUTHOR_EMAIL = 'jdlrobson@gmail.com'
NAME = 'tiddlywebplugins.voting'
DESCRIPTION = ''
VERSION = '0.4'

import os
from setuptools import setup, find_packages


setup(
    namespace_packages = ['tiddlywebplugins'],
    name = NAME,
    version = VERSION,
    description = DESCRIPTION,
    long_description = open(os.path.join(os.path.dirname(__file__), 'README')).read(),
    author = AUTHOR,
    author_email = AUTHOR_EMAIL,
    url = 'http://pypi.python.org/pypi/%s' % NAME,
    packages = find_packages(exclude=['test']),
    platforms = 'Posix; MacOS X; Windows',
    install_requires = ['setuptools', 'tiddlyweb','tiddlyweb.test'],
    zip_safe = False
    )
