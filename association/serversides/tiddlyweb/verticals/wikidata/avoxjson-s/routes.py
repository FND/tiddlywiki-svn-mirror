import templating
import logging

from tiddlyweb.web.http import HTTP404

def index(environ, start_response):
    template = templating.generate_template(["index.html","search.html"])
    
    start_response('200 OK', [
        ('Content-Type', 'text/html')
        ])
    
    return template.render()

def template_route(environ, start_response):
    template_name = environ['wsgiorg.routing_args'][1]['template_file']
    
    if '../' in template_name:
        raise HTTP404('%s inavlid' % template_name)
    
    if '.html' not in template_name:
       template_name = template_name + '.html'
       
    template = templating.generate_template([template_name])
    
    start_response('200 OK', [
        ('Content-Type', 'text/html')
        ])
    
    return template.render()
    
def test(environ, start_response):

    from pprint import pformat

    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [pformat(environ)]
    
def verify(environ, start_response):
    from captcha import submit

    try:
        redirect = environ['tiddlyweb.query']['recaptcha_redirect']
    except:
       redirect = "/"
    challenge_field = environ['tiddlyweb.query']['recaptcha_challenge_field']
    response_field = environ['tiddlyweb.query']['recaptcha_response_field']
    private_key = "6Ld8HAgAAAAAAAyOgYXbOtqAD1yuTaOuwP8lpzX0"
    ip_addr = environ['REMOTE_ADDR']
    logging.debug('ip_addr: '+ip_addr)

    resp = submit(challenge_field, response_field, private_key, ip_addr)
    logging.debug('resp.error_code: '+resp.error_code)
    if not resp.is_valid:
        redirect = '/validation_failed'

    start_response('302 Found', [
            ('Content-Type', 'text/html'),
            ('Location', redirect)
            ])
    
    return resp.error_code

def init(config):
    config['selector'].add('/pages/{template_file:segment}', GET=template_route)
    config['selector'].add('/index.html', GET=index)
    config['selector'].add('/verify', GET=test, POST=verify)