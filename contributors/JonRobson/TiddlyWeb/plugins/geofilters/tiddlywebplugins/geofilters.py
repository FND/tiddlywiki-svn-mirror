'''
Requires LessThanGreaterThanFilter (http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/TiddlyWeb/plugins/LessThanGreatThenFilter/ltgt.py)
provides a filter near=lat,lng,radius
which returns all tiddlers with a field "longitude" and field "latitude" that is within the given radius of the given longitude and latitude coordinate.
radius can be in miles or kms (kms is default)
near=51.498558,-0.134304,2.1 (searches 2.1km radius)
near=51.498558,-0.134304,2.1kms (same)
near=51.498558,-0.134304,2.1miles (searches 2.1 mile radius)

based on C+ function located here http://www.experts-exchange.com/Database/GIS_and_GPS/Q_23027761.html

'''

#adheres to w3c standard http://www.w3.org/2003/01/geo/
LATITUDE_FIELD = "geo.lat"
LONGITUDE_FIELD = "geo.long" 
from tiddlyweb.filters import FILTER_PARSERS

SINGLE_DEG_AT_ZERO_ZERO_IN_MILES = 69.046767
SINGLE_DEG_AT_ZERO_ZERO_IN_KMS = 111.226306#based on circumference being mean of 40041.47
import math

def geoproximity(lat,lng, radius, testlat,testlng,units="kms"):
  oneRad = 3.1415926 / 180.0
  lng1 = lng  * oneRad
  lat1 = lat * oneRad
  lng2 = testlng * oneRad
  lat2 = testlat * oneRad
  d = 2 * math.asin(math.sqrt(math.pow(math.sin((lat1 - lat2) / 2), 2) + math.cos(lat1) * math.cos(lat2) * math.pow(math.sin((lng1 - lng2) / 2), 2) ))
  d = d / oneRad

  d *= 60         #result in nautical miles
  
  if units == 'miles':
    d *= 1.15077945 #result in statute miles
  elif units == 'kms':
    d *= 1.85200
  return (d<=radius,d)
from tiddlyweb import filters
import logging
import re

def geo_near_tiddlers(lat,lng,radius,tiddlers,units="kms"):
  #create bounding box around 
  if units == 'miles':
    degrees = radius / SINGLE_DEG_AT_ZERO_ZERO_IN_MILES
  elif units == 'kms':
    degrees = radius / SINGLE_DEG_AT_ZERO_ZERO_IN_KMS
  else:
    raise "unknown unit type: please use kms or miles"
  lat1 = lat - degrees
  lat2 = lat + degrees
  lng1 = lng - degrees
  lng2 = lng + degrees
  filter_string = "select=field:%s&select=field:%s&gt=%s:%s&lt=%s:%s&gt=%s:%s&lt=%s:%s"%(LONGITUDE_FIELD,LATITUDE_FIELD,LATITUDE_FIELD,lat1,LATITUDE_FIELD,lat2,LONGITUDE_FIELD,lng1,LONGITUDE_FIELD,lng2)
  logging.debug("filter string lt gt %s"%filter_string)
  filtered_sample = filters.recursive_filter(filters.parse_for_filters(filter_string)[0],tiddlers)
  
  near_tiddlers = []
  for tiddler in filtered_sample:
    try:
      testlat = float(tiddler.fields[LATITUDE_FIELD])
      testlng = float(tiddler.fields[LONGITUDE_FIELD])
      isNear = geoproximity(lat,lng,radius,testlat,testlng,units=units)
      if isNear[0]:
        tiddler.fields["_geo.proximity"] = isNear[1]
        yield tiddler
    except ValueError:
      #ignore tiddlers which have an empty string for this value
      pass
  return
  
def near_parse(command):
  params = command.split(",")
  def selector(tiddlers, indexable=False, environ={}):
      units = "miles"
      regex = "(\d+\.?\d*)([a-z]+)"
      match = re.search(regex,params[2])
      if match:
        radius = float(match.group(1))
        units =match.group(2)
        if units == 'km':
          units = 'kms'
        elif units == 'mile':
          units = "miles"
      else:
        radius = float(params[2])
      
      return geo_near_tiddlers(float(params[0]),float(params[1]),radius,tiddlers,units)
  return selector

FILTER_PARSERS['near'] = near_parse
def init(config):
    pass
