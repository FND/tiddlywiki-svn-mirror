// Define the animation effect for the tiddler display.
jQuery.fn.tiddlerDisplayAnim = function(options) {
	var defaults = {
		animSrc: null
	};
	var opts = $.extend(defaults, options);
	var ghost = $('<div id=\'ghost\'></div>');
	if(!opts.animSrc) {
		return;
	}
	$('body').append(ghost);
	ghost.css({opacity: '0.3', width: opts.animSrc.width(), height: opts.animSrc.height(), top: opts.animSrc.offset().top, left: opts.animSrc.offset().left} );
	ghost.animate({width: this.width(), height: this.height(), top: this.offset().top, left: this.offset().left} , 500, function() { ghost.remove(); });
};


// Popup context menu anims.
jQuery.fn.swooshIn = function(){
	var end = this.css('top');
	var start = parseInt(end.substr(0,end.length-2)) + 5 + 'px';
	this.hide().css({top:start, opacity: '0.96', 'white-space': 'no-wrap'});
	this.animate({top:end, opacity:'show'}, 200);
	return this;
};
jQuery.fn.swooshOut = function(){
	var start = this.css('top');
	var end = parseInt(start.substr(0,start.length-2)) - 50 + 'px';
	this.animate({top:end, opacity:'0'}, 200, function(){ $(this).remove(); });
	return this;
};