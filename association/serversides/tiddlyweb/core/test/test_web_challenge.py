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

from fixtures import muchdata, reset_textstore, teststore
from tiddlyweb.model.user import User
from tiddlyweb.config import config

def setup_module(module):
    from tiddlyweb.web import serve
    serve.config['auth_systems'].append('not.really.there')
    def app_fn():
        return serve.load_app()
    httplib2_intercept.install()
    wsgi_intercept.add_wsgi_intercept('our_test_domain', 8001, app_fn)
    module.store = teststore()
    reset_textstore()
    muchdata(module.store)

    user = User('cdent')
    user.set_password('cowpig')
    store.put(user)

def test_challenge_base():
    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/challenge', method='GET')

    assert response['status'] == '401'
    assert 'cookie_form' in content

def test_challenge_cookie_form():
    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/challenge/cookie_form', method='GET')

    assert response['status'] == '200'
    assert '<form' in content

def test_challenge_not_there_in_config():
    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/challenge/not_there', method='GET')

    assert response['status'] == '404'

def test_challenge_unable_to_import():
    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/challenge/not.really.there', method='GET')

    assert response['status'] == '404'
    assert 'Unable to import' in content

def test_redirect_to_challenge():
    _put_policy('bag28', dict(policy=dict(read=['cdent'],write=['cdent'])))

    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/recipes/long/tiddlers/tiddler8',
            method='GET')
    assert response['status'] == '401'
    assert 'cookie_form' in content

def test_simple_cookie_redirect():
    raised = 0
    try:
        http = httplib2.Http()
        response, content = http.request(
                'http://our_test_domain:8001/challenge/cookie_form',
                method='POST',
                headers={'content-type': 'application/x-www-form-urlencoded'},
                body='user=cdent&password=cowpig&tiddlyweb_redirect=/recipes/long/tiddlers/tiddler8',
                redirections=0)
    except httplib2.RedirectLimit, e:
        raised = 1

    assert raised
    assert e.response['status'] == '303'
    headers = {}
    headers['cookie'] = e.response['set-cookie']
    response, content = http.request(e.response['location'], method='GET', headers=headers)
    assert response['status'] == '200'
    assert 'i am tiddler 8' in content

def test_malformed_post():
    """
    If we leave out some info in the post, 
    we need to just see the form again.
    """
    http = httplib2.Http()
    response, content = http.request(
            'http://our_test_domain:8001/challenge/cookie_form',
            method='POST',
            body='user=cdent&tiddlyweb_redirect=/recipes/long/tiddlers/tiddler8',
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            redirections=0)
    assert response['status'] == '401'
    assert '<form' in content

def test_charset_in_content_type():
    """
    Make sure we are okay with charset being set in the content type.
    """
    raised = 0
    try:
        http = httplib2.Http()
        response, content = http.request(
                'http://our_test_domain:8001/challenge/cookie_form',
                method='POST',
                headers={'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                body='user=cdent&password=cowpig&tiddlyweb_redirect=/recipes/long/tiddlers/tiddler8',
                redirections=0)
    except httplib2.RedirectLimit, e:
        raised = 1

    assert raised
    assert e.response['status'] == '303'
    headers = {}
    headers['cookie'] = e.response['set-cookie']
    response, content = http.request(e.response['location'], method='GET', headers=headers)
    assert response['status'] == '200'
    assert 'i am tiddler 8' in content

def _put_policy(bag_name, policy_dict):
    json = simplejson.dumps(policy_dict)

    http = httplib2.Http()
    response, content = http.request('http://our_test_domain:8001/bags/%s' % bag_name,
            method='PUT', headers={'Content-Type': 'application/json'}, body=json)
    assert response['status'] == '204'

def test_openid():
    """
    An incomplete test of the openid implementation.
    This test confirms that our server will send a redirect
    as expected, but that's about it.
    """
    http = httplib2.Http()
    response, content = http.request(
            'http://our_test_domain:8001/challenge/openid?tiddlyweb_redirect=http://www.example.com/',
            method='GET')

    assert response['status'] == '200'
    assert 'name="openid"' in content

    response, content = http.request(
            'http://our_test_domain:8001/challenge/openid',
            method='POST',
            headers={'content-type': 'application/x-www-form-urlencoded'},
            body='openid=cdent.livejournal.com&tiddlyweb_redirect=http://www.example.com/',
            redirections=0)
    assert response['status'] == '302'

def test_single_challenge_redirect():
    """
    When there is only one challenger configured, we should
    be redirected to it instead of getting a list.
    """

    config['auth_systems'] = ['cookie_form']
    http = httplib2.Http()
    raised = 0
    try:
        response, content = http.request('http://our_test_domain:8001/challenge', method='GET', redirections=0)
    except httplib2.RedirectLimit, e:
        raised = 1

    assert raised
    assert e.response['status'] == '302'

def test_cookie_path_prefix():
    original_prefix = config['server_prefix']
    config['server_prefix'] = '/wiki'
    http = httplib2.Http()
    try:
        http = httplib2.Http()
        response, content = http.request(
                'http://our_test_domain:8001/challenge/cookie_form',
                method='POST',
                headers={'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                body='user=cdent&password=cowpig&tiddlyweb_redirect=/recipes/long/tiddlers/tiddler8',
                redirections=0)
    except httplib2.RedirectLimit, e:
        raised = 1

    assert raised
    assert 'Path=/wiki/' in e.response['set-cookie']
    config['server_prefix'] = original_prefix

