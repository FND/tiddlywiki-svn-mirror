"""
Atom feeds for tiddlyweb.

The Atom code is borrowed from Django's django/utils/feedgenerator.py

  http://www.djangoproject.com/documentation/syndication_feeds/
  http://code.djangoproject.com/browser/django/trunk/django/utils/feedgenerator.py

Which appears to be licensed with

PYTHON SOFTWARE FOUNDATION LICENSE VERSION 2

Thanks to those guys for making a feed library that hides the 
nasty XML details.

"""
from tiddlywebplugins.atom.feed import Atom1Feed
#jon has been naughty and hacked: /Library/Python/2.5/site-packages/tiddlywebplugins/wikklytextrender.py
from tiddlyweb.wikitext import render_wikitext
from tiddlyweb.store import Store, NoBagError,NoTiddlerError
import time
import types
import urllib
import datetime
import re
import email.Utils
from wikklytextrender import wikitext_to_wikklyhtml,render
from xml.sax.saxutils import XMLGenerator
import logging
from tiddlyweb import control
from tiddlyweb.serializations import SerializationInterface
from tiddlyweb.serializations.html import Serialization as HTMLSerialization
from tiddlyweb.web.util import server_base_url, server_host_url
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.recipe import Recipe
class Serialization(HTMLSerialization):

    def __init__(self, environ={}):
        self.environ = environ
        self.store = environ['tiddlyweb.store']
    def list_recipes(self, recipes):
        pass

    def list_bags(self, bags):
        pass

    def recipe_as(self, recipe):
        pass

    def _current_url(self):
        script_name = self.environ.get('SCRIPT_NAME', '')
        query_string = self.environ.get('QUERY_STRING', None)
        url = script_name
        if query_string:
            url += '?%s' % query_string
        return url
    def make_atom_template(self,tiddler):
      text = tiddler.text
      bag_templates = text.split("!")
      bag_atom_rules = {}
      for template in bag_templates:
        rules = template.split("\n")
        bagName = rules[0]
        bag_atom_rules[bagName] = {}
        for rule in rules[1:]:
          try:
            delimiter = rule.index(":")
            field = rule[0:delimiter].strip()
            value = rule[delimiter+1:].strip()
            bag_atom_rules[bagName][field]= value
          except ValueError:
            pass
      return bag_atom_rules
          
    def list_tiddlers(self, bag):
        """
        Turn the contents of a bag into an Atom Feed.
        """
        logging.debug("dolisttiddlerthingy")
        tiddlers = bag.list_tiddlers()
        current_url = self._current_url()
        link=u'%s%s' % (self._host_url(), current_url)
        
        shadow_tiddlers=['AtomTitle','AtomSubtitle','AtomTemplate']        
        if tiddlers:
            title = False
            subtitle =False
            view_template=  False
            for tiddler in tiddlers:
              logging.debug("analysising %s"%tiddler.title)
              if tiddler.title == 'AtomTitle':
                try:
                  fat_tiddler =self.store.get(tiddler)
                  title = fat_tiddler.text
                except NoTiddlerError:
                  pass
              elif tiddler.title == 'AtomSubtitle':
                try:
                  fat_tiddler = self.store.get(tiddler)
                  subtitle = fat_tiddler.text
                except NoTiddlerError:
                  pass
              elif tiddler.title == 'AtomTemplate':
                view_template = self.make_atom_template(self.store.get(tiddler))
                                
            recipe = tiddlers[0].recipe
            bag_name = tiddlers[0].bag
            if recipe:
                if not title:
                  title = u'Tiddlers in Recipe %s' % recipe
                if not subtitle:
                  subtitle=u'the tiddlers of recipe %s' % recipe
            else:
              if not title:
                title = u'Tiddlers in xBag %s' % bag_name
              if not subtitle:
                subtitle = u'the tiddlers of bag %s' % bag_name
            feed = Atom1Feed(
                     title=title,
                     link=link,
                     language=u'en',
                     description=subtitle
                     )
        else:
            feed = Atom1Feed(
                    title='Empty Tiddler List',
                    link=link,
                    description=u'Empty Tiddler List')
        for tiddler in tiddlers:
            if tiddler.title not in shadow_tiddlers:
              self._add_tiddler_to_feed(feed, tiddler,view_template)

        # can we avoid sending utf-8 and let the wrapper handle it?
        return feed.writeString('utf-8')

    def tiddler_as(self, tiddler):
        if tiddler.recipe:
            link = u'%s/recipes/%s/tiddlers/%s' % \
                    (self._server_url(), iri_to_uri(tiddler.recipe),
                            iri_to_uri(urllib.quote(tiddler.title.encode('utf-8'), safe='')))
        else:
            link = u'%s/bags/%s/tiddlers/%s' % \
                    (self._server_url(), iri_to_uri(tiddler.bag),
                            iri_to_uri(urllib.quote(tiddler.title.encode('utf-8'), safe='')))
        feed = Atom1Feed(
                title=u'%s' % tiddler.title,
                link=link,
                language=u'en',
                description=u'tiddler %s' % tiddler.title
                )
        self._add_tiddler_to_feed(feed, tiddler)
        return feed.writeString('utf-8')

    def _add_tiddler_to_feed(self, feed, tiddler,view_template=False):
        if tiddler.recipe:
            tiddler_link = 'recipes/%s/tiddlers/' % iri_to_uri(tiddler.recipe)
            bagobject = control.determine_tiddler_bag_from_recipe(self.store.get(Recipe(tiddler.recipe)), tiddler)
            bag = bagobject.name
        else:
            tiddler_link = 'bags/%s/tiddlers/%s' % iri_to_uri(tiddler.bag)
            bag = tiddler.bag
        tiddler_link +=iri_to_uri(urllib.quote(tiddler.title.encode('utf-8'), safe=''))
        item_title = tiddler.title
        if view_template:
          if bag in view_template:
            if "link" in view_template[bag]:
              tiddler_link = wikitext_to_wikklyhtml("/", "/", view_template[bag]["link"], self.environ,tiddler=tiddler)
              #tiddler_link = render_wikitext(view_template[bag]["link"],self.environ)
            if "title" in view_template[bag]:
              item_title = wikitext_to_wikklyhtml("/", "/", view_template[bag]["title"], self.environ,tiddler=tiddler)
        link = u'%s/%s' % \
                (self._server_url(), tiddler_link)

              
        if tiddler.type and tiddler.type != 'None':
            description = 'Binary Content'
        else:
            description = render_wikitext(tiddler, self.environ)

        
        
        feed.add_item(title=item_title,
                unique_id=self._tiddler_id(tiddler),
                link=link,
                categories=tiddler.tags,
                description=description,
                author_name=tiddler.modifier,
                pubdate=self._tiddler_datetime(tiddler.modified)
                )

    def _tiddler_id(self, tiddler):
        return '%s/%s/%s' % (tiddler.title, tiddler.bag, tiddler.revision)

    def _tiddler_datetime(self, date_string):
        return datetime.datetime(*(time.strptime(date_string, '%Y%m%d%H%M%S')[0:6]))

    def _host_url(self):
        return server_host_url(self.environ)

    def _server_url(self):
        return server_base_url(self.environ)


"""
Atom feed generation from django.
"""
class SimplerXMLGenerator(XMLGenerator):
    def addQuickElement(self, name, contents=None, attrs=None):
        "Convenience method for adding an element with no children"
        if attrs is None: attrs = {}
        self.startElement(name, attrs)
        if contents is not None:
            self.characters(contents)
        self.endElement(name)

def force_unicode(s, encoding='utf-8', strings_only=False, errors='strict'):
    """
    Similar to smart_unicode, except that lazy instances are resolved to
    strings, rather than kept as lazy objects.

    If strings_only is True, don't convert (some) non-string-like objects.
    """
    if strings_only and isinstance(s, (types.NoneType, int, long, datetime.datetime, datetime.date, datetime.time, float)):
        return s
    if not isinstance(s, basestring,):
        if hasattr(s, '__unicode__'):
            s = unicode(s)
        else:
            s = unicode(str(s), encoding, errors)
    elif not isinstance(s, unicode):
        # Note: We use .decode() here, instead of unicode(s, encoding,
        # errors), so that if s is a SafeString, it ends up being a
        # SafeUnicode at the end.
        s = s.decode(encoding, errors)
    return s

def smart_str(s, encoding='utf-8', strings_only=False, errors='strict'):
    """
    Returns a bytestring version of 's', encoded as specified in 'encoding'.

    If strings_only is True, don't convert (some) non-string-like objects.
    """
    if strings_only and isinstance(s, (types.NoneType, int)):
        return s
    elif not isinstance(s, basestring):
        try:
            return str(s)
        except UnicodeEncodeError:
            return unicode(s).encode(encoding, errors)
    elif isinstance(s, unicode):
        return s.encode(encoding, errors)
    elif s and encoding != 'utf-8':
        return s.decode('utf-8', errors).encode(encoding, errors)
    else:
        return s

def iri_to_uri(iri):
    """
    Convert an Internationalized Resource Identifier (IRI) portion to a URI
    portion that is suitable for inclusion in a URL.

    This is the algorithm from section 3.1 of RFC 3987.  However, since we are
    assuming input is either UTF-8 or unicode already, we can simplify things a
    little from the full method.

    Returns an ASCII string containing the encoded result.
    """
    # The list of safe characters here is constructed from the printable ASCII
    # characters that are not explicitly excluded by the list at the end of
    # section 3.1 of RFC 3987.
    if iri is None:
        return iri
    return urllib.quote(smart_str(iri), safe='/#%[]=:;$&()+,!*')