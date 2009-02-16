"""
Methods for accessing Bag entities, GET the
tiddlers in the bag, list the available bags,
PUT a Bag as a JSON object.

These need some refactoring.
"""

import urllib

from tiddlyweb.filter import FilterError
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.policy import \
        create_policy_check, UserRequiredError, ForbiddenError
from tiddlyweb.store import NoBagError, StoreMethodNotImplemented
from tiddlyweb.serializer import Serializer, NoSerializationError
from tiddlyweb import control
from tiddlyweb.web import util as web
from tiddlyweb.web.sendtiddlers import send_tiddlers
from tiddlyweb.web.http import HTTP400, HTTP404, HTTP415


def delete(environ, start_response):
    """
    Remove a bag and its tiddlers from the store.
    How the store chooses to handle remove and what
    it means is up to the store.
    """
    bag_name = _determine_bag_name(environ)
    bag_name = web.handle_extension(environ, bag_name)

    usersign = environ['tiddlyweb.usersign']

    bag = _get_bag(environ, bag_name)
    bag.policy.allows(usersign, 'manage')
    # reuse the store attribute that was set on the
    # bag when we "got" it.
    # we don't need to check for existence here because
    # the above get already did
    try:
        store = environ['tiddlyweb.store']
        store.delete(bag)
    except StoreMethodNotImplemented:
        raise HTTP400('Bag DELETE not supported')

    start_response("204 No Content", [])
    return []


def get(environ, start_response):
    """
    Get a representation in some serialization of
    a bag (the bag itself not the tiddlers within).
    """
    bag_name = _determine_bag_name(environ)
    bag_name = web.handle_extension(environ, bag_name)
    bag = _get_bag(environ, bag_name)

    bag.policy.allows(environ['tiddlyweb.usersign'], 'manage')

    try:
        serialize_type, mime_type = web.get_serialize_type(environ)
        serializer = Serializer(serialize_type, environ)
        serializer.object = bag

        content = serializer.to_string()
    except NoSerializationError:
        raise HTTP415('Content type not supported: %s' % mime_type)

    start_response("200 Ok",
            [('Content-Type', mime_type)])

    return [content]


def get_tiddlers(environ, start_response):
    """
    Get a list representation of the tiddlers in a
    bag. The information sent is dependent on the
    serialization chosen.
    """
    filter_string = web.filter_query_string(environ)

    bag_name = _determine_bag_name(environ)
    bag = _get_bag(environ, bag_name)

    usersign = environ['tiddlyweb.usersign']
    # will raise exception if there are problems
    bag.policy.allows(usersign, 'read')

    try:
        tiddlers = control.filter_tiddlers_from_bag(bag, filter_string)
    except FilterError, exc:
        raise HTTP400('malformed filter: %s' % exc)
    tmp_bag = Bag('tmp_bag', tmpbag=True)
    tmp_bag.add_tiddlers(tiddlers)

    return send_tiddlers(environ, start_response, tmp_bag)


def import_wiki(environ, start_response):
    """
    Accept a tiddlywiki as POST and using it as the source
    parse it for tiddlers to be stored in the named bag.
    """
    bag_name = _determine_bag_name(environ)
    bag = _get_bag(environ, bag_name)
    length = environ['CONTENT_LENGTH']
    content = environ['wsgi.input'].read(int(length))

    bag.policy.allows(environ['tiddlyweb.usersign'], 'create')

    try:
        serialize_type, mime_type = web.get_serialize_type(environ)
        serializer = Serializer(serialize_type, environ)
        serializer.object = bag

        serializer.from_string(content)
    except NoSerializationError:
        raise HTTP415('Content type not supported: %s' % mime_type)
    except AttributeError, exc:
        raise HTTP400('Content malformed: %s' % exc)

    start_response("204 No Content",
            [('Location', '%s/tiddlers' % web.bag_url(environ, bag))])
    return ['']


def list(environ, start_response):
    """
    List all the bags that the current user can read.
    """
    store = environ['tiddlyweb.store']
    bags = store.list_bags()
    kept_bags = []
    for bag in bags:
        try:
            bag = store.get(bag)
            bag.policy.allows(environ['tiddlyweb.usersign'], 'read')
            kept_bags.append(bag)
        except(UserRequiredError, ForbiddenError):
            pass

    try:
        serialize_type, mime_type = web.get_serialize_type(environ)
        serializer = Serializer(serialize_type, environ)

        content = serializer.list_bags(kept_bags)

    except NoSerializationError:
        raise HTTP415('Content type not supported: %s' % mime_type)

    start_response("200 OK",
            [('Content-Type', mime_type)])

    return [content]


def put(environ, start_response):
    """
    Put a bag to the server, meaning the description and
    policy of the bag, if policy allows.
    """
    bag_name = _determine_bag_name(environ)
    bag_name = web.handle_extension(environ, bag_name)

    bag = Bag(bag_name)
    store = environ['tiddlyweb.store']
    length = environ['CONTENT_LENGTH']

    usersign = environ['tiddlyweb.usersign']

    try:
        bag = store.get(bag)
        bag.policy.allows(usersign, 'manage')
    except NoBagError:
        create_policy_check(environ, 'bag', usersign)

    try:
        serialize_type = web.get_serialize_type(environ)[0]
        serializer = Serializer(serialize_type, environ)
        serializer.object = bag
        content = environ['wsgi.input'].read(int(length))
        serializer.from_string(content.decode('UTF-8'))

        bag.policy.owner = usersign['name']

        store.put(bag)
    except NoSerializationError:
        raise HTTP415('Content type not supported: %s' % serialize_type)

    start_response("204 No Content",
            [('Location', web.bag_url(environ, bag))])

    return []


def _determine_bag_name(environ):
    """
    Figure out the name of the target bag by
    parsing the URL.
    """
    bag_name = environ['wsgiorg.routing_args'][1]['bag_name']
    bag_name = urllib.unquote(bag_name)
    bag_name = unicode(bag_name, 'utf-8')
    return bag_name


def _get_bag(environ, bag_name):
    """
    Get the named bag out of the store.
    """
    bag = Bag(bag_name)
    store = environ['tiddlyweb.store']
    try:
        bag = store.get(bag)
    except NoBagError, exc:
        raise HTTP404('%s not found, %s' % (bag.name, exc))
    return bag
