from whoosh.fields import Schema, ID, KEYWORD, TEXT
config = {
        'server_store': ['sql', {'db_config': 'sqlite:///store.db'}],
        'css_uri': 'http://peermore.com/tiddlyweb.css',
        'secret': 'the bees are in the what',
        'twanager_plugins': ['whoosher'],
        'system_plugins': ['status', 'static', 'wikidataSerializer', 'editSerializer', 'challengeSerializer', 'requestSerializer', 'methodhack', 'pathinfohack', 'formreader', 'routes', 'whoosher'],
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
        #'maps_api_key': 'ABQIAAAAwvFhEUtSIa3VRWVU970fZRTFoq1F38kgVdr6NeB-ovQyAo_s0RT9mvrcXyHbFG--L-Mkekf4hbw0hQ', # localhost
        #'maps_api_key': 'ABQIAAAA3nIPLQx3D1xrrdHGgda7eBTFoq1F38kgVdr6NeB-ovQyAo_s0RRiw7M5J8BxIGm9ZTfWZcn0iKrB0Q', # http://avoxjson-s.peermore.com/
        'maps_api_key': 'ABQIAAAAfIA5i-5lcivJMUvTzLDrmxQg7wZe1qASdla1M-DFyiqfOoWRghT6gGJohIOLIoy-3oR7sKWQfPvlxA', # http://wiki-data.com/
        'log_level': 'DEBUG',
        'wsearch.schema': {'title': TEXT,
            'id': ID(stored=True, unique=True),
            'bag': TEXT,
            'text': TEXT,
            'modified': ID,
            'modifier': ID,
            'created': ID,
            'tags': KEYWORD,
            'avid': ID,
            'legal_name': TEXT,
            'previous_name(s)': TEXT,
            'trades_as_name(s)': TEXT,
            'trading_status': TEXT,
            'company_website': TEXT,
            'operational_po_box': TEXT,
            'operational_floor': TEXT,
            'operational_building': TEXT,
            'operational_street_1': TEXT,
            'operational_street_2': TEXT,
            'operational_street_3': TEXT,
            'operational_city': TEXT,
            'operational_state': TEXT,
            'operational_country': ID,
            'country_of_registration': ID,
            'operational_postcode': TEXT
        },
        'wsearch.default_fields': [
            'legal_name',
            'previous_name(s)',
            'trades_as_name(s)'],
        }

