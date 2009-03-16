"""
Present forms at a good address.
"""

import Cookie
import logging
import sys
import time
import yaml

from jinja2 import Environment, FileSystemLoader
template_env = Environment(loader=FileSystemLoader('templates'))

from sha import sha
from uuid import uuid4 as uuid

from tiddlywebplugins import do_html, entitle, require_role, require_any_user, ensure_bag

from tiddlyweb import control
from tiddlyweb.manage import make_command
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.web.handler.recipe import get_tiddlers
from tiddlyweb.web.handler.tiddler import get as get_tiddler
from tiddlyweb.web.sendtiddlers import send_tiddlers

YAML_DB = 'formdb.yaml'
HELP_BAG = 'admin'
HELP_TIDDLER = 'help'
CONFIG_TIDDLER = 'TiddlyWebConfig'
SYSTEM_BAG = 'system'

@make_command()
def formform(args):
    """Establish a known form based on a recipe name. <recipe name>"""
    try:
        form_id = str(uuid())
        source_recipe = args[0]
        _update_db(form_id, source_recipe)
        print "form %s created using source %s" % (form_id, source_recipe)
    except ValueError:
        print >> sys.stderr, "one argument required: source_recipe"

@make_command()
def listforms(args):
    """List all the forms on the system."""
    # XXX match a pattern eventually
    forms = _read_db()
    template = template_env.get_template('forms.txt')
    print template.render(forms=forms)


@do_html()
@entitle('Available Forms')
@require_role('ADMIN')
def forms(environ, start_response):
    """
    List the available forms to the web.
    """
    forms = _read_db()
    template = template_env.get_template('forms.html')
    return template.generate(forms=forms)


@require_any_user()
def form(environ, start_response):
    """
    Produce this named form to the web.
    """
    form_id = environ['wsgiorg.routing_args'][1]['formid']
    recipe = _read_db()[form_id]
    logging.debug('getting form %s leading to recipe %s' % (form_id, recipe))
    store = environ['tiddlyweb.store']
    bag = _user_form_bag(store, environ['tiddlyweb.usersign']['name'], form_id)
    _process_config_tiddler(environ['tiddlyweb.store'], bag)
    recipe = Recipe(recipe)
    store.get(recipe)
    base_tiddlers = control.get_tiddlers_from_recipe(recipe)
    # read the bag (again) to make sure we have all the tiddlers
    store.get(bag)
    custom_tiddlers = bag.list_tiddlers()
    tiddlers = base_tiddlers + custom_tiddlers
    tmp_bag = Bag('tmp', tmpbag=True)
    for tiddler in tiddlers:
        store.get(tiddler)
        tmp_bag.add_tiddler(tiddler)
    environ['tiddlyweb.type'] = 'text/x-tiddlywiki'
    return send_tiddlers(environ, start_response, tmp_bag)


def _process_config_tiddler(store, bag):
    """
    If the user's bag does not have the config tiddler,
    copy the config tiddler from its known location,
    to the user's bag.
    """
    if not CONFIG_TIDDLER in [tiddler.title for tiddler in bag.list_tiddlers()]:
        logging.debug('copying %s into bag %s' % (CONFIG_TIDDLER, bag.name))
        config_tiddler = Tiddler(CONFIG_TIDDLER, SYSTEM_BAG)
        store.get(config_tiddler)
        config_tiddler.bag = bag.name
        store.put(config_tiddler)


def _user_form_bag(store, username, form_id):
    """
    Ensure a bag exists for this user's use of this form.
    """
    policy_dict = {
            'read': [username, 'R:ADMIN'],
            'write': [username, 'R:ADMIN'],
            'create': [username, 'R:ADMIN'],
            'delete': [username, 'R:ADMIN'],
            }
    name = sha(form_id + username).hexdigest()
    return ensure_bag(name, store, policy_dict=policy_dict, owner=username)


def help(environ, start_response):
    """
    Show some help at a convenient URL by setting up a request.
    """
    environ['wsgiorg.routing_args'][1]['bag_name'] = HELP_BAG
    environ['wsgiorg.routing_args'][1]['tiddler_name'] = HELP_TIDDLER
    return get_tiddler(environ, start_response)


def logout(environ, start_response):
    """
    Break the web by allowing a logout on a GET request.
    And then break it further by sending a bad redirect.
    """
    uri='/'
    cookie = Cookie.SimpleCookie()
    cookie['tiddlyweb_user'] = ''
    cookie['tiddlyweb_user']['path'] = '/'
    cookie['tiddlyweb_user']['expires'] = '%s' % (time.ctime(time.time()-6000))
    start_response('303 See Other', [
        ('Set-Cookie', cookie.output(header='')),
        ('Location', uri)
        ])
    return [uri]


def init(config):
    if 'selector' in config:
        config['selector'].add('/forms', GET=forms)
        config['selector'].add('/forms/{formid:segment}', GET=form)
        config['selector'].add('/help', GET=help)
        config['selector'].add('/logout', GET=logout)

def _update_db(form_id, source_recipe):
    """
    Update the yaml file, pairing a form_id with a source_recipe.
    """
    # XXX locking!
    forms = _read_db()
    forms[form_id] = source_recipe
    yaml.dump(forms, open(YAML_DB, 'w'), default_flow_style=False)


def _read_db():
    """
    Read the db into a dict.
    """
    try:
        return yaml.load(open(YAML_DB))
    except IOError:
        return {}


