/* records.js */
var oTable;
var defaultView = [
	"avid",
	"legal_name",
	"trading_status",
	"registered_country",
	"operational_street_1",
	"operational_city",
	"operational_state",
	"operational_country",
	"operational_postcode"	
];
var aoColumnsRenderMap = {
	"registered_country": function(data) {
		return ISO_3166.countries.iso2name[data.aData[data.iDataColumn]] || "";
	},
	"operational_state": function(data) {
		var country = ISO_3166.countries.iso2name[data.aData[14]]; // 14 is the operational_country
		var mapping;
		var state;
		switch(country) {
			case "Australia":
				mapping = ISO_3166["2:AU"];
				break;
			case "Canada":
				mapping = ISO_3166["2:CA"];
				break;
			case "United States":
				mapping = ISO_3166.usa;
				break;
			default:
				// nothing
				break;
		}
		state = mapping ? mapping.iso2name[data.aData[data.iDataColumn]] : data.aData[data.iDataColumn];
		return state;
	},
	"operational_country": function(data) {
		return ISO_3166.countries.iso2name[data.aData[data.iDataColumn]] || "";
	}
};
$(document).ready(function() {
	// set up records table
	var aoColumns = [];
	var field, options;
	aoColumns.push({}); // AVID
	for(var i=0, il=recordFields.length; i<il; i++) {
		field = recordFields[i][0];
		options = {};
		if($.inArray(field,defaultView)===-1) {
			options.bVisible = false;
		}
		if(field in aoColumnsRenderMap) {
			options.fnRender = aoColumnsRenderMap[field];
		}
		aoColumns.push(options);
	}
	aoColumns.push(
		{ sClass: "center" }, // challenge
		{ sClass: "center" }  // request more information
	);
	var $table = $('#recordsTable');
	if($table.length!==0) {
		options = {
			bAutoWidth: false,
			bPaginate: false,
			bSortClasses: false,
			bInfo: false,
			aaSorting: [[1, 'asc']],
			aoColumns: aoColumns,
			sDom: 't'
		};
		
		var setUpTable = function() {
			var columns;
			function getTitles() {
				var titles = [];
				for(var i=0;i<columns.length;i++) {
					titles.push(columns[i].sTitle);
				}
				return titles;
			}
			function hideColumn(col) {
				if(columns[col].bVisible) {
					oTable.fnSetColumnVis(col, false);
				}
				oTable.fixedHeader.fnUpdate();
			}
			function showColumn(col) {
				if(!columns[col].bVisible) {
					oTable.fnSetColumnVis(col, true);
				}
				oTable.fixedHeader.fnUpdate();
			}
			$('#table').css('visibility',"visible");
			$.fn.dragColumns('#recordsTable');
			oTable.fixedHeader = new $.fn.dataTableExt.FixedHeader(oTable);
			columns = oTable.fnSettings().aoColumns;
			$('#recordsTable tfoot th').live("click",function() {
				var i = $('#recordsTable tfoot th').index(this);
				var head = $('#recordsTable thead th')[i];
				var title = head.innerHTML;
				var titles = getTitles();
				var pos = $.inArray(title, titles);
				hideColumn(pos);
				return false;
			});
			var $labels = $('#columnPicker span.label');
			var $controls = $('#columnPicker span.controls');
			var updateControlList = function() {
				var titles = getTitles();
				$labels.each(function(i) {
					$(this).text(titles[i]);
				});
				$controls.each(function(i) {
					if(!columns[i].bVisible) {
						$(this).addClass("invisible");
						$(this).removeClass("visible");
					} else {
						$(this).removeClass("invisible");
						$(this).addClass("visible");
					}
				});
			};
			$('#columnPicker .hideControl').click(function() {
				var i = $('#columnPicker .hideControl').index(this);
				var label = $labels[i].innerHTML;
				var titles = getTitles();
				var pos = $.inArray(label, titles);
				hideColumn(pos);
				updateControlList();
				return false;
			});
			$('#columnPicker .showControl').click(function() {
				var i = $('#columnPicker .showControl').index(this);
				var label = $labels[i].innerHTML;
				var titles = getTitles();
				var pos = $.inArray(label, titles);
				showColumn(pos);
				updateControlList();
				return false;
			});
			var colToggle = function() {
				updateControlList();
				$('#columnPicker #cols').toggle();
			};
			$('#pickerControl').click(colToggle);
		};
		
		if(window.asyncSearch) {
			var q = window.location.search;
			options.sAjaxSource = "/search.json"+q;
			options.fnInitComplete = setUpTable;
			options.fnServerData = function(url, data, callback) {
				var mapToDataTables = function(json) {
					var mapped = {"aaData":[]};
					var tiddler, fields;
					var count = json.length;
					var row;
					for(var i=0; i<count; i++) {
						tiddler = json[i];
						fields = tiddler.fields;
						row = [];
						row.push('<a href="/bags/avox/tiddlers/'+tiddler.title+'.html">'+tiddler.title+'</a>'); // AVID
						for(var j=0, jl=recordFields.length; j<jl; j++) {
							field = recordFields[j][0];
							row.push(fields[field] || "");
						}
						row.push('<a href="/bags/avox/tiddlers/'+tiddler.title+'.challenge">go</a>');
						row.push('<a href="/bags/avox/tiddlers/'+tiddler.title+'.request">go</a>');
						mapped.aaData.push(row);
					}
					var str = 'There are '+count+' results';
					switch(count) {
						case 0:
							str = 'There are no results - try <span class="filter"><a href="#">adding a filter</a></span> to include other fields in your search or <a href="/pages/suggest_new">suggest a new record</a>';
							break;
						case 1:
							str = 'There is 1 result';
							// deliberate fall-through
						case 51:
							str = 'There are more than 50 results, only showing the first 50';
							// deliberate fall-through
						default:
							str += ' - <span class="filter"><a href="javascript:;">add a filter</a>?</span>';
							break;
					}
					$('#results_count').html(str);
					callback(mapped);
				};
				$.getJSON(url, data, mapToDataTables);
			};
		}
		oTable = $table.dataTable(options);
		if(!window.asyncSearch) {
			setUpTable();
		}
	}
});
