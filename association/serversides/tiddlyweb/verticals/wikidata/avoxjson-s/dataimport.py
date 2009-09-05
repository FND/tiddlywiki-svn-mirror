#!/usr/bin/env python

from tiddlywebplugins import get_store

from tiddlyweb.model.bag import Bag
from tiddlyweb.model.tiddler import Tiddler

from tiddlyweb.store import NoBagError, NoTiddlerError

from tiddlyweb.config import config

import simplejson

import codecs
import sys
import os
import csv

BAG_NAME = u'avox'

def importer(filename, size, func):
    reader = csv.DictReader(open(filename), delimiter='~')

    store = get_store(config)

    _ensure_bag(BAG_NAME, store)
    for info in reader:
        try:
            _set_tiddler(info, store, func)
        except TypeError:
            print >>sys.stderr, "got type error on %s" % info['avid']

def _set_tiddler(info, store, func):
    # cleanup the input
    data = {}
    for key, value in info.items():
        if key and value:
            data[unicode(key, 'utf-8')] = unicode(value, 'utf-8')

    func(data, store)


def _ensure_bag(bag_name, store):
    bag = Bag(bag_name)
    try:
        bag.skinny = True
        bag = store.get(bag)
    except NoBagError:
        store.put(bag)


def _set_json_tiddler(info, store):
    tiddler_name = info['avid']

    tiddler = Tiddler(tiddler_name, BAG_NAME)
    #tiddler.type = 'text/x-json'
    for key, value in info.items():
        tiddler.fields[key] = value
    try:
        store.put(tiddler)
        print '.',
    except (NoTiddlerError, OSError), exc:
        print >> sys.stderr, 'unable to write the tiddler %s: %s' % (tiddler.title.encode('utf-8'), exc), 


def _set_text_tiddler(info, store):
    tiddler_name = info['avid']

    tiddler = Tiddler(tiddler_name, BAG_NAME)
    tiddler.text = unicode(simplejson.dumps(info), 'utf-8')
    tiddler.type = 'text/json'
    try:
        store.put(tiddler)
        print '.',
    except (NoTiddlerError, OSError), exc:
        print >> sys.stderr, 'unable to write the tiddler %s: %s' % (tiddler.title.encode('utf-8'), exc), 


if __name__ == '__main__':
    #importer(sys.argv[1], 100, _set_text_tiddler)
    #importer(sys.argv[1], 1000, _set_text_tiddler)
    importer(sys.argv[1], 100, _set_json_tiddler)
    #importer(sys.argv[1], 1000, _set_json_tiddler)

