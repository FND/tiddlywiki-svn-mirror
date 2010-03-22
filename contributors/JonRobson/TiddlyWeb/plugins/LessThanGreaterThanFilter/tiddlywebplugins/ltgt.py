"""
Provides TiddlyWeb filters for numeric comparisons (less/greater than)

Usage:
  ?lt=myfield:5&gt=myfield:2
This will match tiddlers whose "myfield" has a numeric value between 2 and 5.

created and modified:
These work slightly differently and will treat the values as dates
so ?lt=created:20100101115959&gt20081231115959 will return all tiddlers created in the year 2009.
Installation:
Add 'ltgt' to 'system_plugins' in tiddlywebconfig.py.
"""

import logging

from tiddlyweb.filters import FILTER_PARSERS
from tiddlyweb.filters.select import ATTRIBUTE_SELECTOR, select_parse


def init(config):
    ATTRIBUTE_SELECTOR['field'] = field_in_fields
    FILTER_PARSERS['lt'] = lt_parse
    FILTER_PARSERS['gt'] = gt_parse


def field_in_fields(tiddler, attribute, value):
    return value in tiddler.fields

def comparedate(date1,date2):
  #if date1 < date2 return -1 else return 1
  logging.debug("ltgt.py: compare %s with %s"%(date1,date2))
  try:
    y1 = float(date1[0:4])
  except ValueError:
    y1 = 0
  try: 
    y2 = float(date2[0:4])
  except ValueError:
    y2 = 0
  try:
    m1 = float(date1[4:6])
  except ValueError:
    m1 = 0
  try:
    m2 = float(date2[4:6])
  except ValueError:
    m2 = 0
  try:
    d1 = float(date1[6:8])
  except ValueError:
    d1 = 0
  try:
    d2 = float(date2[6:8])
  except ValueError:
    d2 = 0
  try:
    h1 = float(date1[8:10])
  except ValueError:
    h1 = 0
  try:
    h2 = float(date2[8:10])
  except ValueError:
    h2 = 0
  try:
    min1 = float(date1[10:12])
  except ValueError:
    min1 = 0
  try:
    min2 = float(date2[10:12])
  except ValueError:
    min2 = 0
  try:
    s1 = float(date1[12:14])
  except ValueError:
    s1 = 0
  try:
    s2 = float(date2[12:14])
  except ValueError:
    s2 = 0
  if y1 < y2:
    return -1
  elif y1 > y2:
    return 1
  else: #years are same
    if m1 < m2:
      return -1
    elif m1 > m2:
      return 1
    else:#months are same
      if d1 < d2:
        return -1
      elif d1 > d2:
        return 1
      else:#dqys are same
        if h1 < h2:
          return -1
        elif h1 > h2:
          return 1
        else:
          if min1 < min2:
            return -1
          elif min1 > min2:
            return 1
          else:
            if s1 < s2:
              return -1
            elif s1 > s2:
              return 1
            else:
              return 0

def lt(command, tiddlers):
    field, val = command.split(':')
    # un-generate the tiddlers so we can use the list multiple times
    tiddlers = list(tiddlers)
    if field in ["created","modified"]:
      logging.debug("ltgt.py: lt detected date (%s)"%field)
      for tiddler in tiddlers:
          try:
              thisdate = tiddler.modified
              logging.debug("ltgt.py: compare date %s with %s"%(val,thisdate))
              if comparedate(thisdate,val) < 0:
                  yield tiddler
          except AttributeError:
              logging.debug("ltgt.py: could not find attr %s in tiddler %s"%(field,tiddler))
              pass
      logging.debug("ltgt.py: done")
    else:
      val = float(val)
      for tiddler in tiddlers:
          if field in tiddler.fields:
              field_value = float(tiddler.fields[field])
          else:
              field_value = 0
          logging.debug('lt test on %s: is %s < %s' % (field, field_value, val))
          if field_value < val:
              logging.debug('lt test result %s: is %s < %s' % (
                  field, field_value, val))
              yield tiddler

def gt(command, tiddlers):
    field, val = command.split(':')
    # un_generate the tiddlers so we can use the list multiple times
    tiddlers = list(tiddlers)
    if field in ["created","modified"]:
      for tiddler in tiddlers:
          try:
              thisdate = tiddler.modified
              logging.debug("ltgt.py: compare date %s with %s"%(val,thisdate))
              if comparedate(thisdate,val) > 0:
                  yield tiddler
          except AttributeError:
              logging.debug("ltgt.py: could not find attr %s in tiddler %s"%(field,tiddler))
              pass
    else:
      val = float(val)    
      for tiddler in tiddlers:
          if field in tiddler.fields:
              field_value = float(tiddler.fields[field])
          else:
              field_value = 0
          logging.debug('gt test on %s: is %s > %s' % (field, field_value, val))
          if field_value > val:
              logging.debug('gt test result %s: is %s < %s' % (
              field, field_value, val))
              yield tiddler

def lt_parse(command):
    def selector(tiddlers, indexable=False, environ={}):
        return lt(command, tiddlers)
    return selector


def gt_parse(command):
    def selector(tiddlers, indexable=False, environ={}):
        return gt(command, tiddlers)
    return selector
