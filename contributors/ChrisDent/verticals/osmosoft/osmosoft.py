"""
Quick plugin to replace what's at /
with a redirect to useful stuff.
"""


import logging

from twplugins import replace_handler
from tiddlyweb.web.handler.recipe import get_tiddlers


EDITOR_ROLE = 'osmo'
EDITOR_RECIPE = 'editor'
DEFAULT_RECIPE = 'osmosoft'

def osmo_home(environ, start_response):
    """
    If we have a user with role osmo,
    go one place, otherwise go another,
    by way of recipe injection.
    """
    recipe_name = DEFAULT_RECIPE
    if EDITOR_ROLE in environ['tiddlyweb.usersign'].get('roles', []):
        recipe_name = EDITOR_RECIPE
    environ['wsgiorg.routing_args'][1]['recipe_name'] = recipe_name
    environ['tiddlyweb.type'] = 'text/x-tiddlywiki'
    return get_tiddlers(environ, start_response)


def init(config):
    replace_handler(config['selector'], '/', dict(GET=osmo_home))
