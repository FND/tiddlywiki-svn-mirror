"""
Convenience routines for presenting the root of
the web server. There are probably better places
for this.
"""

ROOT_PAGE = """<ul id="root" class="listing">
<li><a href="recipes">recipes</a></li>
<li><a href="bags">bags</a></li>
</ul>"""


def root(environ, start_response):
    """
    Convenience method to provide an entry point at root.
    """

    start_response("200 OK", [('Content-Type', 'text/html; charset=UTF-8')])
    environ['tiddlyweb.title'] = 'Home'
    return [ROOT_PAGE]
