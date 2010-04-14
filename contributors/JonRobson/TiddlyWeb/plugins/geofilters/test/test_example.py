# coding: utf-8

"""
Test geotiddlers
test script provided by psd
"""

from tiddlyweb.model.tiddler import Tiddler
import tiddlywebplugins.geofilters as geofilters
import gitscob

bag = gitscob.bag()
tiddlers = list(bag.gen_tiddlers())

def test_geoproximity():
  #london to paris
  match,distance = geofilters.geoproximity(51.50, -0.12, 360, 48.85, 2.35,units="kms")
  assert match is True
  assert "%.0f"%distance == "343"
  match,distance = geofilters.geoproximity(51.50, -0.12, 224, 48.85, 2.35,units="miles")
  assert "%.0f"%distance == '213'
  
def test_geo_near_tiddlers():

    # forced single tidder
    tiddler = Tiddler('North Sea', bag='gitscob')
    tiddler.fields = {u'geo.lat': u'55.0', u'geo.long': u'1.9'}
    found = list(geofilters.geo_near_tiddlers(55.0, 1.9, 1.0, [tiddler]))
    assert len(found) == 1
    assert found[0].fields['_geo.proximity'] == "0.00"

    # giant's causway
    found = list(geofilters.geo_near_tiddlers(55.23636, -6.50888, 1.0, tiddlers))
    assert len(found) == 1

    # Scotland
    found = list(geofilters.geo_near_tiddlers(55.860, -3.733, 25, tiddlers, "miles"))
    assert len(found) == 2
    
    # Cornwall
    found = list(geofilters.geo_near_tiddlers(49.916, -6.41, 100, tiddlers, "miles"))
    assert len(found) == 3
