"""
make a room

creates a set of bags, and a recipe for specified company.

Requires a role of ADMIN

for more information, see blog post by Michael Mahemoff at http://softwareas.com/tiddlydocs-user-authentication-generic-design-and-custom-features
"""
from tiddlyweb.web.http import HTTP403
from cgi import FieldStorage
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.commands import _store
from tiddlyweb.serializer import Serializer



ALLOWED_ROLE='ADMIN'
BAGS=[
    ('config', '{"policy":{"read": ["R:GROUP", "R:ADMIN"], "create": ["R:ADMIN"], "manage": ["R:ADMIN"], "accept": ["NONE"], "write": ["R:GROUPADMIN", "R:ADMIN"], "owner": null, "delete": ["R:ADMIN"]}}'),
    ('comments', '{"policy":{"read": ["R:GROUP", "R:ADMIN"], "create": ["R:GROUP", "R:ADMIN"], "manage": ["R:ADMIN"], "accept": ["NONE"], "write": ["R:GROUPADMIN", "R:ADMIN"], "owner": null, "delete": ["R:ADMIN"]}}'),
    ('documents', '{"policy":{"read": ["R:GROUP", "R:ADMIN"], "create": ["R:GROUP", "R:ADMIN"], "manage": ["R:ADMIN"], "accept": ["NONE"], "write": ["R:GROUP", "R:ADMIN"], "owner": null, "delete": ["R:GROUP", "R:ADMIN"]}}')
    ]

recipe_content = [
    ["system",""],
    ["tdocs",""],
    ["documents",""]
]

def create_room_elements(room_name):
    for bag_type, policy in BAGS:
        bag_name = '%s_%s' % (room_name, bag_type)
        bag = Bag(bag_name)
        bag_policy = policy.replace('GROUP', room_name)
        _put(bag, bag_policy, 'json')
        recipe_content.append([bag_name, ''])
        
    recipe = Recipe(room_name)
    group_role = 'R:%s' % room_name
    recipe.policy.__dict__ = {
        'read': [group_role, 'R:ADMIN'],
        'create': [group_role, 'R:ADMIN'],
        'manage': ['R:ADMIN'],
        'accept': ['NONE'],
        'write': [group_role, 'R:ADMIN'],
        'owner': None,
        'delete': [group_role, 'R:ADMIN']
    }
    recipe.set_recipe(recipe_content)
    _store.put(recipe)

def set_form(environ):
    if environ['tiddlyweb.type'] == 'application/x-www-form-urlencoded':
        return environ['tiddlyweb.query']
    elif environ['tiddlyweb.type'] == 'multipart/form-data':
        return FieldStorage(fp=environ['wsgi.input'], environ=environ)
        
    return None

def make_room(environ, start_response):
    if ALLOWED_ROLE in environ['tiddlyweb.usersign']['roles']:
        form = set_form(environ)
        if form and 'room_name' in form:
            create_room_elements(form['room_name'])
            start_response('204 No Content',[('Location','/admin/addroom')])
            return []                                       
            
    raise HTTP403('You are not allowed to access this page')

def get_room_add(environ, start_response):
    if ALLOWED_ROLE in environ['tiddlyweb.usersign']['roles']:
        start_response('200 OK',[('Content-Type','text/html; charset=utf-8')])
        html="""<html>
        <head>
        <title>Add a Room</title>
        </head>
        <body>
        <h1>Add a Room</h1>
        <form action=%s/admin/addroom method="POST" />
    	Room Name: <input type="text" name="room_name" />
    	<input type="submit" />
    	</form>""" % environ['tiddlyweb.config']['server_prefix']
    else:
        raise HTTP403('You are not allowed to access this page')
        
    return html

def init(config):
    selector = config['selector']
    selector.add('/admin/addroom[/]', GET=get_room_add)
    selector.add('/admin/addroom[/]', POST=make_room)

def _put(entity, content, serialization):
    """
    Put entity to store, by serializing content
    using the named serialization.
    """
    serializer = Serializer(serialization)
    serializer.object = entity
    serializer.from_string(content)
    _store().put(entity)
