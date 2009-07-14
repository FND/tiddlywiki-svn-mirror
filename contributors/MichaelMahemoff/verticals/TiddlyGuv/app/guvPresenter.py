from tiddlyweb.store import Store 
from tiddlyweb.web.util import get_serialize_type 
from tiddlyweb.web.wsgi import HTMLPresenter  

class GuvPresenter(object):

    """ 
    Take the core app output, see if it is text/html, 
    and if it is, add some framework. 
    """ 
 
    def __init__(self, application): 
        self.application = application 
 
    def __call__(self, environ, start_response): 
        output = self.application(environ, start_response) 
        if environ.has_key('tiddlyweb.title'): 
            output = ''.join(output) 
            return [self._header(environ), output, self._footer(environ)] 
        return output 
 
    def _header(self, environ): 
        links = '\n'.join(environ['tiddlyweb.links']) 
        return """ 
<html> 
<head> 
<title>TiddlyGuv - %s</title> 
%s 
</head> 
<body> 
<div id="header"></div> 
""" % (environ['tiddlyweb.title'], links) 
 
    def _footer(self, environ): 
        return """ 
<div id="footer">This is <a href="http://www.tiddlywiki.org/wiki/TiddlyGuv">TiddlyGuv</a></div> 
</body> 
</html> 
""" 

def init(config):
   print config['server_response_filters']
   config['server_response_filters'].remove(HTMLPresenter)
   config['server_response_filters'].insert(0, GuvPresenter)
   print config['server_response_filters']
 
