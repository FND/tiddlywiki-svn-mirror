/***
|''Name:''|MultiColumnListView|
|''Description:''|Displays a list with columns|
|''Author:''|Nicolas Rusconi (nicolas.rusconi (at) globant (dot) com)|
|''Version:''|1.0.0|
|''Date:''|Mar 18, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Type''|plugin|
|''Requires''||
|''Usage''|ListView.create(place,listObject,listTemplate,callback,className, *columns*)|
***/
/*{{{*/

ListView.create = function(place,listObject,listTemplate,callback,className, columns)
{
	var table = createTiddlyElement(place,"table",null,className || "listView twtable");
	var thead = createTiddlyElement(table,"thead");
	var r = createTiddlyElement(thead,"tr");
	if (!columns || listObject.length < 6) {
		columns = 1;
	}
	for (var i=0; i<columns; i++) {
		for(var t=0; t<listTemplate.columns.length; t++) {
			var columnTemplate = listTemplate.columns[t];
			var c = createTiddlyElement(r,"th");
			var colType = ListView.columnTypes[columnTemplate.type];
			if(colType && colType.createHeader) {
				colType.createHeader(c,columnTemplate,t);
				if(columnTemplate.className)
					addClass(c,columnTemplate.className);
			}
		}
	};
	var tbody = createTiddlyElement(table,"tbody");
	for(var rc=0; rc<listObject.length; rc = rc + columns) {
		r = createTiddlyElement(tbody, "tr");
		for (var rc2 = rc; rc2 < rc + columns && rc2 < listObject.length; rc2++) {
			var rowObject = listObject[rc2];
			for (c = 0; c < listTemplate.rowClasses.length; c++) {
				if (rowObject[listTemplate.rowClasses[c].field]) 
					addClass(r, listTemplate.rowClasses[c].className);
			}
			rowObject.rowElement = r;
			rowObject.colElements = {};
			for (var cc = 0; cc < listTemplate.columns.length; cc++) {
				c = createTiddlyElement(r, "td", null, className);
				columnTemplate = listTemplate.columns[cc];
				var field = columnTemplate.field;
				colType = ListView.columnTypes[columnTemplate.type];
				if (colType && colType.createItem) {
					colType.createItem(c, rowObject, field, columnTemplate, cc, rc2);
					if (columnTemplate.className) 
						addClass(c, columnTemplate.className);
				}
				rowObject.colElements[field] = c;
			}
		}
	}
	
	if(callback && listTemplate.actions)
		createTiddlyDropDown(place,ListView.getCommandHandler(callback),listTemplate.actions);
	if(callback && listTemplate.buttons) {
		for(t=0; t<listTemplate.buttons.length; t++) {
			var a = listTemplate.buttons[t];
			if(a && a.name != "")
				createTiddlyButton(place,a.caption,null,ListView.getCommandHandler(callback,a.name,a.allowEmptySelection));
		}
	}
	return table;
};
/*}}}*/