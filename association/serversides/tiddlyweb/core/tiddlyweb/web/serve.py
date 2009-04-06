"""
Functions and Classes for running the TiddlyWeb
web server.
"""
import logging
import os
import selector
import sys

from tiddlyweb.config import config


def load_app(prefix=''):
    """
    Create our application from a series of layers. The innermost
    layer is a selector application based on url map in map. This
    is surround by wrappers, which either set something in the
    environment or modify the request, or transform output.
    """

    mapfile = config['urls_map']
    app = selector.Selector(mapfile=mapfile, prefix=prefix)
    config['selector'] = app

    try:
        plugins = config['system_plugins']
        for plugin in plugins:
            logging.debug('attempt to import system plugin %s' % plugin)
            # let the import fail with error if it does
            imported_module = __import__(plugin, {}, {}, ['init'])
            imported_module.init(config)
    except KeyError:
        pass # no plugins

    wrappers = []
    wrappers.extend(reversed(config['server_request_filters']))
    wrappers.append(Environator) # required as the first app
    wrappers.append(Configurator) # required as the second app
    wrappers.extend(config['server_response_filters'])
    if wrappers:
        for wrapper in wrappers:
            logging.debug('wrapping app with %s' % wrapper)
            app = wrapper(app)
    return app


def start_simple(filename, hostname, port):
    """
    Start a wsgiref.simple_server to run our app.

    Provides the simplest base for testing, debugging
    and development.

    XXX no longer used
    """
    os.environ = {}
    from wsgiref.simple_server import WSGIServer, WSGIRequestHandler
    hostname = config['server_host']['host']
    port = int(config['server_host']['port'])
    httpd = WSGIServer((hostname, port), WSGIRequestHandler)
    httpd.set_app(load_app())
    print >> sys.stderr, "Serving HTTP on %s port %s ..." % httpd.socket.getsockname()
    httpd.serve_forever()


def start_cherrypy():
    """
    Start a cherrypy webserver to run our app.
    """
    os.environ = {}
    from cherrypy import wsgiserver
    hostname = config['server_host']['host']
    port = int(config['server_host']['port'])
    app = load_app(prefix = config['server_prefix'])
    server = wsgiserver.CherryPyWSGIServer((hostname, port), app)
    try:
        logging.debug('starting cherrypy at %s:%s' % (hostname, port))
        print >> sys.stderr, "Starting CherryPy at %s:%s" % (hostname, port)
        server.start()
    except KeyboardInterrupt:
        server.stop()


class Environator(object):
    """
    WSGI Middleware that doctors the environment
    to make it satisfactory to Selector no matter
    what server has mounted us. This is likely to 
    be riddled with bugs, especially in the case where
    we have a server_prefix.
    """

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        request_method = environ.get('REQUEST_METHOD', None)
        request_uri = environ.get('REQUEST_URI', None)
        script_name = environ.get('SCRIPT_NAME', None)
        path_info = environ.get('PATH_INFO', None)
        query_string = environ.get('QUERY_STRING', None)
        logging.debug('starting "%s" request with uri "%s", script_name "%s", path_info "%s" and query "%s"' % (
            request_method, request_uri, script_name, path_info, query_string))
        # do no cleaning for now
        return self.application(environ, start_response)

class Configurator(object):
    """
    WSGI Middleware to handle setting a config dict
    for every request.
    """

    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        environ['tiddlyweb.config'] = config
        return self.application(environ, start_response)
