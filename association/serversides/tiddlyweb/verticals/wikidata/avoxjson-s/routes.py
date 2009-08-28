import templating

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

def init(config):
    config['selector'].add('/pages/{template_file:segment}', GET=template_route)
    config['selector'].add('/index.html', GET=index)