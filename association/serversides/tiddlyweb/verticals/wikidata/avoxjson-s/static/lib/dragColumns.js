/*
Author: Jonathan Lister (jnthnlstr [at] googlemail [dot] com)
License: BSD
Version: 0.3

not done:
 - figure z-index of dragCol out automatically
 - column classes not getting copied across
 - if a sorted column is moved, it doesn't remain registered as sorted, so you have to click twice to sort differently; the column that moved into the vacated place is treated as sorted
*/
(function($) {

$.fn.dragColumns = function(selector) {

	var $table = $(selector);
	var $wrapper = $table.parent();
	var $thead = $table.find('thead tr');
	var from, to;
	var $dragCol;
	var isMoved = false;
	
	// stealing from FixedHeader here
	if($wrapper.css("position")!="absolute") {
		$wrapper.css("position","relative");
	}
	var findTargetCol = function(event) {
		var xPos = event.pageX;
		var target;
		var left, right;
		var index;
		$thead.find('th').each(function(i) {
			left = $(this).offset().left;
			right = left+$(this).width();
			if(left<xPos && right>=xPos) {
				target = this;
				index = i;
			}
		});
		return {
			index:index,
			elem:target
		};
	};
	var setupDragCol = function(index,elem) {
		from = index;
		var pos = $(elem).position();
		var $cloneTable = $($table[0].cloneNode(false));
		var getStyle = function(elem,styleProp) {
			var style;
			if (elem.currentStyle) {
				var regexp = new RegExp(/-(\w)/);
				var matches = regexp.exec(styleProp);
				if(matches) {
					styleProp = styleProp.replace(matches[0],matches[1].toUpperCase());
				}
				style = elem.currentStyle[styleProp];
			} else if (window.getComputedStyle) {
				style = document.defaultView.getComputedStyle(elem,null).getPropertyValue(styleProp);
			}
			return style;
		};
		var colWidth;
		var copySection = function(sectionSelector,elemType) {
			var section = $cloneTable[0].appendChild($table.find(sectionSelector)[0].cloneNode(false));
			$table.find(sectionSelector+' tr').each(function() {
				var row = section.appendChild(this.cloneNode(false));
				var rowHeight = this.offsetHeight;
				var cellPadding, $newCell;
				var it;
				$(this).find(elemType).each(function(i) {
					if(i===from) {
						if(!colWidth) {
							colWidth = this.offsetWidth;
						}
						$newCell = $(this.cloneNode(true));
						cellPadding = {
							left: parseInt(getStyle(this,"padding-left"),10),
							right: parseInt(getStyle(this,"padding-right"),10)
						};
						if($.browser.msie) { // IE box-model fix
							cellPadding.top = parseInt(getStyle(this,"padding-top"),10);
							cellPadding.bottom = parseInt(getStyle(this,"padding-bottom"),10);
							$newCell.height(rowHeight - cellPadding.top - cellPadding.bottom);
						}
						$newCell.css('width',colWidth - cellPadding.left - cellPadding.right);
						row.appendChild($newCell[0]);
					}
				});
				$(row).height(rowHeight);
			});
		};
		copySection('thead','th');
		copySection('tfoot','th');
		copySection('tbody','td');
		$dragCol = $("<div></div>").append($cloneTable).css({
			'position': 'absolute',
			'top': "0px",
			'left': pos.left,
			'opacity': 0.7,
			'zIndex':"2" // TO-DO: would be good to figure this out automatically
		});
		$wrapper.append($dragCol);
	};
	var updateDataTables = function(targetObj) {
		to = targetObj.index;
		var updateDataTable = function(fromCol,toCol) {
			var settings = oTable.fnSettings();
			var columns = settings.aoColumns;
			var visible = [];
			for(var i=0; i<columns.length; i++) {
				if(columns[i].bVisible===true) {
					visible.push(i);
				}
			}
			fromCol = visible[fromCol];
			toCol = visible[toCol];
			var col = columns.splice(fromCol,1);
			columns.splice(toCol,0,col[0]);
			visible = [];
			for(var i=0; i<columns.length; i++) {
				if(columns[i].bVisible===true) {
					visible.push(i);
				}
			}
			var $ths = $table.find('thead th');
			var $tfs = $table.find('tfoot th');
			var visTh, visTf;
			for(i=0; i<visible.length; i++) {
				visTh = $ths.get(i);
				visTf = $tfs.get(i);
				columns[visible[i]].nTh = visTh;
				columns[visible[i]].nTf = visTf;
				columns[visible[i]].iDataSort = visible[i]; // this hard-codes the sorting to the column itself (so you'd need to change this if you were sorting on the contents of other columns)
				visTh.innerHTML = columns[visible[i]].sTitle;
			}
			var rowData = settings.aoData;
			var row, r, h;
			for(i=0; i<rowData.length; i++) {
				row = rowData[i];
				r = row._aData.splice(fromCol,1);
				row._aData.splice(toCol,0,r[0]);
				h = row._anHidden.splice(fromCol,1);
				row._anHidden.splice(toCol,0,h[0]);
			}
			var rowOrder = settings.aiDisplay;
			var $tds;
			var j;
			for(i=0;i<rowOrder.length;i++) {
				$tds = $(rowData[rowOrder[i]].nTr).find('td');
				for(j=0;j<visible.length;j++) {
					$tds.eq(j)[0].innerHTML = rowData[rowOrder[i]]._aData[visible[j]];
				}
			}
		};
		updateDataTable(from,to);
		// update FixedHeader - should probably just call an event FixedHeader listens to
		if(oTable.fixedHeader) {
			oTable.fixedHeader.fnUpdate();
		}
	};
	var cancelDrag = function() {
		isMoved = false;
		$wrapper.unbind("mousemove");
		$wrapper.unbind("mouseup", endDrag).unbind("mouseleave");
		if($dragCol) {
			$dragCol.remove();
		}
	};
	var endDrag = function(event) {
		if(isMoved) {
			var targetObj = findTargetCol(event);
			updateDataTables(targetObj);
		}
		cancelDrag();
	};
	$(document).ready(function() {
		$wrapper.mousedown(function(event) {
			event.preventDefault();
			if (jQuery.browser.msie) { // IE triggers text-select on selectstart not mousedown
			    $(document).bind('selectstart', function () { return false; });
			    $(document).one("mouseup", function() {
			    	$(document).unbind("selectstart");
			    });
		    }
			var origEvent = event;
			$wrapper.one("mousemove", function(event) {
				isMoved = true;
				var targetObj = findTargetCol(origEvent);
				setupDragCol(targetObj.index,targetObj.elem);
				var eventPos = {
					pageX: origEvent.pageX,
					pageY: origEvent.pageY
				};
				var origPos = $dragCol.position();
				$wrapper.mousemove(function(event) {
					var xMoved = event.pageX - eventPos.pageX;
					$dragCol.css({
						"left": origPos.left+xMoved
					});
				});
				$wrapper.mouseleave(function(event) {
					cancelDrag();
				});
			}).one("mouseup", endDrag);
		});
	});
};

})(jQuery);