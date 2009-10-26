/*
 * File:        FixedHeader.js
 * Version:     1.0.0
 * CVS:         $Id$
 * Description: "Fix" a header at the top of the table, so it scrolls with the table
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * Created:     Wed 16 Sep 2009 19:46:30 BST
 * Modified:    $Date$ by $Author$
 * Language:    Javascript
 * License:     LGPL
 * Project:     Just a little bit of fun :-)
 * Contact:     www.sprymedia.co.uk/contact
 * 
 * Copyright 2009 Allan Jardine, all rights reserved.
 *
 */


(function($) {

/*
 * Function: $.fn.dataTableExt.FixedHeader
 * Purpose:  FixedHeader "class"
 * Returns:  same as _fnInit
 * Inputs:   same as _fnInit
 */
$.fn.dataTableExt.FixedHeader = function ( oTable )
{
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public functions
	 */
	
	/*
	 * Function: fnUpdate
	 * Purpose:  Update the floating header from the current state of the DataTable
	 * Returns:  -
	 * Inputs:   -
	 * Notes:    This would be used when the DataTables state is changed. For example using 
	 *   fnSetColumnVis() to change the number of visible columns.
	 */
	 
	 // JRL: moved this here so it was available to fnUpdate
	 /* The starting x-position of the table on the document */
	var _iStart;
	 
	this.fnUpdate = function ()
	{
		_iStart = $(_oSettings.nTable).offset().top; // JRL: added this line to check for changes in position of table e.g. due to DOM changes
		_fnCloneThead();
	}
	
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private variables
	 */
	
	/* The DataTables object */
	var _oTable;
	
	/* The DataTables settings object - easy access */
	var _oSettings;
	
	/* The cloned table node */
	var _nCTable;
	
	
	
	/* The starting x-position of the table relative to it's parent */
	var _iOffset;
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private functions
	 */
	
	/*
	 * Function: _fnCloneTable
	 * Purpose:  Clone the table node and do basic initialisation
	 * Returns:  -
	 * Inputs:   -
	 */
	function _fnCloneTable ()
	{
		var nOrigTable = _oSettings.nTable;
		
		/* We know that the table _MUST_ has a DIV wrapped around it, because this is simply how
		 * DataTables works. Therefore, we can set this to be relatively position (if it is not
		 * alreadu absolute, and use this as the base point for the cloned header
		 */
		if ( $(nOrigTable.parentNode).css('position') != "absolute" )
		{
			nOrigTable.parentNode.style.position = "relative";
		}
		
		/* Need to know the table's position relative to the other elements */
		_iOffset = nOrigTable.offsetTop;
		
		/* Just a shallow clone will do - we only want the table node */
		_nCTable = nOrigTable.cloneNode( false );
		_nCTable.style.position = "absolute";
		_nCTable.style.top = _iOffset+"px";
		_nCTable.style.left = nOrigTable.offsetLeft+"px";
		_nCTable.className += " FixedHeader_Cloned";
		_nCTable.id += "_Cloned";
		
		/* Insert the newly cloned table into the DOM, on top of the "real" header */
		nOrigTable.parentNode.insertBefore( _nCTable, nOrigTable );
		
		/* Dev note: for some mental reason we can't use the offset of '_nCTable' in IE. The original
		 * table will do us nicely though
		 */
		_iStart = $(_oSettings.nTable).offset().top;
		
		/* Add the scroll event handler to move the table header */
		$(window).scroll( function () {
			var iWindow = $(window).scrollTop();
			
			if ( _iStart < iWindow )
			{
				var iNew = iWindow-_iStart+_iOffset;
				var iTbodyHeight = _oSettings.nTable.getElementsByTagName('tbody')[0].offsetHeight;
				
				if ( iNew < _iOffset+iTbodyHeight )
				{
					/* In the middle of the table */
					_nCTable.style.top = iNew+"px";
				}
				else
				{
					/* At the bottom of the table */
					_nCTable.style.top = (_iOffset+iTbodyHeight)+"px";
				}
			}
			else
			{
				/* Above the table */
				_nCTable.style.top = _iOffset+"px";
			}
		} );
	}
	
	
	/*
	 * Function: _fnCloneThead
	 * Purpose:  Clone the THEAD element used in the DataTable and add required event listeners
	 * Returns:  -
	 * Inputs:   -
	 */
	function _fnCloneThead ()
	{
		/* Remove any children the cloned table has */
		while ( _nCTable.childNodes.length > 0 )
		{
			_nCTable.removeChild( _nCTable.childNodes[0] );
		}
		
		/* Clone the DataTables header */
		var nThead = _oSettings.nTable.getElementsByTagName('thead')[0].cloneNode( true );
		_nCTable.appendChild( nThead );
		
		/* Copy the widths across - apparently a clone isn't good enough for this */
		$("thead:eq(0)>tr th", _oSettings.nTable).each( function (i) {
			var width = $(this).width();
			// JRL: replacing this line as it breaks IE
			//$("thead:eq(0)>tr th:eq("+i+")", _nCTable)[0].style.width =
			//	parseInt($(this).css('width'))+"px";
			$("thead:eq(0)>tr th:eq("+i+")", _nCTable).width(width);
		} );
		
		$("thead:eq(0)>tr td", _oSettings.nTable).each( function (i) {
			$("thead:eq(0)>tr td:eq("+i+")", _nCTable)[0].style.width = 
				parseInt($(this).css('width'))+"px";
		} );
		
		/*var passThrough = function(type,wrapUp) {
			var handler = function(event) {
				var iTrigger = $('thead th', _nCTable).index(this);
				$('body').prepend(iTrigger+' '+event.type);
				$('thead th:eq('+iTrigger+')', _oSettings.nTable).trigger(event);
				if(wrapUp) {
					wrapUp();
				}
			};
			$('thead th', _nCTable)[type](handler);
		};
		passThrough('click',_fnCloneThead);
		passThrough('mousedown');*/
		
		/* Add the event handlers for sorting */
		$('thead th', _nCTable).click( function () {
			/* Don't try and do the sort ourselves - let DataTables take care of the logic */
			var iTrigger = $('thead th', _nCTable).index(this);
			//$('body').prepend(iTrigger+' '+event.type);
			$('thead th:eq('+iTrigger+')', _oSettings.nTable).click();
			_fnCloneThead();
			return true;
		} );
		
		//$('thead th', _nCTable).mousedown( function (event) { try {
			/* JRL: Pass event through to original table header so dragColumns.js can pick it up */
			/*var iTrigger = $('thead th', _nCTable).index(this);
			$('body').prepend(iTrigger+' '+event.type);
			var $th = $('thead th:eq('+iTrigger+')', _oSettings.nTable);
			event.stopPropagation();
			$th.trigger("mousedown");
			return false;
		} catch(ex) { $('body').prepend(ex.message); } });*/
	}
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Initialisation
	 */
	_oTable = oTable;
	_oSettings = _oTable.fnSettings();
	
	_fnCloneTable();
	_fnCloneThead();
}

})(jQuery);
