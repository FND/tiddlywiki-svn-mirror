"""
Provides a Serializer to transform HTML form-data into an object that can be
put into the store.

Also adds POST support to the standard set of URLs
"""

from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.bag import Bag
from tiddlyweb.web.handler.tiddler import \
        _determine_tiddler, _check_bag_constraint, _validate_tiddler_headers, _validate_tiddler_content, _tiddler_etag
from tiddlyweb.store import \
        NoTiddlerError, NoBagError, NoRecipeError, StoreMethodNotImplemented
from tiddlyweb.serializer import Serializer, TiddlerFormatError
from tiddlyweb.serializations import SerializationInterface 
from tiddlyweb.web.http import \
        HTTP404, HTTP415, HTTP412, HTTP409, HTTP400, HTTP304
from tiddlyweb import control
from tiddlyweb.web import util as web
from tiddlyweb.model.policy import PermissionsError
from cgi import FieldStorage
import re
import urllib
from uuid import uuid4

def set_form(environ):
    if environ['tiddlyweb.type'] == 'application/x-www-form-urlencoded':
        return environ['tiddlyweb.query']
    elif environ['tiddlyweb.type'] == 'multipart/form-data':
        return FieldStorage(fp=environ['wsgi.input'], environ=environ)
        
    return None
    
def retrieve_item(obj, key): 
    if type(obj) == FieldStorage:
        return obj.getfirst(key)
    else:
        return obj[key][0]

def post_tiddler_to_container(environ, start_response):
    """
    we have included the tiddler name in the form,
    so get that and carry on as normal
    """
    form = set_form(environ)
    if 'file' in form:
        tiddler_name = urllib.quote(form['file'].filename)
    elif 'title' in form:
        tiddler_name = urllib.quote(retrieve_item(form, 'title'))
    else:
        tiddler_name = str(uuid4())
    
    environ['wsgiorg.routing_args'][1]['tiddler_name'] = tiddler_name
    
    tiddler = _determine_tiddler(environ, control.determine_tiddler_bag_from_recipe)
    
    return _post_tiddler(environ, start_response, tiddler, form)

def post_tiddler(environ, start_response):
    """
    equivalent of put function in tiddlyweb.web.handler.tiddler
    check user has permission to put data in
    validate data
    pass to the form serializer for turning into a tiddler
    """
    tiddler = _determine_tiddler(environ, control.determine_tiddler_bag_from_recipe)
    
    return _post_tiddler(environ, start_response, tiddler)
    
def _post_tiddler(environ, start_response, tiddler, form=None):
    """
    put the tiddler into the store. 
    Based on _put_tiddler in tiddlyweb.web.handler.tiddler.
    """
    store = environ['tiddlyweb.store']
    try:
        length = environ['CONTENT_LENGTH']
        content_type = environ['tiddlyweb.type']
    except KeyError:
        raise HTTP400('Content-Length and content-type required to put tiddler')
        
    try:
        bag = Bag(tiddler.bag)
        try:
            try:
                revision = store.list_tiddler_revisions(tiddler)[0]
            except StoreMethodNotImplemented:
                revision = 1
            tiddler.revision = revision
            # These both next will raise exceptions if
            # the contraints don't match.
            _check_bag_constraint(environ, bag, 'write')
            _validate_tiddler_headers(environ, tiddler)
        except NoTiddlerError:
            _check_bag_constraint(environ, bag, 'create')
            incoming_etag = environ.get('HTTP_IF_MATCH', None)
            if incoming_etag:
                raise HTTP412('Tiddler does not exist, ETag disallowed.')
                
        try:
            redirect = environ['tiddlyweb.query'].pop('redirect')
            if '?' in redirect[0] and not redirect[0].endswith('?'):
                redirect[0] += '&'
            else:
                redirect[0] += '?'
            redirect[0] += '.no-cache=%s' % uuid4()
        except KeyError:
            redirect = None
        if content_type == 'application/x-www-form-urlencoded' or content_type == 'multipart/form-data':
            if not form:
                form = set_form(environ)
            serializer = Serializer('form', environ)
            serializer.object = tiddler
            serializer.from_string(form)
        else:
            raise HTTP404('Unable to put tiddler, %s. %s' % (tiddler.title, exc))
            
        user = environ['tiddlyweb.usersign']['name']
        if not user == 'GUEST':
            tiddler.modifier = user
                
        try:
            _check_bag_constraint(environ, bag, 'accept')
        except (PermissionsError), exc:
            _validate_tiddler_content(environ, tiddler)
        store.put(tiddler)
    except NoBagError, exc:
        raise HTTP409("Unable to put tiddler, %s. There is no bag named: " \
                "%s (%s). Create the bag." %
                (tiddler.title, tiddler.bag, exc))
    except NoTiddlerError, exc:
        raise HTTP404('Unable to put tiddler, %s. %s' % (tiddler.title, exc))
        
    etag = ('Etag', _tiddler_etag(tiddler))
    if etag:
        response = [etag]
        
    if redirect:
        response.append(('Location', str(redirect[0])))
        start_response('303 See Other', response)
    else:
        response.append(('Location', web.tiddler_url(environ, tiddler)))
        start_response("204 No Content", response)
    
    return []

class Serialization(SerializationInterface):
    def as_tiddler(self, tiddler, form):
        """
        turn a form input into a tiddler
        """
        if 'file' in form and getattr(form['file'], 'file', None): 
            my_file = form['file']
            if not my_file.file: raise TiddlerFormatError
            tiddler.type = my_file.type
            tiddler.text = my_file.file.read()
        else:
            keys = ['created', 'modified', 'modifier', 'text', 'type']
            for key in form:
                if key in keys:
                    setattr(tiddler, key, retrieve_item(form, key))
                elif key == 'tags':
                    tiddler.tags = self.create_tag_list(retrieve_item(form, key))
                else:
                    tiddler.fields[key] = retrieve_item(form, key)              
        
        return tiddler
    
    def create_tag_list(self, input_string):
        regex = '\[\[([^\]\]]+)\]\]|(\S+)'
        matches = re.findall(regex, input_string)
        tags = set()
        for bracketed, unbracketed in matches:
            tag = bracketed or unbracketed
            tags.add(tag)
        return list(tags)
        

def update_handler(selector, path, new_handler):
    """
    Update an existing path handler in the selector
    map with new methods (in this case, POST). 
    
    Taken and modified from tiddlywebplugins 
    """
    for index, (regex, handler) in enumerate(selector.mappings):
        if regex.match(path) is not None:
            handler.update(new_handler)
            selector.mappings[index] = (regex, handler)

def init(config):
    """
    add POST handlers to the standard set of URLs.
    nb - revisions not included as POST already exists
    
    register the serializer for Content-Type: application/x-www-form-urlencoded 
    and Content-Type: multipart/form-data 
    """
    selector = config['selector']
    
    update_handler(selector, '/recipes/foo/tiddlers', dict(POST=post_tiddler_to_container))
    update_handler(selector, '/recipes/foo/tiddlers/bar', dict(POST=post_tiddler))
    update_handler(selector, '/bags/foo/tiddlers', dict(POST=post_tiddler_to_container))
    update_handler(selector, '/bags/foo/tiddlers/bar', dict(POST=post_tiddler))
    
    config['extension-types']['form'] = 'application/x-www-form-urlencoded'
    config['serializers']['application/x-www-form-urlencoded'] = ['form', 'application/x-www-form-urlencoded; charset=UTF-8']
    config['serializers']['multipart/form-data'] = ['form', 'multipart/form-data; charset=UTF-8']
