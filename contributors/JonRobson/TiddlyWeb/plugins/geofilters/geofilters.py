'''
Requires LessThanGreaterThanFilter (http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/TiddlyWeb/plugins/LessThanGreatThenFilter/ltgt.py)
provides a filter near=lat,lng,radius
which returns all tiddlers with a field "longitude" and field "latitude" that is within the given radius of the given longitude and latitude coordinate.
radius must be in miles

based on C+ function located here http://www.experts-exchange.com/Database/GIS_and_GPS/Q_23027761.html

'''
from tiddlyweb.filters import FILTER_PARSERS

SINGLE_DEG_AT_ZERO_ZERO_IN_MILES = 69.046767
import math

def geoproximity(lat,lng, radius, testlat,testlng):
  oneRad = 3.1415926 / 180.0
  lng1 = lng  * oneRad
  lat1 = lat * oneRad
  lng2 = testlng * oneRad
  lat2 = testlat * oneRad
  d = 2 * math.asin(math.sqrt(math.pow(math.sin((lat1 - lat2) / 2), 2) + math.cos(lat1) * math.cos(lat2) * math.pow(math.sin((lng1 - lng2) / 2), 2) ))
  d = d / oneRad

  d *= 60         #result in nautical miles
  d *= 1.15077945 #result in statute miles

  return d<=radius
from tiddlyweb import filters
import logging
def geo_near_tiddlers(lat,lng,radius,tiddlers):
  #create bounding box around 
  degrees = radius / SINGLE_DEG_AT_ZERO_ZERO_IN_MILES
  
  lat1 = lat - degrees
  lat2 = lat + degrees
  lng1 = lng - degrees
  lng2 = lng + degrees
  filter_string = "select=field:longitude&select=field:latitude&gt=latitude:%s&lt=latitude:%s&gt=longitude:%s&lt=longitude:%s"%(lat1,lat2,lng1,lng2)
  logging.debug("filter string lt gt %s"%filter_string)
  filtered_sample = filters.recursive_filter(filters.parse_for_filters(filter_string)[0],tiddlers)
  
  near_tiddlers = []
  for tiddler in filtered_sample:
    if "latitude" in tiddler.fields and "longitude" in tiddler.fields:
      testlat = float(tiddler.fields["latitude"])
      testlng = float(tiddler.fields["longitude"])
      isNear = geoproximity(lat,lng,radius,testlat,testlng)
      if isNear:
        yield tiddler
  
  return
  
def near_parse(command):
  params = command.split(",")
  def selector(tiddlers, indexable=False, environ={}):
      return geo_near_tiddlers(float(params[0]),float(params[1]),float(params[2]),tiddlers)
  return selector

FILTER_PARSERS['near'] = near_parse


def init(config):
    pass
