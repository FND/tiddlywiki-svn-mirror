"""
Provides less than and greater than filters
Usage:
?lt=myfield:5&gt=myfield:2
will return all tiddlers which have a field "myfield" who's value is a float and between 2 and 5.

Install by adding 'tiddlywebplugins.mselect' to 'system_plugins'
in tiddlywebconfig.py.
"""

from tiddlyweb.filters import FILTER_PARSERS
from tiddlyweb.filters.select import select_parse
import logging

from tiddlyweb.filters.select import ATTRIBUTE_SELECTOR

def field_in_fields(tiddler, attribute, value):
    return value in tiddler.fields

ATTRIBUTE_SELECTOR['field'] = field_in_fields


def lt(command, tiddlers):
    logging.debug("isit %s"%command)
    field_and_val = command.split(":")
    # un_generate the tiddlers so we can use the list multiple times
    tiddlers = list(tiddlers)
    field = field_and_val[0]
    val = float(field_and_val[1])
    for tiddler in tiddlers:
      if field in tiddler.fields:
        thisval = float(tiddler.fields[field])
      else:
        thisval = 0
      logging.debug("lt test on %s: is %s < %s"%(field,thisval,val))
      if thisval < val:
        logging.debug("lt test result %s: is %s < %s"%(field,thisval,val))
        yield tiddler
      
        
    return

def gt(command, tiddlers):
    logging.debug("isit %s"%command)
    field_and_val = command.split(":")
    # un_generate the tiddlers so we can use the list multiple times
    tiddlers = list(tiddlers)
    field = field_and_val[0]
    val = float(field_and_val[1])
    for tiddler in tiddlers:
      if field in tiddler.fields:
        thisval = float(tiddler.fields[field])
      else:
        thisval = 0
      logging.debug("gt test on %s: is %s > %s"%(field,thisval,val))
      if  thisval > val:
        logging.debug("gt test result %s: is %s < %s"%(field,thisval,val))
        yield tiddler

    return

def lt_parse(command):
    def selector(tiddlers, indexable=False, environ={}):
        return lt(command, tiddlers)
    return selector
def gt_parse(command):
    def selector(tiddlers, indexable=False, environ={}):
        return gt(command, tiddlers)
    return selector

FILTER_PARSERS['lt'] = lt_parse
FILTER_PARSERS['gt'] = gt_parse

def init(config):
    pass
