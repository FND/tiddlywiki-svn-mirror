"""
Present forms at a good address.
"""

import Cookie
import sys
import time
import yaml

from jinja2 import Environment, FileSystemLoader
template_env = Environment(loader=FileSystemLoader('templates'))

from uuid import uuid4 as uuid

from twplugins import do_html, entitle, require_role

from tiddlyweb.manage import make_command
from tiddlyweb.web.handler.recipe import get_tiddlers
from tiddlyweb.web.handler.tiddler import get as get_tiddler

YAML_DB = 'formdb.yaml'
HELP_BAG = 'admin'
HELP_TIDDLER = 'help'

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


@do_html()
@entitle('Available Forms')
@require_role('ADMIN')
def forms(environ, start_response):
    """
    List the available forms to the web.
    """
    form_ids = _read_db().keys()
    template = template_env.get_template('forms.html')
    return template.generate(form_ids=form_ids)


def form(environ, start_response):
    """
    Produce this named form to the web.
    """
    form_id = environ['wsgiorg.routing_args'][1]['formid']
    recipe = _read_db()[form_id]
    environ['wsgiorg.routing_args'][1]['recipe_name'] = recipe
    return get_tiddlers(environ, start_response)

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
