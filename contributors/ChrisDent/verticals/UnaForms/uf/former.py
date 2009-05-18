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
from tiddlyweb.web.util import server_base_url

CONFIG_TIDDLER = 'unaformsSetDefaultBagPlugin'
SYSTEM_BAG = 'system'


@do_html()
@entitle('Available Forms')
@require_role('ADMIN')
def forms(environ, start_response):
    """
    List the available forms to the web.
    """
    store = environ['tiddlyweb.store']
    forms = _read_form_recipes(store)
    bags = _read_bags_for_forms(store, forms)
    template = template_env.get_template('forms.html')
    return template.generate(forms=forms, bags=bags)


def form(environ, start_response):
    """
    Produce this named form to the web.
    """
    store = environ['tiddlyweb.store']
    bag_id = environ['wsgiorg.routing_args'][1]['formid']
    recipe_id, uuid = bag_id.rsplit('.', 1)
    logging.debug('getting form with bag %s using recipe %s' % (bag_id, recipe_id))

    bag = store.get(Bag(bag_id))
    _process_config_tiddler(store, bag)
    recipe = store.get(Recipe(recipe_id))
    base_tiddlers = control.get_tiddlers_from_recipe(recipe)
    # read the bag (again) to make sure we have all the tiddlers
    bag = store.get(bag)
    data_tiddlers = bag.list_tiddlers()
    tiddlers = base_tiddlers + data_tiddlers
    tmp_bag = Bag('tmp', tmpbag=True)
    for tiddler in tiddlers:
        store.get(tiddler)
        tmp_bag.add_tiddler(tiddler)
    logging.debug(['%s:%s' % (tiddler.bag, tiddler.title) for tiddler in tmp_bag.list_tiddlers()])
    environ['tiddlyweb.type'] = 'text/x-tiddlywiki'
    return send_tiddlers(environ, start_response, tmp_bag)


@do_html()
@entitle('Created URL')
@require_role('ADMIN')
def instancer(environ, start_response):
    store = environ['tiddlyweb.store']
    recipe_id = environ['tiddlyweb.query']['submit'][0]
    bag_id = recipe_id + '.' + str(uuid())
    ensure_bag(bag_id, store)
    template = template_env.get_template('instance.html')
    return template.generate(recipe=recipe_id, url=_url_from_bag_id(environ, bag_id))


def _url_from_bag_id(environ, bag_id):
    return server_base_url(environ) + '/forms/' + bag_id


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


def init(config):
    if 'selector' in config:
        config['selector'].add('/forms[/]', GET=forms, POST=instancer)
        config['selector'].add('/forms/{formid:segment}', GET=form)
        # we need to disable bags, for security purposes
        for index, (regex, handler) in enumerate(config['selector'].mappings):
            if regex.match('/bags') is not None:
                del config['selector'].mappings[index]
                break


def _read_bags_for_forms(store, forms):
    bag_data = {}
    all_bags = store.list_bags()
    for recipe in forms:
        bag_data[recipe.name] = [bag for bag in all_bags if bag.name.startswith(recipe.name)]
    return bag_data


def _read_form_recipes(store):
    return [recipe for recipe in store.list_recipes() if recipe.name.startswith('form.')]


