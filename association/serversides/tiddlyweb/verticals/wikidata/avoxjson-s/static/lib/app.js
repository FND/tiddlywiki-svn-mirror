/* app.js */
// override search links to use ajax_search as soon as possible
/* disabled until ajax_search fixed for logged-in people - JS error
$('a[href^="/search"]').each(function() {
	var href = $(this).attr('href');
	$(this).attr('href', href.replace("/search", "/pages/ajax_search"));
});*/
function parseQueryString(q) {
	var params = {};
	if(q.charAt(0)==="?") {
		q=q.substring(1);
	}
	q=q.replace(/\+/g," ");
	var pairs = q.split("&");
	var pair, key, value;
	for(var i=0; i<pairs.length; i++) {
		pair = decodeURIComponent(pairs[i]).split("=");
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
	try {
	var container = '#advancedSearchContainer';
	
	var i = DependentInputs.createRow(container);
	var $row = DependentInputs.rows[i];
	
	var filterOnChange = function(elem,selectedIndex) {
		selectedIndex = selectedIndex || $row.field.get(0).selectedIndex;
		/* restore these lines when we can support "Any Field"
		if(selectedIndex===0) { // "Any Field"
			oTable.fnFilter(this.value);
		} else {
			// filter on columns assuming the select input doesn't include the AVID field
			oTable.fnFilter(this.value,selectedIndex);
		}*/
		if(oTable) {
			oTable.fnFilter(elem ? elem.value : "",selectedIndex+1);
			oTable.fixedHeader.fnUpdate(true);
		}
	};
	
	$row.change(function(event) {
		filterOnChange(event.target);
	});
	$row.keyup(function(event) {
		if($(event.target).is("input")) {
			filterOnChange(event.target);
		}
	});
	// reveal if not shown
	var $container = $(container);
	if($container.css('display')==="none") {
		$container.slideDown(250);
		/* have to put this here until FixedHeader can cope with the page changing length after it's been initialised - it's after a timeout because the revealAdvancedSearch function takes that long to complete */
		window.setTimeout(function() {
			if(oTable && oTable.fixedHeader) {
				oTable.fixedHeader.fnUpdate(true);
			}
		}, 300);
	}
	return $row;
	} catch(ex) {
		console.log(ex);
	}
}
$(document).ready(function() {
	// set advanced search on a slider
	$('#search .advanced').css('cursor','pointer').click(function() {
		addAdvSearchLine();
	});
	$('#tableinfo .filter a').click(function() {
		addAdvSearchLine();
	});
	// fill in search box and filters with current query
	var q = window.location.search;
	if(q) {
		var params = parseQueryString(q);
		if(params.q) {
			$('#company_search_box').val(params.q.join(" "));
		}
		for(var i in params) {
			if(i.match(/adv_\d{1,2}_field/)) {
				var val = params[i.replace('_field', '_value')];
				if(val && val[0]) {
					addAdvSearchLine()
						.find('input')
						.val(val[0])
						.prev()
						.val(params[i].join(" "))
						.change();
				}
			}
		}
	}
	if($('.operational_country, .operational_state, .registered_country, .registered_state').length) {
		var replaceCode = function(elem,code) {
			if(code) {
				var stateMap;
				stateMap = ISO_3166[code.toLowerCase()] || ISO_3166["2:"+code];
				if(stateMap) {
					$(elem).text(stateMap.iso2name[$(elem).text()]);
				}
			}
		};
		$('.operational_state').each(function() {
			var code = $.trim($('.operational_country').text());
			replaceCode(this,code);
		});
		$('.registered_state').each(function() {
			var code = $.trim($('.registered_country').text());
			replaceCode(this,code);
		});
		$('.operational_country, .registered_country').each(function(i) {
			$(this).text(ISO_3166.countries.iso2name[$(this).text()]);
		});
	}
	if($('#suggest_new, #challenge, #request').length!==0) {
		DependentInputs.addDependency(function($row,changed) {
			if(changed==="field" && $row.field.attr("for")==="country") {
				$row.valueMap = ISO_3166.countries.name2iso;
				return DependentInputs.values.countries;
			}
		});
		if($('table.fields').length) {
			DependentInputs.addRows('table.fields',"label",":input","tr");
		}
		DependentInputs.addRow('div.right',"label[for=country]","label[for=country]+input");
		var $hiddenWhileRendering = $('table.fields, div.right');
		if($hiddenWhileRendering.length) {
			$hiddenWhileRendering.css("visibility","visible");
		}
	}
	if($('#backnav').length) {
		$('#backnav').click(function() {
			window.history.go(-1);
			return false;
		});
	}
	// now show hidden things
	$('.onlyjs').css('visibility','visible');
});
