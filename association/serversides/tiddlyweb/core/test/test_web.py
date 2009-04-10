"""
Test that GETting a bag can list the tiddlers.
"""

import sys
sys.path.append('.')

from wsgi_intercept import httplib2_intercept
import wsgi_intercept
import httplib2
import py.test

import tiddlyweb.web
import tiddlyweb.web.util
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.bag import Bag

expected_content="""<ul id="root" class="listing">
<li><a href="recipes">recipes</a></li>
<li><a href="bags">bags</a></li>
</ul>"""

def setup_module(module):
    from tiddlyweb.web import serve
    # we have to have a function that returns the callable,
    # Selector just _is_ the callable
    def app_fn():
        return serve.load_app()
    #wsgi_intercept.debuglevel = 1
    httplib2_intercept.install()
    wsgi_intercept.add_wsgi_intercept('our_test_domain', 8001, app_fn)

def test_get_root():
    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/',
            method='GET')

    assert response['status'] == '200'
    assert response['content-type'] == 'text/html; charset=UTF-8'
    assert expected_content in content

def test_head_root():
    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/',
            method='HEAD')

    assert response['status'] == '200'
    assert response['content-type'] == 'text/html; charset=UTF-8'
    assert content == ''

def test_recipe_url():
    environ = {'tiddlyweb.config': {'server_host':  {'scheme':'http', 'host':'example.com', 'port': 80}}}
    recipe = Recipe('hello')

    assert tiddlyweb.web.util.recipe_url(environ, recipe) == 'http://example.com/recipes/hello'

def test_bag_url():
    bag = Bag('hello')
    environ = {'tiddlyweb.config': {'server_host':  {'scheme':'http', 'host':'example.com', 'port': 80}}}

    assert tiddlyweb.web.util.bag_url(environ, bag) == 'http://example.com/bags/hello'

def test_http_date_from_timestamp():
    timestamp = '200805231010'
    assert tiddlyweb.web.util.http_date_from_timestamp(timestamp) == 'Fri, 23 May 2008 10:10:00 GMT'

def test_http_date_from_timestamp_invalid():
    timestamp = '200702291010'
    py.test.raises(ValueError, 'tiddlyweb.web.util.http_date_from_timestamp(timestamp)')

def test_http_date_from_timestamp_pre_1900():
    timestamp = '108502281010'
    py.test.raises(ValueError, 'tiddlyweb.web.util.http_date_from_timestamp(timestamp)')

def test_datetime_from_http_date():
    timestamp = '200805231010'
    datestring = tiddlyweb.web.util.http_date_from_timestamp(timestamp)
    datetime_object = tiddlyweb.web.util.datetime_from_http_date(datestring)
    new_timestamp = datetime_object.strftime('%Y%m%d%H%M')
    assert '2008' in datestring
    assert 'May' in datestring
    assert new_timestamp == timestamp

