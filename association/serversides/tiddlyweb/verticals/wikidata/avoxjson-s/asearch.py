"""
Replace the /search handler with one that does
a few different things
"""

import logging

from tiddlywebplugins import replace_handler

from tiddlyweb import control
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.policy import ForbiddenError, UserRequiredError
from tiddlyweb.web.sendtiddlers import send_tiddlers

IGNORE_PARAMS = []

def init(config):
    replace_handler(config['selector'], '/search', dict(GET=search))


def search(environ, start_response):
    search_query = query_dict_to_search_string(
            environ['tiddlyweb.query']) or ''

    filters = environ['tiddlyweb.filters']
    store = environ['tiddlyweb.store']
    usersign = environ['tiddlyweb.usersign']

    tmp_bag = Bag('tmp_bag', tmpbag=True, searchbag=True)
    bag_readable = {}

    tiddlers = []
    if search_query:
        logging.debug('search query is %s' % search_query)
        tiddlers = store.search(search_query)
        logging.debug('got search results from store')

    for tiddler in tiddlers:
        try:
            if bag_readable[tiddler.bag]:
                tmp_bag.add_tiddler(store.get(tiddler))
        except KeyError:
            bag = Bag(tiddler.bag)
            bag.skinny = True
            bag = store.get(bag)
            try:
                bag.policy.allows(usersign, 'read')
                tmp_bag.add_tiddler(store.get(tiddler))
                bag_readable[tiddler.bag] = True
            except(ForbiddenError, UserRequiredError):
                bag_readable[tiddler.bag] = False

    if len(filters):
        tiddlers = control.filter_tiddlers_from_bag(tmp_bag, filters)
        tmp_bag = Bag('tmp_bag', tmpbag=True, searchbag=True)
        tmp_bag.add_tiddlers(tiddlers)

    # XXX hack to ensure at least one tiddler
    tmp_bag.add_tiddler(Tiddler('stub', 'avox'))

    return send_tiddlers(environ, start_response, tmp_bag)


def query_dict_to_search_string(query_dict):
    terms = []
    while query_dict:
        keys = query_dict.keys()
        key = keys.pop()
        values = query_dict[key]
        del query_dict[key]
        if key in IGNORE_PARAMS:
            continue

        if key == 'q':
            terms.extend(values)
        else:
            if key.endswith('_field'):
                prefix = key.rsplit('_', 1)[0]
                value_key = '%s_value' % prefix
                key = values[0].lower().replace(' ', '_')
                try:
                    values = query_dict[value_key]
                    del query_dict[value_key]
                except KeyError:
                    values = []
                if not values:
                    continue
            elif key.endswith('_value'):
                prefix = key.rsplit('_', 1)[0]
                field_key = '%s_field' % prefix
                try:
                    key = query_dict[field_key][0].lower().replace(' ', '_')
                    del query_dict[field_key]
                except KeyError:
                    key = ''
                if not key:
                    continue

            if key == 'avid' and not values[0].isdigit():
                continue

            for value in values:
                if ' ' in key or ' ' in value:
                    terms.append('"%s:%s"' % (key, value))
                else:
                    terms.append('%s:%s' % (key, value))
    return ' '.join(terms)


def test():
    e = dict(q=['ace'], avid=['57'], adv_1_field=['Country of incorporation'],
            adv_1_value=['GBR'])
    result = query_dict_to_search_string(e)
    print result


if __name__ == '__main__':
    test()

