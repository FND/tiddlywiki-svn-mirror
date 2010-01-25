EXTENSION_TYPES = {'wikip': 'text/html+x','atomp': 'application/atom+xml+x'}
SERIALIZERS = {'application/atom+xml+x': ['twp.watom', 'application/atom+xml+x; charset=UTF-8'],'text/html+x': ['twp.twpwiki', 'text/html; charset=UTF-8']}
def init(config):
    config['extension_types'].update(EXTENSION_TYPES)    
    config['serializers'].update(SERIALIZERS)
