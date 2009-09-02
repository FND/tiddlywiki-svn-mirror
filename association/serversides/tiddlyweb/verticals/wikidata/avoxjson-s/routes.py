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
    
def env(environ, start_response):

    from pprint import pformat

    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [pformat(environ)]
    
def verify(environ, start_response):
    from captcha import submit

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