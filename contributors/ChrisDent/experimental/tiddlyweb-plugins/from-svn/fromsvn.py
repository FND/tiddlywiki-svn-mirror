#!/usr/bin/env python

"""
A plugin for retrieving tiddlers, plugins or full recipes
from the TiddlyWiki subversion repository. Provide the
name of one bag and one or more urls on the command line.

Example:

   manager from_svn bag0 http://tiddly-svn.dyndns.org/Trunk/verticals/stunplugged/index.html.recipe

To turn on the plugin you need to add to the current
tiddlywebconfig.py:

    manager_plugins: ['fromsvn']

If the url is a recipe it will be parsed for lines beginning
with recipe: or tiddler.

If recipe, that recipe is retrieved and recursively parsed.

If tiddler, if the end of the URL is js, then get the .js
and .js.meta files, massage them, join them together, make
a tiddler, and put it in the store.

Otherwise assume we have a tiddler in the <div> format
and use the importer to import it.
"""

import sys
import httplib2
from urlparse import urljoin

from BeautifulSoup import BeautifulSoup

from tiddlyweb.manage import make_command

from tiddlyweb.store import Store
from tiddlyweb.serializer import Serializer
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.importer import _do_tiddler


class HTTPProblem(Exception):
    pass


@make_command()
def from_svn(args):
    """Import one or more plugins, tiddlers or recipes from tiddlywiki subversion."""
    bag = args[0]
    urls = args[1:]
    if not bag:
        raise ValueError('you must provide the name of a bag')
    if not urls:
        raise ValueError('you must provide at least one url')
    import_list(bag, urls)

def import_list(bag, urls):
    for url in urls:
        import_one(bag, url)


def import_one(bag, url):
    print >> sys.stderr, "handling %s" % url
    if url.endswith('.recipe'):
        import_via_recipe(bag, url)
    elif url.endswith('.js'):
        import_plugin(bag, url)
    else:
        import_tiddler(bag, url)


def import_via_recipe(bag, url):
    recipe = get_url(url)
    rules = [line for line in recipe.split('\n') if line.startswith('tiddler:') or line.startswith('recipe:')]
    for rule in rules:
        type, target = rule.split(':', 2)
        target = target.lstrip().rstrip()
        target_url = urljoin(url, target)
        import_one(bag, target_url)


def import_tiddler(bag, url):
    content = get_url(url)
    tiddler = BeautifulSoup(content).find('div')
    store = Store(config['server_store'][0], {'tiddlyweb.config': config})
    _do_tiddler(bag, tiddler, store)


def get_url(url):
    http = httplib2.Http()
    response, content = http.request(url, method='GET')
    if response.status != 200:
        raise HTTPProblem
    return unicode(content, 'utf-8')


def import_plugin(bag, url):
    meta_url = '%s.meta' % url
    plugin_content = get_url(url)
    meta_content = get_url(meta_url)

    title = [line for line in meta_content.split('\n') if line.startswith('title:')][0]
    title = title.split(':', 2)[1].lstrip().rstrip()
    tiddler_meta = '\n'.join([line for line in meta_content.split('\n') if not line.startswith('title:')])

    tiddler_meta.rstrip()
    tiddler_text = '%s\n\n%s' % (tiddler_meta, plugin_content)

    tiddler = Tiddler(title, bag)
    serializer = Serializer('text')
    serializer.object = tiddler
    serializer.from_string(tiddler_text)

    store = Store(config['server_store'][0], {'tiddlyweb.config': config})
    store.put(tiddler)


def init(config_in):
    global config
    config = config_in

# if __name__ == '__main__':
#     bag = sys.argv.pop(1)
#     urls = sys.argv[1:]
#     import_list(bag, urls)
