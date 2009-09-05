$('html').addClass('js');
$(document).ready(function() {
/* commented out whilst using labels for search boxes, not interior text
	// fill in company search box with current query
	var q = window.location.search;
	if(q) {
		var start = q.indexOf("q=")+2;
		var end = q.indexOf("&",start);
		if(end!==-1) {
			q = q.substring(0,end);
		}
		$('#company_search_box').val(q.substring(start));
	}
	// empty search box when you click on it
	$('#search input:text').click(function() {
		this.value="";
		$(this).unbind();
	});
*/
	function countAdvSearchLines() {
		return $('.advSearchLine').length;
	}
	function addAdvSearchLine() {
		var i = countAdvSearchLines() + 1;
		var s = '<div class="advSearchLine">\n<select name="adv_'+i+'_field">\n<option>Legal Name</option>\n<option>Previous Name(s)</option>\n<option>Trades As Name(s)</option>\n<option>Trading Status</option>\n<option>Company Website</option>\n<option>Operational PO Box</option>\n<option>Operational Floor</option>\n<option>Operational Building</option>\n<option>Operational Street 1</option>\n<option>Operational Street 2</option>\n<option>Operational Street 3</option>\n<option>Operational City</option>\n<option>Operational State</option>\n<option>Operational Country</option>\n<option>Operational Postcode</option>\n</select>\n<input name="adv_'+i+'_value" size="35" type="text" />\n<a href="javascript:;" class="advanced" id="add_new_adv_'+i+'"><button onclick="return false;">+</button><!--<img src="/static/images/plus_small.gif" />--></a>\n</div>';
		$('#advancedSearch').append(s);
		$('#add_new_adv_'+i).click(function() {
			addAdvSearchLine();
		});
	}
	function revealAdvancedSearch() {
		if(countAdvSearchLines()===0) {
			addAdvSearchLine();
		}
		$('#advancedSearch').slideToggle(250);
	}
	// set advanced search on a slider
	$('#search a.advanced').click(function() {
		revealAdvancedSearch();
	});
	$('#results .filter a').click(function() {
		revealAdvancedSearch();
	});
});