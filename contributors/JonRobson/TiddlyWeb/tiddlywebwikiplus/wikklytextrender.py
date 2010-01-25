"""
Render TiddlyWiki syntax wikitext to HTML
using the WikklyText enginge.
"""

import wikklytext
import urllib
import os
import logging

from tiddlyweb.web.util import encode_name

def render(tiddler, environ):
    logging.debug("no bag for some reason doing render")
    """
    Render TiddlyWiki wikitext in the provided
    tiddler to HTML. The provided path helps
    set paths in wikilinks correctly.
    """
    server_prefix = environ.get('tiddlyweb.config',
            {}).get('server_prefix', '')
    if tiddler.recipe:
        path = 'recipes/%s/tiddlers' % encode_name(tiddler.recipe)
    elif tiddler.bag:
        path = 'bags/%s/tiddlers' % encode_name(tiddler.bag)
    else:
        path = ''
    html = wikitext_to_wikklyhtml('%s/' % server_prefix,
            path, tiddler.text, environ,tiddler=tiddler)
    return unicode(html, 'utf-8')


def wikitext_to_wikklyhtml(base_url, path_url, wikitext, environ,suffix_url="",tiddler=False,bag=False,wikiwords=False):
    """
    Turn a wikitext into HTML.
    base_url: starting url for links in the wikitext (e.g. '/')
    path_url: path from base to wikitext (e.g. 'recipes/foorecipe/tiddlers')
    """
    logging.debug("in wikitext_to_wikklyhtml")
    def our_resolver(url_fragment, base_url, site_url):
        """
        Turn url information for a wikiword into a link.
        """
        if '://' in url_fragment or url_fragment.startswith('/'):
            return "%s"%(url_fragment), True
        return '%s%s%s' % (base_url, urllib.quote(url_fragment, safe=''),suffix_url), False

    posthook = PostHook()

    safe_mode_setting = environ.get('tiddlyweb.config', {}).get('wikklytext.safe_mode', True)

    link_context = {
            '$BASE_URL': '%s%s' % (base_url, path_url),
            '$REFLOW': 0
    }
    logging.debug("cwd is %s"%os.getcwd())
    context = wikklytext.WikContext(plugin_dirs='plugins',url_resolver=our_resolver)
    environ["tw_url_base"] = base_url
    environ["tw_url_path"] =path_url
    environ["tw_url_suffix"] = suffix_url
    context.environ = environ
    context.bag = bag
    context.tiddler = tiddler
    context.wikiwords = wikiwords
    
    html, context = wikklytext.WikklyText_to_InnerHTML(
            text=wikitext,
            context = context,
            setvars=link_context,encoding='utf-8',plugin_dirs="plugins",
            safe_mode=safe_mode_setting,
            url_resolver=our_resolver,
            tree_posthook=posthook.treehook)
    return html.decode("utf-8")

class PostHook(object):
    """
    After we transform the wikitext into a
    tree with need to link up the wiki words.
    """

    def __init__(self):
        # make map of wikiwords
        self.wikiwords = InfiniteDict()

    def treehook(self, rootnode, context):
        """
        Turn wikiwords into links.
        """
        from wikklytext.wikwords import wikiwordify
        # add links to any wikiword
        if context.wikiwords:
          wikiwordify(rootnode, context, self.wikiwords)


class InfiniteDict(dict):
    """
    Model a dictionary that returns
    true for any key.
    """

    def __getitem__(self, name):
        return name

    def has_key(self, name):
        """
        This is an infiniate dict. It has all keys.
        """
        return True
