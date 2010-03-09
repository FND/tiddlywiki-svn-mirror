/*

Allows the nexted sortable list to be given a class of notHoverable which will mean items cannot be dragged into the list from other droppable lists. 

*/

var oldCheckHover = jQuery.iNestedSortable.checkHover;
jQuery.iNestedSortable.checkHover = function(e,o) {
	if(!jQuery(e).hasClass('notHoverable'))
		oldCheckHover(e,o);
}