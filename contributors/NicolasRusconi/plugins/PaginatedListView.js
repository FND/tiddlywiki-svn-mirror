/***
|''Name:''|PaginatedListView|
|''Description:''|Displays a Paginated list|
|''Author:''|Nicolas Rusconi (nicolas.rusconi (at) globant (dot) com)|
|''Version:''|1.0.0|
|''Date:''|Mar 18, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Type''|plugin|
|''Requires''||
|''Usage''|PaginatedListView.create(place,listObject,listTemplate,callback,className, columnCount)|
***/
/*{{{*/
PaginatedListView = function(place, table, listObject, columnCount)
{
	this.columnCount = columnCount;
	var container = createTiddlyElement(place,'table',null, PaginatedListView.paginatedStyle);
	var containerRow = createTiddlyElement(container,'tr');
	var containerCell = createTiddlyElement(containerRow, 'td');
	containerCell.colSpan = 3;
	containerCell.appendChild(table);
	container.appendChild(this.getPageControlRow(table.tBodies[0], listObject, columnCount));
	container.ondblclick = function(e){
		e.cancelBubble = true;
	};
	return this;
}

//merge(PaginatedListView, ListView);

// Create a paginated listview
//#   place - where in the DOM tree to insert the listview
//#   listObject - array of objects to be included in the listview
//#   listTemplate - template for the listview
//#   callback - callback for a command being selected
//#   className - optional classname for the <table> element
PaginatedListView.create = function(place, listObject, listTemplate, callback, className, columnCount)
{
	var table = ListView.create(null,listObject,listTemplate,callback,className, columnCount);
	if (listObject.length > PaginatedListView.prototype.getElementsPerPage() * columnCount) {
		return new PaginatedListView(place, table, listObject, columnCount);
	} else {
		place.appendChild(table);
		table.getSelectedRows = function() {
			return ListView.getSelectedRows(table);
		}
		return table;
	}
};

PaginatedListView.prototype.getPageControlRow = function(table, listObject, columnCount)
{
	this.elements = [];
	this.page = 0;
	this.table = table;
	var elementsPerPage = this.getElementsPerPage();
	// get the first displayed rows
	for (var i = 0; i < table.rows.length && i < elementsPerPage; i++) {
		this.elements.push(table.rows[i]);
	};
	// get the rest and remove them from the table
	for (var i = elementsPerPage; table.rows.length > elementsPerPage; i++) {
		this.elements.push(table.rows[elementsPerPage]);
		table.removeChild(table.rows[elementsPerPage]);
	};
	var paggingRow = createTiddlyElement(null, 'tr', null, PaginatedListView.pageControlStyle);
	//add Backward Links
	paggingRow.appendChild(this.getLinks(PaginatedListView.backwardLinksSpec));
	//add page selector
	paggingRow.appendChild(this.addPageSelector(listObject, columnCount));
	//add Forward Links
	paggingRow.appendChild(this.getLinks(PaginatedListView.forwardLinksSpec));
	return paggingRow;
};

PaginatedListView.prototype.getLinks = function(linksSpec)
{
	var view = this;
	var links = linksSpec.links;
	var paggingItem = createTiddlyElement(null, 'td', null, linksSpec.style);
	for (var i=0; i<links.length; i++) {
		var element = links[i];
		var link = createTiddlyElement(paggingItem, 'a', null, null, element.label);
		link.func = element.func;
		link.view = view;
		link.onclick = function() {
			this.view[this.func]();
		}
		link.ondblclick = function(e) {
			e.cancelBubble = true;
			this.onclick(e);
		}
	};
	return paggingItem;
};

PaginatedListView.prototype.addPageSelector = function(listObject, columnCount)
{
	var pageCell = createTiddlyElement(null, 'td', null, PaginatedListView.pageControlStyle + PaginatedListView.pageSelectStyle);
	var pageSelect = createTiddlyElement(pageCell, 'select');
	var elementsPerPage = this.getElementsPerPage();
	var pageCount = this.elements.length / elementsPerPage;
	for (var i = 0; i < pageCount; i++) {
		var fromItemIndex = i * elementsPerPage * columnCount;
		var previousItemIndex = fromItemIndex - 1;
		var toItemIndex = fromItemIndex + (elementsPerPage * columnCount) - 1;
		var nextItemIndex = toItemIndex + 1;
		if (toItemIndex >= listObject.length) {
			toItemIndex = listObject.length - 1;
		}
		var from = this.getPageLetters(listObject, previousItemIndex, fromItemIndex, toItemIndex);
		var to = this.getPageLetters(listObject, fromItemIndex, toItemIndex, nextItemIndex);
		var option = createTiddlyElement(pageSelect, 'option', null, '', PaginatedListView.pageDescription.format([from,to]));
		option.value = i;
	};
	var self = this;
	pageSelect.onchange = function(){
		var selected = this.options[this.selectedIndex];
		self.showPage(parseInt(selected.value));
	}
	this.pageSelect = pageSelect;
	return pageCell;
};

PaginatedListView.prototype.getPageLetters = function(listObject, previousItemIndex, itemIndex, nextItemIndex)
{
	var previousItemText = !listObject[previousItemIndex]? '' :  listObject[previousItemIndex].title;
	var itemText = listObject[itemIndex].title;
	var nextItemText = !listObject[nextItemIndex]? '' : listObject[nextItemIndex].title;
	return this.getLetters(previousItemText, itemText, nextItemText);
};

PaginatedListView.prototype.getLetters = function(previousText, text, nextText)
{
	var okLast = false;
	var okPrev = false;
	for (var i=0; i<text.length; i++) {
		if (!okLast && text[i] != nextText[i]) {
			okLast = true;
		}
		if (!okPrev && text[i] != previousText[i]) {
			okPrev = true;
		}
		if (okLast && okPrev) {
			return text.substring(0, i + 1) + '...';
		}
	};
	return text;
};

PaginatedListView.prototype.showPage = function(pageNumpber)
{
		var table = this.table;
		var elementsPerPage = this.getElementsPerPage();
		var startIndex = (pageNumpber) * elementsPerPage;
		//remove all rows
		for (; 0 < table.rows.length;) {
			table.removeChild(table.rows[0]);
		};
		var elementsCount = this.elements.length - startIndex;
		if (elementsCount > elementsPerPage) {
			elementsCount = elementsPerPage;
		}
		for (var i = 0; i < elementsCount; i++) {
			table.appendChild(this.elements[i + startIndex]);
		};
		this.page = pageNumpber; 
};

PaginatedListView.prototype.getCheckboxes = function()
{
	var checkboxes = [];
	for (var i = 0; i < this.elements.length; i++) {
		var cbs = this.elements[i].getElementsByTagName('input');
		for (var j = 0; j < cbs.length; j++) {
			checkboxes.push(cbs[j]);
		};
	};
	return checkboxes;
};

PaginatedListView.prototype.forEachSelector = function(callback)
{
	var checkboxes = this.getCheckboxes();
	var hadOne = false;
	for(var t=0; t<checkboxes.length; t++) {
		var cb = checkboxes[t];
		if(cb.getAttribute('type') == 'checkbox') {
			var rn = cb.getAttribute('rowName');
			if(rn) {
				callback(cb,rn);
				hadOne = true;
			}
		}
	}
	return hadOne;
};

PaginatedListView.prototype.getSelectedRows = function()
{
	var rowNames = [];
	this.forEachSelector(function(e,rowName) {
		if(e.checked)
			rowNames.push(rowName);
	});
	return rowNames;
};

PaginatedListView.prototype.goToFirstPage = function()
{
	this.goToPage(0);
};
PaginatedListView.prototype.goToPreviousPage = function()
{
	this.goToPage(this.pageSelect.selectedIndex - 1);
};

PaginatedListView.prototype.goToNextPage = function()
{
	this.goToPage(this.pageSelect.selectedIndex + 1);
};

PaginatedListView.prototype.goToLastPage = function()
{
	this.goToPage(this.pageSelect.length - 1);
};

PaginatedListView.prototype.goToPage = function(pageIndex)
{
	if (pageIndex >= 0 && pageIndex < this.pageSelect.length) {
		this.pageSelect.selectedIndex = pageIndex;
		this.pageSelect.onchange();
	}
};

PaginatedListView.prototype.elements = [];
PaginatedListView.prototype.page = 0;
PaginatedListView.prototype.pageSelect;
PaginatedListView.prototype.getElementsPerPage = function() {
	return parseInt(config.options.txtElementsPerPage);
};

if (!config.options.txtElementsPerPage) {
	config.options.txtElementsPerPage = '10';
}
PaginatedListView.prototype.columnCount = 1;
PaginatedListView.pageControlStyle = 'pageControl';
PaginatedListView.prototypetable;
PaginatedListView.paginatedStyle = 'paginated';
PaginatedListView.backwardsLinksStyle = ' backwardsLinks';
PaginatedListView.pageSelectStyle= ' pageSelect';

// User messages
PaginatedListView.firstLabel = 'first';
PaginatedListView.previousLabel = 'previous';
PaginatedListView.nextLabel = 'next';
PaginatedListView.lastLabel = 'last';
PaginatedListView.pageDescription = '"%0" to "%1"';

PaginatedListView.forwardLinksSpec = {};
PaginatedListView.forwardLinksSpec.links = [
		{label:PaginatedListView.nextLabel,
		 func:'goToNextPage'},
		{label: PaginatedListView.lastLabel,
		 func:'goToLastPage'}];
PaginatedListView.forwardLinksSpec.style = PaginatedListView.pageControlStyle;
PaginatedListView.backwardLinksSpec = {};
PaginatedListView.backwardLinksSpec.links = [
		{label:PaginatedListView.firstLabel,
		 func: 'goToFirstPage'},
		{label: PaginatedListView.previousLabel,
		 func: 'goToPreviousPage'}];
PaginatedListView.backwardLinksSpec.style = PaginatedListView.pageControlStyle + PaginatedListView.backwardsLinksStyle
/*}}}*/