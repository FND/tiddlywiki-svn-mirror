var loadJQueryExtensions = function() {
	
	jQuery.fn.reverse = Array.prototype.reverse;
	
	jQuery.fn.swooshIn = function(){
		var end =  this.css('top');
		var start = parseInt(end.substr(0,end.length-2)) + 5 + 'px';
		this.hide().css({top:start, opacity: '0.96'});
		this.animate({top:end, opacity:'show'}, 200);
		return this;
	};
	jQuery.fn.swooshOut = function(){
		var start =this.css('top');
		var end = parseInt(start.substr(0,start.length-2)) - 50 + 'px';
		this.animate({top:end, opacity:'0'}, 200, function(){ $(this).hide(); });
		return this;
	};
	
};

