"""
Replace the /search handler with one that does
a few different things
"""

import logging

from tiddlyweb.web.handler.search import get
from tiddlywebplugins import replace_handler

IGNORE_PARAMS = []

def init(config):
    replace_handler(config['selector'], '/search', dict(GET=search))


def search(environ, start_response):
    search_string = query_dict_to_search_string(
            environ['tiddlyweb.query']) or ''
    logging.debug('search string is %s' % search_string)
    environ['tiddlyweb.query']['q'] = [search_string]
    return get(environ, start_response)


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
                key = values[0]
                values = query_dict[value_key]
                del query_dict[value_key]
            elif key.endswith('_value'):
                prefix = key.rsplit('_', 1)[0]
                field_key = '%s_field' % prefix
                key = query_dict[field_key][0]
                del query_dict[field_key]

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

