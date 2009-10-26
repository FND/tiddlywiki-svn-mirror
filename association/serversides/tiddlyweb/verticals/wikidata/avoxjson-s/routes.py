import templating
import logging

from tiddlyweb.web.http import HTTP404
from tiddlywebplugins.utils import replace_handler, remove_handler
from emailAvox import emailAvox

def index(environ, start_response):
    template = templating.generate_template(["index.html","search.html"])
    
    start_response('200 OK', [
        ('Content-Type', 'text/html')
        ])
    
    return template.render()

def template_route(environ, start_response):
    template_name = environ['wsgiorg.routing_args'][1]['template_file']
    
    if '../' in template_name:
        raise HTTP404('%s invalid' % template_name)
    
    if '.html' not in template_name:
       template_name = template_name + '.html'
       
    template = templating.generate_template([template_name])
    
    try:
        query = environ['tiddlyweb.query']
        captcha = {}
        success = query['success'][0]
        if success == '1':
            captcha['success'] = True
        elif success == '0':
            captcha['failure'] = True
            try:
               captcha['error'] = query['error'][0]
            except:
               captcha['error'] = "Error not supplied"
    except:
        pass
    
    start_response('200 OK', [
        ('Content-Type', 'text/html')
        ])
    
    return template.render(captcha=captcha)
    
def env(environ, start_response):

    from pprint import pformat

    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [pformat(environ)]
    
def verify(environ, start_response):
    from captcha import submit

    logging.debug(environ['tiddlyweb.query'])
    try:
        redirect = environ['tiddlyweb.query']['recaptcha_redirect'][0]
    except:
       redirect = environ['HTTP_REFERER']
    challenge_field = environ['tiddlyweb.query']['recaptcha_challenge_field'][0]
    logging.debug('challenge_field: '+challenge_field)
    response_field = environ['tiddlyweb.query']['recaptcha_response_field'][0]
    logging.debug('response_field: '+response_field)
    private_key = "6Ld8HAgAAAAAAAyOgYXbOtqAD1yuTaOuwP8lpzX0"
    ip_addr = environ['REMOTE_ADDR']
    logging.debug('ip_addr: '+ip_addr)

    resp = submit(challenge_field, response_field, private_key, ip_addr)
    if resp.is_valid:
        redirect = redirect + '?success=1'
        emailAvox(environ['tiddlyweb.query'])
    else:
        redirect = redirect + '?success=0&error=' + resp.error_code

    start_response('302 Found', [
            ('Content-Type', 'text/html'),
            ('Location', redirect)
            ])
    
    return ""

def init(config):
    config['selector'].add('/pages/{template_file:segment}', GET=template_route)
    config['selector'].add('/index.html', GET=index)
    config['selector'].add('/verify', POST=verify)
    config['selector'].add('/env', GET=env)
    replace_handler(config['selector'], '/', dict(GET=index))
    remove_handler(config['selector'], '/recipes')
    remove_handler(config['selector'], '/recipes/{recipe_name}')
    remove_handler(config['selector'], '/recipes/{recipe_name}/tiddlers')
    remove_handler(config['selector'], '/bags')
    remove_handler(config['selector'], '/bags/{bag_name}')
    remove_handler(config['selector'], '/bags/{bag_name}/tiddlers')
