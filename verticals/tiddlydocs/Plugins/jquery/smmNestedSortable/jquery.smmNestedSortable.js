/*
smmNestedSortable jQuery Plugin 

version : 0.1 

By Simon McManus (simonmcmanus.com)

Licence: BSD Open Source Licence

TODO : 
1: Pass in tolerance paramter.
2: Allow all params available in sortables to be passed into smmNestedSortable.

*/

(function($) {
$.fn.smmNestedSortable = function(options) {
    settings = $.extend({
        global: true
    }, options);
    this.each(function() {
        $(this).sortable({
            items: "li",
            helper: "helper",
            connectWith: '.sortable',
            placeholder: 'placeholder',
            sort: function(event, ui) {
                $(ui.placeholder).empty();
                if (ui.position.left - 10 > ui.originalPosition.left)	// make child
                	$(ui.placeholder).append("<ul class='sortable'>" + $(ui.item).html() + "</ul>");
            },
            stop: function(event, ui) {
                $.fn.smmNestedSortable.change(event, ui);
                if (settings.serializer != undefined){
               		settings.serializer();
				}
            },
        });
    });
    return this;
};
$.fn.smmNestedSortable.change = function(event, ui) {
    if (ui.position.left - 10 > ui.originalPosition.left) {	// make child - could/should add some more check in here.
        if ($(ui.item).prev().is('li')) {
            $(ui.item).prev().append(ui.item);
            $(ui.item).wrap("<ul class='sortable'></ul>");
        }
    } else if (ui.position.left - 10 < ui.originalPosition.left) {	// kill child
        if ($(ui.item).parent().is("ul")) {	// confirm its not the base level element	
            if ($(ui.item).parent().children().length <= 1) {	// if only item in the list
                $(ui.item).parent().replaceWith($(ui.item));	// put outside not inside parent li
            }
        }
    }
    // cleanup unused lists
    $('ul.sortable, ul.sortable li').each(function() {
        if ($(this).text() == "")	// if only item and item is empty.
        	$(this).remove();	// remove the parent li
    });
    $('.sortable').sortable("refresh");
};
})(jQuery);