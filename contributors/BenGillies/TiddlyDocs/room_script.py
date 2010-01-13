"""
make a room

creates a set of bags, and a recipe for specified company.

Requires a role of ADMIN

for more information, see blog post by Michael Mahemoff at http://softwareas.com/tiddlydocs-user-authentication-generic-design-and-custom-features
"""
from space import Space

from tiddlyweb.web.http import HTTP403
from cgi import FieldStorage
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.manage import make_command
from tiddlyweb.store import Store
import simplejson as json

ROOM = """{
    "bags": {
        "ROOMNAME_config": {
            "policy": {
                "read": ["R:ROOMNAME", "R:ADMIN"],
                "create": ["R:ADMIN"],
                "manage": ["R:ADMIN"],
                "accept": ["NONE"],
                "owner": null,
                "write": ["R:ROOMNAMEADMIN", "R:ADMIN"],
                "delete": ["R:ADMIN"]
            }
        },
        "ROOMNAME_comments": {
            "policy": {
                "read": ["R:ROOMNAME", "R:ADMIN"],
                "create": ["R:ROOMNAME", "R:ADMIN"],
                "manage": ["R:ADMIN"],
                "accept": ["NONE"],
                "owner": null,
                "write": ["R:ROOMNAMEADMIN", "R:ADMIN"],
                "delete": ["R:ADMIN"]
            }
        },
        "ROOMNAME_documents": {
            "policy": {
                "read": ["R:ROOMNAME", "R:ADMIN"],
                "create": ["R:ROOMNAME", "R:ADMIN"],
                "manage": ["R:ADMIN"],
                "accept": ["NONE"],
                "owner": null,
                "write": ["R:ROOMNAME", "R:ADMIN"],
                "delete": ["R:ROOMNAME", "R:ADMIN"]
            }
        }
    },
    "recipes": {
        "ROOMNAME": {
            "recipe": [
                ["system", ""],
                ["tdocs", ""],
                ["documents", ""],
                ["ROOMNAME_config", ""],
                ["ROOMNAME_comments", ""],
                ["ROOMNAME_documents", ""]
            ],
            "policy": {
                "read": ["R:ROOMNAME", "R:ADMIN"],
                "create": ["R:ROOMNAME", "R:ADMIN"],
                "manage": ["R:ADMIN"],
                "accept": ["NONE"],
                "owner": null,
                "write": ["R:ROOMNAME", "R:ADMIN"],
                "delete": ["R:ROOMNAME", "R:ADMIN"]
            }
        }
    }
}"""

ALLOWED_ROLE='ADMIN'

@make_command()
def create_room(args):
    """make a room. <room_name>"""
    create_room_elements(args[0])

def create_room_elements(room_name):
    room_space = Space({'tiddlyweb.store': store})
    
    this_room = ROOM.replace('ROOMNAME', room_name)
    
    this_room = json.loads(this_room)
    
    room_space.create_space(this_room)
    

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
            create_room_elements(form['room_name'][0])
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
    if 'selector' in config:
        selector = config['selector']
        selector.add('/admin/addroom[/]', dict(GET=get_room_add, POST=make_room))
        
    def _store():
        return Store(config['server_store'][0],
            config['server_store'][1],
            environ={'tiddlyweb.config': config})
    
    global store
    store = _store()