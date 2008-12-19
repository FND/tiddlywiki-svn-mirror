"""
This is a sample of a module that runs TiddlyWeb 
under mod_python. What this script does is 
customize the TiddlyWeb application and then
provide that application (named application) as a
callable to a WSGI handler running under mod_python.

modpython_gateway can be found at
http://www.aminus.net//wiki/ModPythonGateway

(There are other options as well if you are stuck
with mod_python. If you are not but wish to use
Apache, mod_wsgi is a better choice.)

The apache configuration has something like this:

        <Location /twtest>
                PythonPath "['/home/cdent/www/twtest'] + sys.path"
                PythonOption SCRIPT_NAME /twtest
                SetHandler python-program
                PythonHandler modpython_gateway::handler
                PythonOption wsgi.application mod_python::application
        </Location>

For purposes beyond this script the name twtest and
the path to it would need to be changed.

Instead of setting config items in this script a
tiddlywebconfig.py could be used instead.

You will need to fill in values for some of the
variables below.
"""

import os
import os.path
import sys

# chdir to the location of this running script so we have access 
# tiddlywebconfig.py and lib/empty.html
os.chdir(os.path.dirname(__file__))

# sys.path.append('/home/cdent/www/twtest/TiddlyWeb')

from tiddlyweb.config import config
from tiddlyweb.web import serve

def start():
    # What is our hostname
    hostname = config['hostname']

    # What is path to us (the base url)
    port = 80
    if ':' in hostname:
        hostname, port = hostname.split(':')

    app = serve.load_app(hostname, port, config['urls_map'])
    return app

# the mod_python wsgi handler will look for the callable 
# named application
application = start()
