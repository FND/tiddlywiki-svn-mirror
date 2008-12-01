"""
Present forms at a good address.
"""

import sys
import yaml

from jinja2 import Environment, FileSystemLoader
template_env = Environment(loader=FileSystemLoader('templates'))

from twplugins import do_html, entitle

from tiddlyweb.manage import make_command
from tiddlyweb.web.handler.recipe import get_tiddlers

YAML_DB = 'formdb.yaml'

@make_command()
def formform(args):
    """Establish a known form based on something or other."""
    try:
        form_id, source_recipe = args[0:]
        _update_db(form_id, source_recipe)
        print "form %s created using source %s" % (form_id, source_recipe)
    except ValueError:
        print >> sys.stderr, "two arguments required: form id and source_recipe"

@make_command()
def listforms(args):
    """List all the forms on the system."""
    # XXX match a pattern eventually
    print _read_db()


def _update_db(form_id, source_recipe):
    """
    Update the yaml file, pairing a form_id with a source_recipe.
    """
    # XXX locking!
    forms = _read_db()
    forms[form_id] = source_recipe
    yaml.dump(forms, open(YAML_DB, 'w'))


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


def init(config):
    config['selector'].add('/forms', GET=forms)
    config['selector'].add('/forms/{formid:segment}', GET=form)

