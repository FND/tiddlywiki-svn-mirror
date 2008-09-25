"""
A very simple bookmarking application that uses
TiddlyWeb as its datastore. This version is built
to work under googleappengine, but that's not 
really a requirement.

To run this we must add to urls.map:

# a fun little interface to do bookmarks
/twoter
    GET twoter:base

/twoter/{username:segment}
    GET twoter:user
    POST twoter:submit

And put user.html and bookmarklet.html in the
apps working dir.

There's a version of this running at

   http://tiddlyweb.appspot.com/twoter

It is _riddled_ with bugs.
"""

import urllib
import logging
import cgi

import os
from google.appengine.ext.webapp import template


from tiddlyweb.auth import UserRequiredError
from tiddlyweb.web.http import HTTP302
from tiddlyweb.web.util import server_base_url, recipe_url

from tiddlyweb.store import NoRecipeError, NoBagError
from tiddlyweb.recipe import Recipe
from tiddlyweb.bag import Bag, Policy
from tiddlyweb.tiddler import Tiddler

from tiddlyweb import control

def base(environ, start_response):
    """
    Where a user comes to /twoter redirect to 
    their own location, or if they aren't logged
    in, have them log in.
    """
    user = environ['tiddlyweb.usersign']['name']
    if user == 'GUEST':
        raise UserRequiredError, 'real user required to twote'
    else:
        raise HTTP302, '%s/twoter/%s' % (server_base_url(environ), urllib.quote(user))

def user(environ, start_response):
    """
    Display an information page for the user. If they are not
    logged in, have them log in.
    """
    user = environ['tiddlyweb.usersign']['name']
    if user == 'GUEST':
        raise UserRequiredError, 'real user required to twote'

    recent_recipe = _check_recipe('recent', environ, user)
    all_recipe = _check_recipe('all', environ, user)

    template_values = {
            'user': user,
            'recent_url': '%s/tiddlers?filter=[sort[-modified]]' % recipe_url(environ, recent_recipe),
            'all_url': '%s/tiddlers?filter=[sort[-modified]]' % recipe_url(environ, all_recipe),
            }

    environ['tiddlyweb.title'] = 'Twoter for %s' % user

    start_response('200 OK', [
        ('Content-Type', 'text/html')
        ])
    path = os.path.join(os.path.dirname(__file__), 'user.html')
    return [template.render(path, template_values)]

def submit(environ, start_response):
    """
    Take POSTed input, put it in a Tiddler and save
    it into the store, and redirect back to the user
    page.
    """
    user = environ['tiddlyweb.usersign']['name']
    if user == 'GUEST':
        raise UserRequiredError, 'real user required to twote'

    all_recipe = _check_recipe('all', environ, user)

    length = environ['CONTENT_LENGTH']
    content = environ['wsgi.input'].read(int(length))

    posted_data = cgi.parse_qs(content)
    title = posted_data.get('title', [''])[0]
    url = posted_data.get('url', [''])[0]
    snip = posted_data.get('snip', [''])[0]

    tiddler_title = title.replace('.', '_')
    tiddler = Tiddler(tiddler_title)
    tiddler.tags = [u'twoted']
    tiddler.modifier = user
    tiddler.text = '[[%s|%s]]\n\n%s' % (title, url, snip)

    bag = control.determine_bag_for_tiddler(all_recipe, tiddler)
    tiddler.bag = bag.name

    store = environ['tiddlyweb.store']
    store.put(tiddler)

    raise HTTP302, '%s/twoter/%s' % (server_base_url(environ), urllib.quote(user))

def _check_recipe(name, environ, user):
    """
    Get the user's recipes, create them if required.
    """
    store = environ['tiddlyweb.store']

    recipe_name = '%s-%s' % (user, name)
    recipe_name = recipe_name.replace('.', '_')
    try:
        recipe = Recipe(recipe_name)
        store.get(recipe)
    except NoRecipeError:
        bag = _check_bag('all', environ, user)
        recipe.set_recipe([
            [u'TiddlyWeb', u''],
            [unicode(bag.name), unicode(_filter_string(name))],
            ])
        store.put(recipe)
    return recipe

def _check_bag(name, environ, user):
    """
    Get the user's bag. Create if required.
    """
    store = environ['tiddlyweb.store']

    name = '%s-%s' % (user, name)
    name = name.replace('.', '_')
    try:
        bag = Bag(name)
        store.get(bag)
    except NoBagError:
        policy = Policy(dict(read=[user], write=[user], delete=[user], create=[user]))
        bag.policy = policy
        store.put(bag)
    return bag

def _filter_string(name):
    if name == 'all':
        return '[sort[-modified]]'
    else:
        return '[sort[-modified]] [count[10]]'
