$('html').addClass('js');
$(document).ready(function() {
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
	function countAdvSearchLines() {
		return $('.advSearchLine').length;
	}
	function addAdvSearchLine() {
		var i = countAdvSearchLines() + 1;
		var s = '<div class="advSearchLine">\n<select name="adv_'+i+'_field">\n<option>Choose field...</option>\n<option>Legal name</option>\n<option>Country of incorporation</option>\n<option>Operating address</option>\n</select>\n<input name="adv_'+i+'_value" size="35" type="text" />\n<a href="javascript:;" class="advanced" id="adv_'+i+'"><img src="/static/images/plus_small.gif" /></a>\n</div>';
		$('#advancedSearch').append(s);
		$('#adv_'+i).click(function() {
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