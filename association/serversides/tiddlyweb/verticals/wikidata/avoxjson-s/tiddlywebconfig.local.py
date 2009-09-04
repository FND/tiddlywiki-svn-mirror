config = {
        'server_store': ['sql', {'db_config': 'sqlite:///store.db'}],
        'css_uri': 'http://peermore.com/tiddlyweb.css',
        'secret': 'the bees are in the what',
        'system_plugins': ['status', 'static', 'wikidataSerializer', 'editSerializer', 'challengeSerializer', 'methodhack', 'pathinfohack', 'formreader', 'routes'],
        'static_url_dir': 'static',
        'static_file_dir': 'static',
        'server_host': {
            'scheme': 'http',
            'host': 'localhost',
            #'host': '0.0.0.0',
            'port': '3000',
            },
        'wikitext_render_map': {
            'text/json': 'jsonhtml',
            'text/x-json': 'jsonhtml',
            },
        'maps_api_key': 'ABQIAAAAwvFhEUtSIa3VRWVU970fZRTFoq1F38kgVdr6NeB-ovQyAo_s0RT9mvrcXyHbFG--L-Mkekf4hbw0hQ', # localhost
        #'maps_api_key': 'ABQIAAAA3nIPLQx3D1xrrdHGgda7eBTFoq1F38kgVdr6NeB-ovQyAo_s0RRiw7M5J8BxIGm9ZTfWZcn0iKrB0Q', # http://avoxjson-s.peermore.com/
        'log_level': 'DEBUG',
    'sqlsearch.main_fields': ['fields:legal_name', 'fields:trades_as_name(s)', 'fields:previous_name(s)'],

        }
