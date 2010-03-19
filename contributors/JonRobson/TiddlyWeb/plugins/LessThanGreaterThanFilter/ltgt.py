"""
Provides TiddlyWeb filters for numeric comparisons (less/greater than)

Usage:
  ?lt=myfield:5&gt=myfield:2
This will match tiddlers whose "myfield" has a numeric value between 2 and 5.

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


def lt(command, tiddlers):
    field, val = command.split(':')
    val = float(val)
    # un-generate the tiddlers so we can use the list multiple times
    tiddlers = list(tiddlers)
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
    val = float(val)
    # un_generate the tiddlers so we can use the list multiple times
    tiddlers = list(tiddlers)
    
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
