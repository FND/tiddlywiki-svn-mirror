"""
Test the way in which the /challenge URI produces stuff.
"""

import sys
sys.path.append('.')

from wsgi_intercept import httplib2_intercept
import wsgi_intercept
import httplib2
import simplejson

from base64 import b64encode

from fixtures import muchdata, reset_textstore
from tiddlyweb.store import Store

def setup_module(module):
    from tiddlyweb.web import serve
    serve.config['extractors'].append('saliva')
    def app_fn():
        return serve.default_app('our_test_domain', 8001, 'urls.map')
    httplib2_intercept.install()
    wsgi_intercept.add_wsgi_intercept('our_test_domain', 8001, app_fn)
    module.store = Store('text')
    reset_textstore()
    muchdata(module.store)

def teardown_module(module):
    from tiddlyweb.web import serve
    serve.config['extractors'].pop()

def test_extractor_not_there_in_config():
    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/', method='GET')

    print content
    assert response['status'] == '500'
    assert 'ImportError' in content

