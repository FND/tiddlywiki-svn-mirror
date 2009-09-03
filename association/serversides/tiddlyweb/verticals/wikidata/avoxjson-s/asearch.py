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
    for key, values in query_dict.items():
        if key in IGNORE_PARAMS:
            continue
        if key == 'q':
            terms.extend(values)
        else:
            for value in values:
                if ' ' in key or ' ' in value:
                    terms.append('"%s:%s"' % (key, value))
                else:
                    terms.append('%s:%s' % (key, value))
    return ' '.join(terms)


def test():
    d = dict(q=['"hey monkey" fight:harder'], ace=['trollop'])
    result = query_dict_to_search_string(d)
    print result


if __name__ == '__main__':
    test()

