/* app.js */
// override search links to use ajax_search as soon as possible
$('a[href^="/search"]').each(function() {
	var href = $(this).attr('href');
	$(this).attr('href', href.replace("/search", "/pages/ajax_search"));
});
function parseQueryString(q) {
	var params = {};
	if(q.charAt(0)==="?") {
		q=q.substring(1);
	}
	q=decodeURIComponent(q);
	q=q.replace(/\+/g," ");
	var pairs = q.split("&");
	var pair, key, value;
	for(var i=0; i<pairs.length; i++) {
		pair = pairs[i].split("=");
		key = pair[0];
		value = pair[1];
		if(value!=="") {
			if(!params[key]) {
				params[key] = [];
			}
			params[key].push(value);
		}
	}
	return params;
}
function addAdvSearchLine() {
	var lines = $('.advSearchLine').length;
	var i = lines + 1;
	/* keeping this "Any Field" option back until we can support it in search
	<option>Any Field</option>\n
	*/
	var s = '<div class="advSearchLine">\n<select name="adv_'+i+'_field">\n<option>Legal Name</option>\n<option>Previous Name(s)</option>\n<option>Trades As Name(s)</option>\n<option>Trading Status</option>\n<option>Company Website</option>\n<option>Country of Registration</option>\n<option>Operational PO Box</option>\n<option>Operational Floor</option>\n<option>Operational Building</option>\n<option>Operational Street 1</option>\n<option>Operational Street 2</option>\n<option>Operational Street 3</option>\n<option>Operational City</option>\n<option>Operational State</option>\n<option>Operational Country</option>\n<option>Operational Postcode</option>\n</select></div>';
	var t ='<input name="adv_'+i+'_value" id="adv_'+i+'_value" size="35" type="text" />';
	var u ='<a href="javascript:;" class="advanced" id="add_new_adv_'+i+'"><button onclick="return false;">+</button><!--<img src="/static/images/plus_small.gif" />--></a>';
	var $advSearchLine = $(s).appendTo($('#advancedSearchLines'));
	$advSearchLine.append(t).append(u);
	var fieldsToMap = [
		'Country of Registration',
		'Operational Country'
		//'Operational State'
	];
	var filterOnChange = function(elem,selectedIndex) {
		selectedIndex = selectedIndex || $advSearchLine.find('select')[0].selectedIndex;
		/* restore these lines when we can support "Any Field"
		if(selectedIndex===0) { // "Any Field"
			oTable.fnFilter(this.value);
		} else {
			// filter on columns assuming the select input doesn't include the AVID field
			oTable.fnFilter(this.value,selectedIndex);
		}*/
		if(oTable) {
			oTable.fnFilter(elem ? elem.value : "",selectedIndex+1);
			oTable.fixedHeader.fnUpdate();
		}
	};
	$advSearchLine.find('select').change(function() {
		if(this.mapped) {
			if(fieldsToMap.indexOf($(this).val())===-1) {
				filterOnChange(null,this.mapped);
				$(this).next().replaceWith(t);
				$(this).next().keyup(function() {
					filterOnChange(this);
				});
				$advSearchLine.find('input:hidden').remove();
				this.mapped = null;
			}
		} else {
			if(fieldsToMap.indexOf($(this).val())!==-1) {
				var $select = $('<select></select>');
				for(var i in name2iso) {
					$select.append('<option>'+i+'</option>');
				}
				var $input = $advSearchLine.find('input');
				var value = $input.val();
				if(value) {
					$select.val(iso2name[value]);
				}
				var name = $input.replaceWith($select)[0].name;
				$advSearchLine.append($('<input type="hidden" name="'+name+'" id="'+name+'" />'));
				$select
					.attr('name', '_ignore_'+name)
					.change(function() {
						$('#'+name).val(name2iso[this.value]);
						filterOnChange(this);
					});
				this.mapped = $advSearchLine.find('select')[0].selectedIndex;
			}
		}
	});
	$advSearchLine.find('input').keyup(function() {
		filterOnChange(this);
	});
	$('#add_new_adv_'+i).click(function() {
		addAdvSearchLine();
	});
	// reveal if not shown
	var $container = $('#advancedSearchContainer');
	if($container.css('display')==="none") {
		$container.slideDown(250);
		if(oTable) {
			/* have to put this here until FixedHeader can cope with the page changing length after it's been initialised - it's after a timeout because the revealAdvancedSearch function takes that long to complete */
			window.setTimeout(function() {
				oTable.fixedHeader.fnUpdate();
			} ,300);
		}
	}
	return $advSearchLine;
}
$(document).ready(function() {
	// set advanced search on a slider
	$('#search a.advanced').click(function() {
		addAdvSearchLine();
	});
	$('#results .filter a').click(function() {
		addAdvSearchLine();
	});
	// fill in search box and filters with current query
	var q = window.location.search;
	if(q) {
		var params = parseQueryString(q);
		if(params.q) {
			$('#company_search_box').val(params.q.join(" "));
		}
		var advCount = 0;
		for(var i in params) {
			if(i.match(/adv_\d{1,2}_field/)) {
				var val = params[i.replace('_field', '_value')][0];
				if(val) {
					addAdvSearchLine()
						.find('select')
						.val(params[i].join(" "))
						.next()
						.val(val)
						.end()
						.change();
				}
			}
		}
	}
});
window.name2iso = {
	"Afghanistan":	"AFG",
	"&Aring;land Islands":	"ALA",
	"Albania":	"ALB",
	"Algeria":	"DZA",
	"American Samoa":	"ASM",
	"Andorra":	"AND",
	"Angola":	"AGO",
	"Anguilla":	"AIA",
	"Antarctica":	"ATA",
	"Antigua and Barbuda":	"ATG",
	"Argentina":	"ARG",
	"Armenia":	"ARM",
	"Aruba":	"ABW",
	"Australia":	"AUS",
	"Austria":	"AUT",
	"Azerbaijan":	"AZE",
	"Bahamas":	"BHS",
	"Bahrain":	"BHR",
	"Bangladesh":	"BGD",
	"Barbados":	"BRB",
	"Belarus":	"BLR",
	"Belgium":	"BEL",
	"Belize":	"BLZ",
	"Benin":	"BEN",
	"Bermuda":	"BMU",
	"Bhutan":	"BTN",
	"Bolivia, Plurinational State of":	"BOL",
	"Bosnia and Herzegovina":	"BIH",
	"Botswana":	"BWA",
	"Bouvet Island":	"BVT",
	"Brazil":	"BRA",
	"British Indian Ocean Territory":	"IOT",
	"Brunei Darussalam":	"BRN",
	"Bulgaria":	"BGR",
	"Burkina Faso":	"BFA",
	"Burundi":	"BDI",
	"Cambodia":	"KHM",
	"Cameroon":	"CMR",
	"Canada":	"CAN",
	"Cape Verde":	"CPV",
	"Cayman Islands":	"CYM",
	"Central African Republic":	"CAF",
	"Chad":	"TCD",
	"Chile":	"CHL",
	"China":	"CHN",
	"Christmas Island":	"CXR",
	"Cocos (Keeling) Islands":	"CCK",
	"Colombia":	"COL",
	"Comoros":	"COM",
	"Congo":	"COG",
	"Congo, the Democratic Republic of the":	"COD",
	"Cook Islands":	"COK",
	"Costa Rica":	"CRI",
	"C&ocirc;te d'Ivoire":	"CIV",
	"Croatia":	"HRV",
	"Cuba":	"CUB",
	"Cyprus":	"CYP",
	"Czech Republic":	"CZE",
	"Denmark":	"DNK",
	"Djibouti":	"DJI",
	"Dominica":	"DMA",
	"Dominican Republic":	"DOM",
	"Ecuador":	"ECU",
	"Egypt":	"EGY",
	"El Salvador":	"SLV",
	"Equatorial Guinea":	"GNQ",
	"Eritrea":	"ERI",
	"Estonia":	"EST",
	"Ethiopia":	"ETH",
	"Falkland Islands (Malvinas)":	"FLK",
	"Faroe Islands":	"FRO",
	"Fiji":	"FJI",
	"Finland":	"FIN",
	"France":	"FRA",
	"French Guiana":	"GUF",
	"French Polynesia":	"PYF",
	"French Southern Territories":	"ATF",
	"Gabon":	"GAB",
	"Gambia":	"GMB",
	"Georgia":	"GEO",
	"Germany":	"DEU",
	"Ghana":	"GHA",
	"Gibraltar":	"GIB",
	"Greece":	"GRC",
	"Greenland":	"GRL",
	"Grenada":	"GRD",
	"Guadeloupe":	"GLP",
	"Guam":	"GUM",
	"Guatemala":	"GTM",
	"Guernsey":	"GGY",
	"Guinea":	"GIN",
	"Guinea-Bissau":	"GNB",
	"Guyana":	"GUY",
	"Haiti":	"HTI",
	"Heard Island and McDonald Islands":	"HMD",
	"Holy See (Vatican City State)":	"VAT",
	"Honduras":	"HND",
	"Hong Kong":	"HKG",
	"Hungary":	"HUN",
	"Iceland":	"ISL",
	"India":	"IND",
	"Indonesia":	"IDN",
	"Iran, Islamic Republic of":	"IRN",
	"Iraq":	"IRQ",
	"Ireland":	"IRL",
	"Isle of Man":	"IMN",
	"Israel":	"ISR",
	"Italy":	"ITA",
	"Jamaica":	"JAM",
	"Japan":	"JPN",
	"Jersey":	"JEY",
	"Jordan":	"JOR",
	"Kazakhstan":	"KAZ",
	"Kenya":	"KEN",
	"Kiribati":	"KIR",
	"Kuwait":	"KWT",
	"Kyrgyzstan":	"KGZ",
	"Lao People's Democratic Republic":	"LAO",
	"Latvia":	"LVA",
	"Lebanon":	"LBN",
	"Lesotho":	"LSO",
	"Liberia":	"LBR",
	"Libyan Arab Jamahiriya":	"LBY",
	"Liechtenstein":	"LIE",
	"Lithuania":	"LTU",
	"Luxembourg":	"LUX",
	"Macao":	"MAC",
	"Macedonia, the former Yugoslav Republic of":	"MKD",
	"Madagascar":	"MDG",
	"Malawi":	"MWI",
	"Malaysia":	"MYS",
	"Maldives":	"MDV",
	"Mali":	"MLI",
	"Malta":	"MLT",
	"Marshall Islands":	"MHL",
	"Martinique":	"MTQ",
	"Mauritania":	"MRT",
	"Mauritius":	"MUS",
	"Mayotte":	"MYT",
	"Mexico":	"MEX",
	"Micronesia, Federated States of":	"FSM",
	"Moldova, Republic of":	"MDA",
	"Monaco":	"MCO",
	"Mongolia":	"MNG",
	"Montenegro":	"MNE",
	"Montserrat":	"MSR",
	"Morocco":	"MAR",
	"Mozambique":	"MOZ",
	"Myanmar":	"MMR",
	"Namibia":	"NAM",
	"Nauru":	"NRU",
	"Nepal":	"NPL",
	"Netherlands":	"NLD",
	"Netherlands Antilles":	"ANT",
	"New Caledonia":	"NCL",
	"New Zealand":	"NZL",
	"Nicaragua":	"NIC",
	"Niger":	"NER",
	"Nigeria":	"NGA",
	"Niue":	"NIU",
	"Norfolk Island":	"NFK",
	//"Korea, Democratic People's Republic of":	"PRK",
	"North Korea":	"PRK",
	"Northern Mariana Islands":	"MNP",
	"Norway":	"NOR",
	"Oman":	"OMN",
	"Pakistan":	"PAK",
	"Palau":	"PLW",
	"Palestinian Territory, Occupied":	"PSE",
	"Panama":	"PAN",
	"Papua New Guinea":	"PNG",
	"Paraguay":	"PRY",
	"Peru":	"PER",
	"Philippines":	"PHL",
	"Pitcairn":	"PCN",
	"Poland":	"POL",
	"Portugal":	"PRT",
	"Puerto Rico":	"PRI",
	"Qatar":	"QAT",
	"R&eacute;union":	"REU",
	"Romania":	"ROU",
	"Russian Federation":	"RUS",
	"Rwanda":	"RWA",
	"Saint Barth&eacute;lemy":	"BLM",
	"Saint Helena":	"SHN",
	"Saint Kitts and Nevis":	"KNA",
	"Saint Lucia":	"LCA",
	"Saint Martin (French part)":	"MAF",
	"Saint Pierre and Miquelon":	"SPM",
	"Saint Vincent and the Grenadines":	"VCT",
	"Samoa":	"WSM",
	"San Marino":	"SMR",
	"Sao Tome and Principe":	"STP",
	"Saudi Arabia":	"SAU",
	"Senegal":	"SEN",
	"Serbia":	"SRB",
	"Seychelles":	"SYC",
	"Sierra Leone":	"SLE",
	"Singapore":	"SGP",
	"Slovakia":	"SVK",
	"Slovenia":	"SVN",
	"Solomon Islands":	"SLB",
	"Somalia":	"SOM",
	"South Africa":	"ZAF",
	"South Georgia and the South Sandwich Islands":	"SGS",
	//"Korea, Republic of":	"KOR",
	"South Korea":	"KOR",
	"Spain":	"ESP",
	"Sri Lanka":	"LKA",
	"Sudan":	"SDN",
	"Suriname":	"SUR",
	"Svalbard and Jan Mayen":	"SJM",
	"Swaziland":	"SWZ",
	"Sweden":	"SWE",
	"Switzerland":	"CHE",
	"Syrian Arab Republic":	"SYR",
	"Taiwan, Province of China":	"TWN",
	"Tajikistan":	"TJK",
	"Tanzania, United Republic of":	"TZA",
	"Thailand":	"THA",
	"Timor-Leste":	"TLS",
	"Togo":	"TGO",
	"Tokelau":	"TKL",
	"Tonga":	"TON",
	"Trinidad and Tobago":	"TTO",
	"Tunisia":	"TUN",
	"Turkey":	"TUR",
	"Turkmenistan":	"TKM",
	"Turks and Caicos Islands":	"TCA",
	"Tuvalu":	"TUV",
	"Uganda":	"UGA",
	"Ukraine":	"UKR",
	"United Arab Emirates":	"ARE",
	"United Kingdom":	"GBR",
	"United States":	"USA",
	"United States Minor Outlying Islands":	"UMI",
	"Uruguay":	"URY",
	"Uzbekistan":	"UZB",
	"Vanuatu":	"VUT",
	"Venezuela, Bolivarian Republic of":	"VEN",
	"Viet Nam":	"VNM",
	"Virgin Islands, British":	"VGB",
	"Virgin Islands, U.S.":	"VIR",
	"Wallis and Futuna":	"WLF",
	"Western Sahara":	"ESH",
	"Yemen":	"YEM",
	"Zambia":	"ZMB",
	"Zimbabwe":	"ZWE"
};
window.iso2name = {
	"ABW":	"Aruba",
	"AFG":	"Afghanistan",
	"AGO":	"Angola",
	"AIA":	"Anguilla",
	"ALA":	"&Aring;land Islands",
	"ALB":	"Albania",
	"AND":	"Andorra",
	"ANT":	"Netherlands Antilles",
	"ARE":	"United Arab Emirates",
	"ARG":	"Argentina",
	"ARM":	"Armenia",
	"ASM":	"American Samoa",
	"ATA":	"Antarctica",
	"ATF":	"French Southern Territories",
	"ATG":	"Antigua and Barbuda",
	"AUS":	"Australia",
	"AUT":	"Austria",
	"AZE":	"Azerbaijan",
	"BDI":	"Burundi",
	"BEL":	"Belgium",
	"BEN":	"Benin",
	"BFA":	"Burkina Faso",
	"BGD":	"Bangladesh",
	"BGR":	"Bulgaria",
	"BHR":	"Bahrain",
	"BHS":	"Bahamas",
	"BIH":	"Bosnia and Herzegovina",
	"BLM":	"Saint Barth&eacute;lemy",
	"BLR":	"Belarus",
	"BLZ":	"Belize",
	"BMU":	"Bermuda",
	"BOL":	"Bolivia, Plurinational State of",
	"BRA":	"Brazil",
	"BRB":	"Barbados",
	"BRN":	"Brunei Darussalam",
	"BTN":	"Bhutan",
	"BVT":	"Bouvet Island",
	"BWA":	"Botswana",
	"CAF":	"Central African Republic",
	"CAN":	"Canada",
	"CCK":	"Cocos (Keeling) Islands",
	"CHE":	"Switzerland",
	"CHL":	"Chile",
	"CHN":	"China",
	"CIV":	"C&ocirc;te d'Ivoire",
	"CMR":	"Cameroon",
	"COD":	"Congo, the Democratic Republic of the",
	"COG":	"Congo",
	"COK":	"Cook Islands",
	"COL":	"Colombia",
	"COM":	"Comoros",
	"CPV":	"Cape Verde",
	"CRI":	"Costa Rica",
	"CUB":	"Cuba",
	"CXR":	"Christmas Island",
	"CYM":	"Cayman Islands",
	"CYP":	"Cyprus",
	"CZE":	"Czech Republic",
	"DEU":	"Germany",
	"DJI":	"Djibouti",
	"DMA":	"Dominica",
	"DNK":	"Denmark",
	"DOM":	"Dominican Republic",
	"DZA":	"Algeria",
	"ECU":	"Ecuador",
	"EGY":	"Egypt",
	"ERI":	"Eritrea",
	"ESH":	"Western Sahara",
	"ESP":	"Spain",
	"EST":	"Estonia",
	"ETH":	"Ethiopia",
	"FIN":	"Finland",
	"FJI":	"Fiji",
	"FLK":	"Falkland Islands (Malvinas)",
	"FRA":	"France",
	"FRO":	"Faroe Islands",
	"FSM":	"Micronesia, Federated States of",
	"GAB":	"Gabon",
	"GBR":	"United Kingdom",
	"GEO":	"Georgia",
	"GGY":	"Guernsey",
	"GHA":	"Ghana",
	"GIB":	"Gibraltar",
	"GIN":	"Guinea",
	"GLP":	"Guadeloupe",
	"GMB":	"Gambia",
	"GNB":	"Guinea-Bissau",
	"GNQ":	"Equatorial Guinea",
	"GRC":	"Greece",
	"GRD":	"Grenada",
	"GRL":	"Greenland",
	"GTM":	"Guatemala",
	"GUF":	"French Guiana",
	"GUM":	"Guam",
	"GUY":	"Guyana",
	"HKG":	"Hong Kong",
	"HMD":	"Heard Island and McDonald Islands",
	"HND":	"Honduras",
	"HRV":	"Croatia",
	"HTI":	"Haiti",
	"HUN":	"Hungary",
	"IDN":	"Indonesia",
	"IMN":	"Isle of Man",
	"IND":	"India",
	"IOT":	"British Indian Ocean Territory",
	"IRL":	"Ireland",
	"IRN":	"Iran, Islamic Republic of",
	"IRQ":	"Iraq",
	"ISL":	"Iceland",
	"ISR":	"Israel",
	"ITA":	"Italy",
	"JAM":	"Jamaica",
	"JEY":	"Jersey",
	"JOR":	"Jordan",
	"JPN":	"Japan",
	"KAZ":	"Kazakhstan",
	"KEN":	"Kenya",
	"KGZ":	"Kyrgyzstan",
	"KHM":	"Cambodia",
	"KIR":	"Kiribati",
	"KNA":	"Saint Kitts and Nevis",
	"KOR":	"Korea, Republic of",
	"KWT":	"Kuwait",
	"LAO":	"Lao People's Democratic Republic",
	"LBN":	"Lebanon",
	"LBR":	"Liberia",
	"LBY":	"Libyan Arab Jamahiriya",
	"LCA":	"Saint Lucia",
	"LIE":	"Liechtenstein",
	"LKA":	"Sri Lanka",
	"LSO":	"Lesotho",
	"LTU":	"Lithuania",
	"LUX":	"Luxembourg",
	"LVA":	"Latvia",
	"MAC":	"Macao",
	"MAF":	"Saint Martin (French part)",
	"MAR":	"Morocco",
	"MCO":	"Monaco",
	"MDA":	"Moldova, Republic of",
	"MDG":	"Madagascar",
	"MDV":	"Maldives",
	"MEX":	"Mexico",
	"MHL":	"Marshall Islands",
	"MKD":	"Macedonia, the former Yugoslav Republic of",
	"MLI":	"Mali",
	"MLT":	"Malta",
	"MMR":	"Myanmar",
	"MNE":	"Montenegro",
	"MNG":	"Mongolia",
	"MNP":	"Northern Mariana Islands",
	"MOZ":	"Mozambique",
	"MRT":	"Mauritania",
	"MSR":	"Montserrat",
	"MTQ":	"Martinique",
	"MUS":	"Mauritius",
	"MWI":	"Malawi",
	"MYS":	"Malaysia",
	"MYT":	"Mayotte",
	"NAM":	"Namibia",
	"NCL":	"New Caledonia",
	"NER":	"Niger",
	"NFK":	"Norfolk Island",
	"NGA":	"Nigeria",
	"NIC":	"Nicaragua",
	"NIU":	"Niue",
	"NLD":	"Netherlands",
	"NOR":	"Norway",
	"NPL":	"Nepal",
	"NRU":	"Nauru",
	"NZL":	"New Zealand",
	"OMN":	"Oman",
	"PAK":	"Pakistan",
	"PAN":	"Panama",
	"PCN":	"Pitcairn",
	"PER":	"Peru",
	"PHL":	"Philippines",
	"PLW":	"Palau",
	"PNG":	"Papua New Guinea",
	"POL":	"Poland",
	"PRI":	"Puerto Rico",
	"PRK":	"Korea, Democratic People's Republic of",
	"PRT":	"Portugal",
	"PRY":	"Paraguay",
	"PSE":	"Palestinian Territory, Occupied",
	"PYF":	"French Polynesia",
	"QAT":	"Qatar",
	"REU":	"R&eacute;union",
	"ROU":	"Romania",
	"RUS":	"Russian Federation",
	"RWA":	"Rwanda",
	"SAU":	"Saudi Arabia",
	"SDN":	"Sudan",
	"SEN":	"Senegal",
	"SGP":	"Singapore",
	"SGS":	"South Georgia and the South Sandwich Islands",
	"SHN":	"Saint Helena",
	"SJM":	"Svalbard and Jan Mayen",
	"SLB":	"Solomon Islands",
	"SLE":	"Sierra Leone",
	"SLV":	"El Salvador",
	"SMR":	"San Marino",
	"SOM":	"Somalia",
	"SPM":	"Saint Pierre and Miquelon",
	"SRB":	"Serbia",
	"STP":	"Sao Tome and Principe",
	"SUR":	"Suriname",
	"SVK":	"Slovakia",
	"SVN":	"Slovenia",
	"SWE":	"Sweden",
	"SWZ":	"Swaziland",
	"SYC":	"Seychelles",
	"SYR":	"Syrian Arab Republic",
	"TCA":	"Turks and Caicos Islands",
	"TCD":	"Chad",
	"TGO":	"Togo",
	"THA":	"Thailand",
	"TJK":	"Tajikistan",
	"TKL":	"Tokelau",
	"TKM":	"Turkmenistan",
	"TLS":	"Timor-Leste",
	"TON":	"Tonga",
	"TTO":	"Trinidad and Tobago",
	"TUN":	"Tunisia",
	"TUR":	"Turkey",
	"TUV":	"Tuvalu",
	"TWN":	"Taiwan, Province of China",
	"TZA":	"Tanzania, United Republic of",
	"UGA":	"Uganda",
	"UKR":	"Ukraine",
	"UMI":	"United States Minor Outlying Islands",
	"URY":	"Uruguay",
	"USA":	"United States",
	"UZB":	"Uzbekistan",
	"VAT":	"Holy See (Vatican City State)",
	"VCT":	"Saint Vincent and the Grenadines",
	"VEN":	"Venezuela, Bolivarian Republic of",
	"VGB":	"Virgin Islands, British",
	"VIR":	"Virgin Islands, U.S.",
	"VNM":	"Viet Nam",
	"VUT":	"Vanuatu",
	"WLF":	"Wallis and Futuna",
	"WSM":	"Samoa",
	"YEM":	"Yemen",
	"ZAF":	"South Africa",
	"ZMB":	"Zambia",
	"ZWE":	"Zimbabwe"
};
