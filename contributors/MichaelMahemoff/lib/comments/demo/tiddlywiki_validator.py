from tiddlyweb.web.validator import TIDDLER_VALIDATORS              
from tiddlyweb.model.tiddler import Tiddler

"""
sanitise all tiddlywiki input by dissallowing reserved names, and clearing systemConfig tags.

Any tiddler in RESERVED_TITLES will be dissallowed.
"""

RESERVED_TITLES=[
    'MarkupPreHead',
    'MarkupPostBody'
] 

def validate_tiddlywiki(tiddler,environ):     
    if tiddler.title in RESERVED_TITLES:
        raise Exception('Reserved name')
    if 'systemConfig' in tiddler.tags:
        tiddler.tags.remove('systemConfig')

def init(config_in):
    """
    init function
    """
    TIDDLER_VALIDATORS.append(validate_tiddlywiki)

