"""
Quick plugin to replace what's at /
with a redirect to useful stuff.

Includes some interesting cache handling:

This is an interesting (I think) example of some HTTP, WSGI and
Python, and filesystem fun:

1 When a wiki is generated from the store, a static copy of
  the wiki is dumped to disk, using its generated Etag as
  the filename. A symlink from the recipe name to the etag
  filename is made.

2 When an incoming request comes in, if it has an If-None-Match
  header (which will contain the Etag) we look on the disk for
  a file with that name. If it is there, we respond with an
  HTTP 304, and no response body: no data is sent, the browser
  knows to use what it has in cache.

3 If there is no If-None-Match header, we look on disk for a
  file named with the recipe we are looking for. If this is
  there we read it to get its content and determine the name of
  the file to which it is symlinked. We send out the static content
  from disk, and the etag filename (so future requests from the
  same browser will send the If-None-Match header).

4 If there's nothing matching in the cache dir, then we call
  into the normal TiddlyWeb code to generate the wiki. We do a
  bit of finagling to trap the Etag that gets generated. Before
  we send the content out to the browser, we do step 1 above.

5 The StorageInterface provides a tiddler_written() hook that
  gets called any time a Tiddler is written to the store. We
  override that code so that we flush the entire contents of
  the cache whenever a Tiddler is updated, requiring the
  cache to rebuild itself on the next request.

6 Because we never actually read from the etag filename, only
  the symlinked filey, and we only ever make the symlink to the
  etag file after it is fully written, we should avoid the
  situation where we read a partially written file from cache.

For some other time: This code needs more testing and better comments
to explain why it is doing what it is doing.
"""


import logging
import os

from twplugins import replace_handler
from tiddlyweb.web.handler.recipe import get_tiddlers
from tiddlyweb.web.http import HTTP304


import tiddlyweb.stores.text

DEFAULT_RECIPE = 'osmosoft'
EDITOR_RECIPE = 'editor'
EDITOR_ROLE = 'osmo'
WIKI_CACHE_DIR = '.wiki_cache'


def osmo_home(environ, start_response):
    """
    If we have a user with role osmo,
    go one place, otherwise go another,
    by way of recipe injection.
    """
    recipe_name = DEFAULT_RECIPE
    if EDITOR_ROLE in environ['tiddlyweb.usersign'].get('roles', []):
        recipe_name = EDITOR_RECIPE

    if_none_match = environ.get('HTTP_IF_NONE_MATCH', None)
    saved_headers = {}
    def our_start_response(status, headers, exc_info=None):
        etag = _header_value(headers, 'etag')
        saved_headers['etag'] = etag
        logging.debug('response has etag of %s' % etag)
        start_response(status, headers)

    try:
        _validate_cache(if_none_match)
        output, out_etag = _read_cache(recipe_name)
        start_response('200', [
            ('Content-Type', 'text/html; charset=UTF-8'),
            ('Etag', out_etag),
            ])
    except IOError, exc:
        logging.debug('cache miss for %s: %s' % (recipe_name, exc))
        environ['wsgiorg.routing_args'][1]['recipe_name'] = recipe_name
        environ['tiddlyweb.type'] = 'text/x-tiddlywiki'
        output = get_tiddlers(environ, our_start_response)
        _write_cache(recipe_name, saved_headers.get('etag', None), output)
    return output


def tiddler_written_handler(self, tiddler):
    try:
        logging.debug('attempting to unlink cache')
        [os.unlink(os.path.join(WIKI_CACHE_DIR, file)) for file in
                os.listdir(WIKI_CACHE_DIR) if not file.startswith('.')]
    except IOError, exc:
        logging.warn('unable to unlink in %s: %s' % (WIKI_CACHE_DIR, exc))

tiddlyweb.stores.text.tiddler_written = tiddler_written_handler


def init(config):
    try:
        os.mkdir(WIKI_CACHE_DIR)
    except OSError, exc:
        logging.warn('unable to create %s: %s' % (WIKI_CACHE_DIR, exc))
    replace_handler(config['selector'], '/', dict(GET=osmo_home))


def _header_value(headers, name):
    name = name.lower()
    try:
        found_value = [value for header,value in headers if header.lower() == name][0]
    except IndexError:
        found_value = None
    return found_value


def _validate_cache(etag):
    if not etag:
        return
    path = os.path.join(WIKI_CACHE_DIR, etag)
    logging.debug('attempting to validate %s' % path)
    if os.path.exists(path):
        logging.debug('validated %s' % etag)
        raise HTTP304(etag)
    

def _read_cache(name):
    logging.debug('attempt to read %s from cache' % name)
    path = os.path.join(WIKI_CACHE_DIR, name)
    real_path = os.path.basename(os.path.realpath(path))
    return open(os.path.join(WIKI_CACHE_DIR, name)).readlines(), real_path


def _write_cache(name, etag, output):
    etag_filename = os.path.join(WIKI_CACHE_DIR, etag)
    link_filename = os.path.join(WIKI_CACHE_DIR, name)
    file = open(etag_filename, 'w')
    content = ''.join(output)
    file.write(content.encode('UTF-8'))
    file.close()
    logging.debug('attempt to write %s to cache' % name)
    os.symlink(os.path.abspath(etag_filename), os.path.abspath(link_filename))
