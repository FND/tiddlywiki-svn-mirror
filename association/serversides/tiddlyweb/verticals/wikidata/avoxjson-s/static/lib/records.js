/* records.js */
var oTable;
$(document).ready(function() {
	// set up records table
	var $table = $('#recordsTable');
	if($table.length!==0) {
		var options = {
			bAutoWidth: false,
			bPaginate: false,
			bSortClasses: false,
			bInfo: false,
			aaSorting: [[1, 'asc']],
			aoColumns: [
				null, // AVID
				null, // Legal Name
				{ bVisible: false }, // Previous Names(s)
				{ bVisible: false }, // Trades As Name(s)
				null, // Trading Status
				{ bVisible: false }, // Company Website
				{ fnRender: function(data) {
					return ISO_3166.countries.iso2name[data.aData[data.iDataColumn]] || "";
				} }, // Registered Country
				{ bVisible: false }, // Operational PO Box
				{ bVisible: false }, // Operational Floor
				{ bVisible: false }, // Operational Buidling
				null, // Operational Street 1
				{ bVisible: false }, // Operational Street 2
				{ bVisible: false }, // Operational Street 3
				null, // Operational City
				{ fnRender: function(data) {
					var country = ISO_3166.countries.iso2name[data.aData[15]];
					var mapping;
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
					return state = mapping ? mapping.iso2name[data.aData[data.iDataColumn]] : "";
				} }, // Operational State
				{ fnRender: function(data) {
					return ISO_3166.countries.iso2name[data.aData[data.iDataColumn]] || "";
				} }, // Operational Country
				null, // Operational Postcode
				{ sClass: "center" },
				{ sClass: "center" }
			],
			sDom: 't'
		};
		
		var setUpTable = function() {
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
			$table.css('visibility',"visible");
			$.fn.dragColumns('#recordsTable');
			oTable.fixedHeader = new $.fn.dataTableExt.FixedHeader(oTable);
			var columns = oTable.fnSettings().aoColumns;
			$('#recordsTable tfoot th').click(function() {
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
					} else {
						$(this).removeClass("invisible");
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
			$('#columnPicker').hover(function() {
				updateControlList();
				$('#columnPicker .columns').show();
			}, function() {
				$('#columnPicker .columns').hide();
			});
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
					for(var i=0; i<count; i++) {
						tiddler = json[i];
						fields = tiddler.fields;
						mapped.aaData.push([
							'<a href="/bags/avox/tiddlers/'+tiddler.title+'.html">'+tiddler.title+'</a>',
							fields["legal_name"] || "",
							fields["previous_name_s_"] || "",
							fields["trades_as_name_s_"] || "",
							fields["trading_status"] || "",
							fields["company_website"] || "",
							fields["country_of_registration"] || "",
							fields["operational_po_box"] || "",
							fields["operational_floor"] || "",
							fields["operational_building"] || "",
							fields["operational_street_1"] || "",
							fields["operational_street_2"] || "",
							fields["operational_street_3"] || "",
							fields["operational_city"] || "",
							fields["operational_state"] || "",
							fields["operational_country"] || "",
							fields["operational_postcode"] || "",
							'<a href="/bags/avox/tiddlers/'+tiddler.title+'.challenge">go</a>',
							'<a href="/bags/avox/tiddlers/'+tiddler.title+'.request">go</a>'
						]);
					}
					var str = 'There are '+count+' results';
					switch(count) {
						case 0:
							str = 'There are no results - <span class="filter"><a href="javascript:;">try adding a filter to include other fields in the search</a></span>';
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
