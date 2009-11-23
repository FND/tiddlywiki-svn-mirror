import logging

recordFields = [
('avox_match_status', 'Avox Match Status'),
('avox_entity_class', 'Avox Entity Class'),
('avox_entity_type', 'Avox Entity Type'),
('record_source', 'Record Source'),
('legal_name', 'Legal Name'),
('previous_name_s_', 'Previous Name(s)'),
('trades_as_name_s_', 'Trades As Name(s)'),
('name_notes', 'Name Notes'),
('legal_form', 'Legal Form'),
('trading_status', 'Trading Status'),
('swift_bic', 'SWIFT BIC'),
('vat_number', 'VAT Number'),
('tax_payer_id', 'Tax Payer ID'),
('company_website', 'Company Website'),
('regulated_by', 'Registered By'),
('regulator_id', 'Regulator ID'),
('regulatory_status', 'Regulatory Status'),
('registration_authority', 'Registration Authority'),
('registration_number__operational_', 'Registration Number (Operational)'),
('registration_number__jurisdiction_', 'Registration Number (Jurisdiction)'),
('date_of_registration', 'Date Of Registration'),
('date_of_dissolution', 'Date Of Dissolution'),
('issuer_flag', 'Issuer Flag'),
('primary_listing_exchange', 'Primary Listing Exchange'),
('ticker_code', 'Ticker Code'),
('cabre', 'CABRE'),
('fiscal_year_end', 'Fiscal Year End'),
('mifid_source', 'MIFID Source'),
('balance_sheet_date', 'Balance Sheet Date'),
('balance_sheet_currency', 'Balance Sheet Currency'),
('balance_sheet_total', 'Balance Sheet Total'),
('annual_net_turnover', 'Balance Sheet Turnover'),
('own_funds', 'Own Funds'),
('operational_po_box', 'Operational PO Box'),
('operational_floor', 'Operational Floor'),
('operational_building', 'Operational Building'),
('operational_street_1', 'Operational Street 1'),
('operational_street_2', 'Operational Street 2'),
('operational_street_3', 'Operational Street 3'),
('operational_city', 'Operational City'),
('operational_state', 'Operational State'),
('operational_country', 'Operational Country'),
('operational_postcode', 'Operational Postcode'),
('operational_address_notes', 'Operational Address Notes'),
('registered_agent_name', 'Registered Agent Name'),
('registered_po_box', 'Registered PO Box'),
('registered_floor', 'Registered Floor'),
('registered_building', 'Registered Building'),
('registered_street_1', 'Registered Street 1'),
('registered_street_2', 'Registered Street 2'),
('registered_street_3', 'Registered Street 3'),
('registered_city', 'Registered City'),
('registered_state', 'Registered State'),
('registered_country', 'Registered Country'),
('registered_postcode', 'Registered Postcode'),
('registered_address_notes', 'Registered Address Notes'),
('naics_code', 'NAICS Code'),
('naics_description', 'NAICS Description'),
('us_sic_code', 'US SIC Code'),
('us_sic_description', 'US SIC Description'),
('nace_code', 'NACE Code'),
('nace_description', 'NACE Description'),
('entity_type', 'Entity Type'),
('immediate_parent_avid', 'Immediate Parent AVID'),
('immediate_parent_name', 'Immediate Parent Name'),
('immediate_parent_percentage_ownership', 'Immediate Parent Percentage Ownership'),
('immediate_parent_notes', 'Immediate Parent Notes'),
('ultimate_parent_avid', 'Ultimate Parent AVID'),
('ultimate_parent_name', 'Ultimate Parent Name'),
('ultimate_parent_notes', 'Ultimate Parent Notes'),
('general_notes', 'General Notes')];

def getFields(environ):
    fields = []
    openfields = environ['tiddlyweb.config']['mappingsql.open_fields']
    loginName = environ['tiddlyweb.usersign']['name']
    accessLevel = 0
    if loginName != 'GUEST':
        accessLevel = 1
    for field, label in recordFields:
        if accessLevel == 0:
            if field in openfields:
                fields.append((field,label))
        else:
            fields.append((field,label))
    logging.debug('fields passed: '+str(fields))
    return fields