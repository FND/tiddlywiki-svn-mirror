CREATE TABLE IF NOT EXISTS avox (
	avid INTEGER NOT NULL,
	avox_match_status VARCHAR(256),
	avox_entity_class VARCHAR(256),
	avox_entity_type VARCHAR(256),
	record_source VARCHAR(256),
	legal_name VARCHAR(256),
	previous_name_s_ VARCHAR(256),
	trades_as_name_s_ VARCHAR(256),
	name_notes VARCHAR(256),
	legal_form VARCHAR(256),
	trading_status VARCHAR(256),
	swift_bic VARCHAR(256),
	vat_number VARCHAR(256),
	tax_payer_id VARCHAR(256),
	company_website VARCHAR(256),
	regulated_by VARCHAR(256),
	regulator_id VARCHAR(256),
	regulatory_status VARCHAR(256),
	registration_authority VARCHAR(256),
	registration_number__operational_ VARCHAR(256),
	registration_number__jurisdiction_ VARCHAR(256),
	date_of_registration VARCHAR(256),
	date_of_dissolution VARCHAR(256),
	issuer_flag VARCHAR(256),
	primary_listing_exchange VARCHAR(256),
	ticker_code VARCHAR(256),
	cabre VARCHAR(256),
	fiscal_year_end VARCHAR(256),
	mifid_source VARCHAR(256),
	balance_sheet_date VARCHAR(256),
	balance_sheet_currency VARCHAR(256),
	balance_sheet_total VARCHAR(256),
	annual_net_turnover VARCHAR(256),
	own_funds VARCHAR(256),
	operational_po_box VARCHAR(256),
	operational_floor VARCHAR(256),
	operational_building VARCHAR(256),
	operational_street_1 VARCHAR(256),
	operational_street_2 VARCHAR(256),
	operational_street_3 VARCHAR(256),
	operational_city VARCHAR(256),
	operational_state VARCHAR(256),
	operational_country VARCHAR(256),
	operational_postcode VARCHAR(256),
	operational_address_notes VARCHAR(256),
	registered_agent_name VARCHAR(256),
	registered_po_box VARCHAR(256),
	registered_floor VARCHAR(256),
	registered_building VARCHAR(256),
	registered_street_1 VARCHAR(256),
	registered_street_2 VARCHAR(256),
	registered_street_3 VARCHAR(256),
	registered_city VARCHAR(256),
	registered_state VARCHAR(256),
	registered_country VARCHAR(256),
	registered_postcode VARCHAR(256),
	registered_address_notes VARCHAR(256),
	naics_code VARCHAR(256),
	naics_description VARCHAR(256),
	us_sic_code VARCHAR(256),
	us_sic_description VARCHAR(256),
	nace_code VARCHAR(256),
	nace_description VARCHAR(256),
	entity_type VARCHAR(256),
	immediate_parent_avid VARCHAR(256),
	immediate_parent_name VARCHAR(256),
	immediate_parent_percentage_ownership VARCHAR(256),
	immediate_parent_notes VARCHAR(256),
	ultimate_parent_avid VARCHAR(256),
	ultimate_parent_name VARCHAR(256),
	ultimate_parent_notes VARCHAR(256),
	general_notes VARCHAR(256),
	PRIMARY KEY (avid)
)
CHARACTER SET utf8;
