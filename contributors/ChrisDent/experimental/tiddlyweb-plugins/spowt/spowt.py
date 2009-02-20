
import cgi
import urllib

from jinja2 import Environment, FileSystemLoader

from tiddlyweb.web.http import HTTP302, HTTP409
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.user import User
from tiddlyweb.store import NoUserError, NoRecipeError, NoBagError
from tiddlyweb.model.policy import ForbiddenError, UserRequiredError
from tiddlyweb.web.util import server_base_url, recipe_url

TIDDLYWEB_BAG = 'tiddlyweb'

template_env = Environment(loader=FileSystemLoader('.'))

def spowt(environ, start_response):
    username = environ['tiddlyweb.usersign']['name']
    if username == 'GUEST':
        start_response('200 OK', [('Content-Type', 'text/html')])
        template = template_env.get_template('root.html')
        environ['tiddlyweb.title'] = 'Welcome to Spowt'
        return template.generate()
    else:
        raise HTTP302('%s/spowt/%s' % (server_base_url(environ), urllib.quote(username)))


def new_wiki(environ, start_response):
    username = environ['tiddlyweb.usersign']['name']
    if username == 'GUEST':
        raise UserRequiredError

    store = environ['tiddlyweb.store']

    length = environ['CONTENT_LENGTH']
    content = environ['wsgi.input'].read(int(length))
    wikiname = cgi.parse_qs(content).get('wikiname', [''])[0]
    perms = cgi.parse_qs(content).get('perms', [''])[0]

    if wikiname:
        bag = Bag(wikiname)
        try:
            bag = store.get(bag)
            raise HTTP409('The bag already exists')
        except NoBagError:
            bag.desc = 'hello'
            bag.policy.owner = username
            bag.policy.manage = [username]
            if perms == 'closed':
                bag.policy.read = [username]
                bag.policy.write = [username]
                bag.policy.create = [username]
                bag.policy.delete = [username]
            if perms == 'authrw':
                bag.policy.read = ['ANY']
                bag.policy.write = ['ANY']
                bag.policy.create = ['ANY']
                bag.policy.delete = ['ANY']
            if perms == 'read':
                bag.policy.write = [username]
                bag.policy.create = [username]
                bag.policy.delete = [username]
            if perms == 'authw':
                bag.policy.write = ['ANY']
                bag.policy.create = ['ANY']
                bag.policy.delete = ['ANY']
            store.put(bag)

        recipe = Recipe(wikiname)
        try:
            recipe = store.get(recipe)
            raise HTTP409('That recipe already exists')
        except NoRecipeError:
            recipe.desc = 'hello'
            recipe.policy.owner = username
            recipe.policy.manage = [username]
            recipe.set_recipe([[TIDDLYWEB_BAG, ''], [bag.name, '']])
            store.put(recipe)

        user = User(username)
        note = ''
        try:
            user = store.get(user)
            note = user.note
        except NoUserError:
            pass

        note += '%s\n' % wikiname

        user.note = note
        store.put(user)

        raise HTTP302('%s/spowt/%s' % (server_base_url(environ), urllib.quote(username)))
    else:
        raise HTTP409('Missing form data')


def userpage(environ, start_response):
    username = environ['tiddlyweb.usersign']['name']
    user = environ['wsgiorg.routing_args'][1]['user']
    if username != user:
        #raise ForbiddenError
        raise UserRequiredError

    store = environ['tiddlyweb.store']
    user_data = User(user)
    try:
        user_data = store.get(user_data)
        wikinames = user_data.note.split('\n')

        wikis = []
        if wikinames:
            for name in wikinames:
                if not len(name):
                    continue
                recipe = Recipe(name)
                recipe = store.get(recipe)
                url = recipe_url(environ, recipe)
                wikis.append(dict(
                    name=name,
                    url=url,
                    description=recipe.desc))
    except NoUserError:
        wikis = []

    start_response('200 OK', [('Content-Type', 'text/html')])
    environ['tiddlyweb.title'] = 'Hello %s' % user
    template = template_env.get_template('user.html')
    return template.generate(wikis=wikis)


def root(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/html')])
    return ["hello"]


def replace_handler(selector, path, new_handler):
    for index, (regex, handler) in enumerate(selector.mappings):
        if regex.match(path) is not None:
            selector.mappings[index] = (regex, new_handler)


def init(config):
    #replace_handler(config['selector'], '/', dict(GET=spowt))
    config['selector'].add('/spowt', GET=spowt, POST=new_wiki)
    config['selector'].add('/spowt/{user:segment}', GET=userpage)
