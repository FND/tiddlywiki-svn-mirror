var oTable;
$(document).ready(function() {
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
	$('table').show();
	oTable = $('#recordsTable').dataTable({
		bPaginate: false,
		bInfo: false,
		aoColumns: [
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
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