import urllib
import time
from datetime import datetime

from tiddlyweb.web.http import HTTP415, HTTP304
from tiddlyweb.serializer import Serializer

def get_serialize_type(environ):
    accept = environ.get('tiddlyweb.type')[:]
    ext = environ.get('tiddlyweb.extension')
    serializers = environ['tiddlyweb.config']['serializers']
    serialize_type, mime_type = None, None

    if type(accept) == str:
        accept = [accept]

    while len(accept) and serialize_type == None:
        candidate_type = accept.pop(0)
        try:
            serialize_type, mime_type = serializers[candidate_type]
        except KeyError:
            pass
    if not serialize_type:
        if ext:
            raise HTTP415, '%s type unsupported' % ext
        serialize_type, mime_type = serializers['default']
    return serialize_type, mime_type

def handle_extension(environ, resource_name):
    extension = environ.get('tiddlyweb.extension')
    if extension:
        try:
            resource_name = resource_name[0 : resource_name.rindex('.' + extension)]
        except ValueError:
            pass

    return resource_name

def validate_tiddler_list(environ, tiddlers):
    last_modified_number = _last_modified_tiddler(tiddlers)
    last_modified_string = http_date_from_timestamp(last_modified_number)
    last_modified = ('Last-Modified', last_modified_string)

    etag_string = '%s:%s' % (len(tiddlers), last_modified_number)
    etag = ('Etag', etag_string)

    incoming_etag = environ.get('HTTP_IF_NONE_MATCH', None)
    if incoming_etag == etag_string:
        raise HTTP304, incoming_etag

    incoming_modified = environ.get('HTTP_IF_MODIFIED_SINCE', None)
    if incoming_modified and \
            (datetime_from_http_date(incoming_modified) >= datetime_from_http_date(last_modified_string)):
        raise HTTP304, ''

    return last_modified, etag

def send_tiddlers(environ, start_response, bag):
    last_modified = None
    etag = None
    bags_tiddlers = bag.list_tiddlers()

    if bags_tiddlers:
        last_modified, etag = validate_tiddler_list(environ, bags_tiddlers)

    serialize_type, mime_type = get_serialize_type(environ)
    serializer = Serializer(serialize_type, environ)
    serializer.object = bag

    content_header = ('Content-Type', mime_type)
    cache_header = ('Cache-Control', 'no-cache')
    response = [content_header, cache_header]

    if serialize_type == 'wiki':
        response.append(('Set-Cookie', 'chkHttpReadOnly=false'))
    if last_modified:
        response.append(last_modified)
    if etag:
        response.append(etag)

    output = serializer.to_string()
    start_response("200 OK", response)
    return [output]

def _last_modified_tiddler(tiddlers):
    return str(max([int(tiddler.modified) for tiddler in tiddlers]))

def http_date_from_timestamp(timestamp):
    timestamp_datetime = datetime(*(time.strptime(timestamp, '%Y%m%d%H%M')[0:6]))
    return timestamp_datetime.strftime('%a, %d %b %Y %H:%M:%S GMT')

def datetime_from_http_date(http_datestring):
    http_datetime = datetime(*(time.strptime(http_datestring, '%a, %d %b %Y %H:%M:%S GMT')[0:6]))
    return http_datetime

def server_base_url(environ):
    server_host = environ['tiddlyweb.config']['server_host']
    port = str(server_host['port'])
    if port == '80' or port == '443':
        port = ''
    else:
        port = ':%s' % port
    host = '%s://%s%s/' % (server_host['scheme'], server_host['host'], port)
    return host

def tiddler_url(environ, tiddler):
    """
    Construct a URL for a tiddler.
    """
    return '%sbags/%s/tiddlers/%s' % (server_base_url(environ), urllib.quote(tiddler.bag), urllib.quote(tiddler.title))

def recipe_url(environ, recipe):
    """
    Construct a URL for a recipe.
    """
    return '%srecipes/%s' % (server_base_url(environ), urllib.quote(recipe.name))

def bag_url(environ, bag):
    """
    Construct a URL for a recipe.
    """
    return '%sbags/%s' % (server_base_url(environ), urllib.quote(bag.name))

