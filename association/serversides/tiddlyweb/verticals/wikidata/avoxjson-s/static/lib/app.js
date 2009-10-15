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
	var s = '<div class="advSearchLine">\n<select class="field" name="adv_'+i+'_field">\n<option>Legal Name</option>\n<option>Previous Name(s)</option>\n<option>Trades As Name(s)</option>\n<option>Trading Status</option>\n<option>Company Website</option>\n<option>Country of Registration</option>\n<option>Operational PO Box</option>\n<option>Operational Floor</option>\n<option>Operational Building</option>\n<option>Operational Street 1</option>\n<option>Operational Street 2</option>\n<option>Operational Street 3</option>\n<option>Operational City</option>\n<option>Operational State</option>\n<option>Operational Country</option>\n<option>Operational Postcode</option>\n</select></div>';
	var t ='<input name="adv_'+i+'_value" id="adv_'+i+'_value" size="35" type="text" />';
	var u ='<a href="javascript:;" class="advanced" id="add_new_adv_'+i+'"><button onclick="return false;">+</button><!--<img src="/static/images/plus_small.gif" />--></a>';
	var $advSearchLine = $(s).appendTo($('#advancedSearchLines')).append(t).append(u);
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
	/****** trying new way of handling events on filter box *****/
	var countryFields = [
		"Operational Country",
		"Country of Registration"
	];
	var stateFields = [
		"Operational State"
	];
	var dependencies = {
		"Operational Country": [
			"Operational State"
		]
	};
	var statesForCountries = {
		"Australia": ISO_3166["2:AU"],
		"Canada": ISO_3166["2:CA"],
		"United States": ISO_3166.usa
	};
	var countryDropDown = "<select>";
	for(var n in ISO_3166.countries.name2iso) {
		countryDropDown += "<option>"+n+"</option>";
	}
	countryDropDown += "</select>";
	$advSearchLine.change(function(event) { try {
		var $target = $(event.target);
		var selected = $target.val();
		var $value;
		var currVal;
		var name = 'adv_'+i+'_value';
		var hiddenInputField;
		if($target.hasClass('field')) {
			if($.inArray(selected,countryFields)!==-1) {
				$value = $target.next();
				// $removed is a drop-down or an input
				var $removed = $value.replaceWith($(countryDropDown));
				$target.next().attr('name', '_ignore_'+name);
				// throw away any hidden inputs as we've changed field
				var $hidden = $target.parent().find('input:hidden').remove();
				// take the pre-existing field value and see if we can set the new drop-down with it
				currVal = $removed.val();
				var newVal = ISO_3166.countries.iso2name[currVal];
				if(newVal) {
					$target.next().val(newVal);
				}
				// add in a hidden input field to store the code
				hiddenInputField = '<input type="hidden" name="'+name+'" id="'+name+'" />';
				$target.next().after(hiddenInputField).next().val(currVal);
				// setup a list of fields that need to know about this field
				var dependentFields = dependencies[selected];
				$target[0].pendingDependencies = dependentFields;
				// JRL - can we trigger dependents at this point?
			} else if($.inArray(selected,stateFields)!==-1) {
				// look for dependencies
				$advSearchLine.parent().find('select.field').each(function() {
					if(this.pendingDependencies) {
						for(var i=0;i<this.pendingDependencies.length;i++) {
							if($target.val()===this.pendingDependencies[i]) {
								$target[0].isDependentOn = $(this).next().val();
							}
						}
					}
				});
				if($target[0].isDependentOn && statesForCountries[$target[0].isDependentOn]) {
					$value = $target.next();
					currVal = $value.val();
					var states = statesForCountries[$target[0].isDependentOn];
					var stateDropDown = "<select>";
					for(var s in states.name2iso) {
						stateDropDown += "<option>"+s+"</option>";
					}
					stateDropDown += "</select>";
					$value.replaceWith($(stateDropDown));
					$target.next().attr('name','_ignore_'+name).val(states.iso2name[currVal]);
					hiddenInputField = '<input type="hidden" name="'+name+'" id="'+name+'" />';
					$target.next().after(hiddenInputField);
					//$target.next().change();
				} else {
					if($target.next().is("select")) {
						$target.parent().find('input:hidden').remove();
						$target.next().replaceWith(t);
					}
				}
			} else { // normal field
				if($target.next().is("select")) {
					$target.parent().find('input:hidden').remove();
					$target.next().replaceWith(t);
					filterOnChange(null,$target[0].index);
				}
			}
			$target[0].index = $target[0].selectedIndex;
		} else { // it's a field value
			if($target.is("select")) {
				// figure out which mapping to use to update the display and the hidden input
				var field = $target.prev().val();
				var mapping;
				if($.inArray(field,countryFields)!==-1) {
					mapping = ISO_3166.countries.name2iso;
				} else {
					mapping = statesForCountries[$target.prev()[0].isDependentOn].name2iso;
				}
				currVal = $target.val();
				$target.next().val(mapping[currVal]);
			} else {
				// it is an input box, no hidden input to update
			}
			filterOnChange(event.target);
		}
	} catch(ex) { console.log(ex); } });
	$advSearchLine.keyup(function(event) {
		if($(event.target).is("input")) {
			filterOnChange(event.target);
		}
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
$(document).ready(function() { try {
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
		for(var i in params) {
			if(i.match(/adv_\d{1,2}_field/)) {
				var val = params[i.replace('_field', '_value')];
				if(val && val[0]) {
					addAdvSearchLine()
						.find('select')
						.val(params[i].join(" "))
						.next()
						.val(val[0])
						.end()
						.change();
				}
			}
		}
	}
} catch(ex) { console.log(ex); } });
