config = {
        'auth_systems': ['login_form'],
        'server_store': ['diststore', { 
             'main': ['text', {'store_root': 'store'}], 
             'extras': [ 
                 (r'^avox$', ['mappingsql', {'db_config': 'mysql://avox@localhost/avox?charset=utf8'}]), 
                     ], 
                 }],
        # 'server_store': ['mappingsql', {'db_config': 'mysql://avox@localhost/avox?charset=utf8'}],
        'css_uri': 'http://peermore.com/tiddlyweb.css',
        'secret': 'the bees are in the what',
        'system_plugins': ['status', 'wikidataSerializer', 'challengeSerializer', 'requestSerializer', 'methodhack', 'pathinfohack', 'routes', 'static', 'logout'],
        'server_host': {
            'scheme': 'http',
            'host': 'wiki-data.com',
            'port': '80',
            },
        'wikitext_render_map': {
            'text/json': 'jsonhtml',
            'text/x-json': 'jsonhtml',
            },
        'maps_api_key': 'ABQIAAAAfIA5i-5lcivJMUvTzLDrmxQg7wZe1qASdla1M-DFyiqfOoWRghT6gGJohIOLIoy-3oR7sKWQfPvlxA', # http://wiki-data.com/
        'log_level': 'DEBUG',
        'mappingsql.table': 'avox',
        'mappingsql.bag': 'avox',
        'mappingsql.id_column': 'avid',
        'mappingsql.open_fields': [
             'avid',
             'legal_name',
             'previous_name_s_',
             'trades_as_name_s_',
             'trading_status',
             'company_website',
             'registered_country',
             'operational_po_box',
             'operational_floor',
             'operational_building',
             'operational_street_1',
             'operational_street_2',
             'operational_street_3',
             'operational_city',
             'operational_state',
             'operational_country',
             'operational_postcode'
        ],
        'mappingsql.default_search_fields': [
             'legal_name',
             'previous_name_s_',
             'trades_as_name_s_',
        ],
        'mappingsql.full_text': True,
        'mappingsql.limit': 51,
        }

