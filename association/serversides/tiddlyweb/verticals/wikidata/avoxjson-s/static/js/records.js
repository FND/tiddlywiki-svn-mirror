var oTable;
$(document).ready(function() {
	// fill in search box with current query
	var q = window.location.search;
	if(q) {
		var start = q.indexOf("q=")+2;
		var end = q.indexOf("&",start);
		if(end!==-1) {
			q = q.substring(0,end);
		}
		$('#search :text').val(q.substring(start));
	}
	// set advanced search on a slider
	$('#search a.advanced').click(function() {
		$('#advancedSearch').slideToggle(250);
	});
	// set up records table
	function hideColumn(col) {
		var visible = [];
		var columns = oTable.fnSettings().aoColumns;
		for(var i=0; i<columns.length; i++) {
			if(columns[i].bVisible===true) {
				visible.push(i);
			}
		}
		if(visible.length===1) {
			return;
		}
		var toHide = visible[col];
		oTable.fnSetColumnVis(toHide, false);
	}
	$('#recordsTable tfoot th').click(function() {
		var pos = $("#recordsTable tfoot th").index(this);
		hideColumn(pos);
		return false;
	});
	$("#filter input").click(function() {
		this.value = "";
	});
	$("#filter input").keyup(function() {
		oTable.fnFilter(this.value);
	});
	$('table').show();
	oTable = $('#recordsTable').dataTable({
		bPaginate: false,
		bInfo: false,
		aoColumns: [
			{ sType: "html" },
			null,
			null,
			{ sWidth: "50px" },
			null,
			null,
			null,
			null,
			{ sClass: "center" },
			{ sClass: "center" }
		],
		sDom: 't'
	});
});