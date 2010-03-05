var oldCheckHover = jQuery.iNestedSortable.checkHover;
jQuery.iNestedSortable.checkHover = function(e,o) {
	if(!jQuery(e).hasClass('notHoverable'))
		oldCheckHover(e,o);
}