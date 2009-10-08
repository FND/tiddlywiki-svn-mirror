function parseQueryString(q) {
	var params = {};
	if(q.charAt(0)==="?") {
		q=q.substring(1);
	}
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
function countAdvSearchLines() {
	return $('.advSearchLine').length;
}
function addAdvSearchLine() {
	var i = countAdvSearchLines() + 1;
	/* keeping this "Any Field" option back until we can support it in search
	<option>Any Field</option>\n
	*/
	var s = '<div class="advSearchLine">\n<select name="adv_'+i+'_field">\n<option>Legal Name</option>\n<option>Previous Name(s)</option>\n<option>Trades As Name(s)</option>\n<option>Trading Status</option>\n<option>Company Website</option>\n<option>Operational PO Box</option>\n<option>Operational Floor</option>\n<option>Operational Building</option>\n<option>Operational Street 1</option>\n<option>Operational Street 2</option>\n<option>Operational Street 3</option>\n<option>Operational City</option>\n<option>Operational State</option>\n<option>Operational Country</option>\n<option>Operational Postcode</option>\n</select>\n<input name="adv_'+i+'_value" id="adv_'+i+'_value" size="35" type="text" />\n<a href="javascript:;" class="advanced" id="add_new_adv_'+i+'"><button onclick="return false;">+</button><!--<img src="/static/images/plus_small.gif" />--></a>\n</div>';
	var $advSearch = $('#advancedSearchLines').append(s);
	var $children = $advSearch.children();
	var $advSearchLine = $($children[$children.length-1]);
	$advSearchLine.find('input').keyup(function() {
		var selectedIndex = $advSearchLine.find('select')[0].selectedIndex;
		/* restore these lines when we can support "Any Field"
		if(selectedIndex===0) { // "Any Field"
			oTable.fnFilter(this.value);
		} else {
			// filter on columns assuming the select input doesn't include the AVID field
			oTable.fnFilter(this.value,selectedIndex);
		}*/
		oTable.fnFilter(this.value,selectedIndex+1);
	});
	$('#add_new_adv_'+i).click(function() {
		addAdvSearchLine();
	});
	return $advSearchLine;
}
function revealAdvancedSearch() {
	if(countAdvSearchLines()===0) {
		addAdvSearchLine();
	}
	$('#advancedSearchContainer').slideToggle(250);
}

$('html').addClass('js');
$(document).ready(function() {
	// set advanced search on a slider
	$('#search a.advanced').click(function() {
		revealAdvancedSearch();
	});
	$('#results .filter a').click(function() {
		revealAdvancedSearch();
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
				addAdvSearchLine().find('select').val(params[i].join(" "));
				advCount++;
			}
		}
		if(advCount>0) {
			for(var i in params) {
				if(i.match(/adv_\d{1,2}_value/)) {
					var $line = $('#'+i);
					if($line) {
						$line.val(params[i].join(" "));
					}
				}
			}
			revealAdvancedSearch();
		}
	}
});