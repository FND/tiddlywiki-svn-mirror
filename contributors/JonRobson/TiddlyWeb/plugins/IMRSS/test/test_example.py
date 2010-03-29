from tiddlywebplugins import imrss
from tiddlyweb.model.tiddler import Tiddler
import os

def test_imrss():
    tiddlers = imrss.tiddlers_from_rss("%s/test/example.xml"%os.getcwd())
    assert len(tiddlers) is 2
    
    tiddlera= tiddlers[0]
    title1 = tiddlera.title
    text1 = u'<html><p><a href="http://example.org/2003/12/13/atom03">Atom-Powered Robots Run Amok</a><br/>The world is very scared.</p></html>'
    assert  title1 == u"unique2"
    assert tiddlera.text == text1
    tiddlerb = tiddlers[1]
    title2 = tiddlerb.title
    assert title2 == u"http___google_co_uk_foo_html"
    assert tiddlerb.modified == "20011213183002"

    assert tiddlerb.fields['geo.long'] == u"0.429"
    assert tiddlerb.fields['geo.lat'] == u"51.023"