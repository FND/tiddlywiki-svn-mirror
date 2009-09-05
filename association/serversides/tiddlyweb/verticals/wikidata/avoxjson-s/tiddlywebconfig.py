config = {
        'server_store': ['sql', {'db_config': 'sqlite:///store.db'}],
        'css_uri': 'http://peermore.com/tiddlyweb.css',
        'secret': 'the bees are in the what',
        'system_plugins': ['status', 'static', 'wikidataSerializer', 'editSerializer', 'challengeSerializer', 'requestSerializer', 'methodhack', 'pathinfohack', 'formreader', 'routes', 'asearch'],
        'static_url_dir': 'static',
        'static_file_dir': 'static',
        'server_host': {
            'scheme': 'http',
            'host': '217.9.192.9',
            #'host': '0.0.0.0',
            'port': '8080',
            },
        'wikitext_render_map': {
            'text/json': 'jsonhtml',
            'text/x-json': 'jsonhtml',
            },
        'maps_api_key': 'ABQIAAAAwvFhEUtSIa3VRWVU970fZRTFoq1F38kgVdr6NeB-ovQyAo_s0RT9mvrcXyHbFG--L-Mkekf4hbw0hQ', # localhost
        #'maps_api_key': 'ABQIAAAA3nIPLQx3D1xrrdHGgda7eBTFoq1F38kgVdr6NeB-ovQyAo_s0RRiw7M5J8BxIGm9ZTfWZcn0iKrB0Q', # http://avoxjson-s.peermore.com/
        'log_level': 'DEBUG',
    'sqlsearch.main_fields': [u'fields:legal_name', u'fields:trades_as_name(s)', u'fields:previous_name(s)'],
    'sqlsearch.order_field': 'fields:legal_name',

        }

