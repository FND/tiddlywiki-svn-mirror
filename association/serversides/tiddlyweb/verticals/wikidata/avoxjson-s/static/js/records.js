var oTable;
$(document).ready(function() {
	// set up records table
	$('table').show();
	var $table = $('#recordsTable');
	if($table.length!==0) {
		oTable = $table.dataTable({
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
		var columns = oTable.fnSettings().aoColumns;
		var titles = [];
		for(var i=0;i<columns.length;i++) {
			titles.push(columns[i].sTitle);
		}
		function hideColumn(col) {
			if(columns[col].bVisible) {
				oTable.fnSetColumnVis(col, false);
			}
		}
		function showColumn(col) {
			if(!columns[col].bVisible) {
				oTable.fnSetColumnVis(col, true);
			}
		}
		$('#recordsTable tfoot th').click(function() {
			var pos = $("#recordsTable tfoot th").index(this);
			hideColumn(pos);
			return false;
		});
		var $labels = $('#columnPicker span.label');
		var $controls = $('#columnPicker span.controls');
		var updateControlList = function() {
			$controls.each(function(i) {
				if(!columns[i].bVisible) {
					$(this).addClass("invisible");
				} else {
					$(this).removeClass("invisible");
				}
			});
		};
		$('#columnPicker .hideControl').click(function() {
			var i = $('#columnPicker .hideControl').index(this);
			var label = $labels[i].innerHTML;
			var pos = $.inArray(label, titles);
			hideColumn(pos);
			updateControlList();
			return false;
		});
		$('#columnPicker .showControl').click(function() {
			var i = $('#columnPicker .showControl').index(this);
			var label = $labels[i].innerHTML;
			var pos = $.inArray(label, titles);
			showColumn(pos);
			updateControlList();
			return false;
		});
		$('#columnPicker').hover(function() {
			updateControlList();
			$('#columnPicker .columns').show();
		}, function() {
			$('#columnPicker .columns').hide();
		});
	}
});