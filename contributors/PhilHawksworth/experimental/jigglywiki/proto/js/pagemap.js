jw.pagemap = {};

jw.pagemap.render = function() {

	// add the pagemap element
	$('body').append('<div id=\'pagemap\'></div>');

	// create click handlers for all future pagemap elements
	var map = $('#pagemap');
	map.click(function(e){
		e.preventDefault();
		if( $(e.target).is('div') ) {
			var t = $(e.target).find('a.tiddlerLink');
			jw.tiddlerLinkClick.apply(t, [t, 'story1', {position: 'before'}]);
		}
	});
	map.mouseover(function(e){
		if($(e.target).is('div')){
			var t = $(e.target).attr('title');
			if($('#popup_div').length == 0) {
				$('body').append('<div id=\'popup_div\'></div>');			
			}
			var pop = $('#popup_div').text(t);
			x = $(e.target).width();
			y = $(e.target).offset().top;		
			pop.css({right:x, top:y}).swooshIn();
		}
	});
	map.mouseout(function(e){
		if($(e.target).is('div')){
			$('#popup_div').remove();
		}
	});
	
	// handle windoe resoez and scrolling events
	$(window).resize(function(ev){
		jw.pagemap.resize();
	});
	$(window).scroll(function(ev){
		$('#popup_div').remove();
	});
	
	jw.pagemap.refresh();	
};


// Populate the pagemap according to the contents of the story
jw.pagemap.refresh = function() {
	var map = $('#pagemap');
	var mapHtml = "";
	$('#story1 div.tiddler').each(function(){
		var name = $(this).find('h1.tiddlerName').text();
		mapHtml += "<div title='"+name+"'><a class='tiddlerLink' href='tiddler:"+name.replace(/ /g,'_')+"'></a></div>";
	});
	map.html(mapHtml);
	jw.pagemap.resize();
};


// Resize the pagemap elements in the current display size.
jw.pagemap.resize = function() {
	var mapHeight = $('#pagemap').height();
	var storyHeight = 0;
	$('#story1 div.tiddler').each(function() {
		storyHeight += $(this).height();
	});
	$('#story1 div.tiddler').each(function(e, n) {
		var pct = parseInt((100 / storyHeight) * $(this).height());
		var mapPct = parseInt((mapHeight / 100) * pct);
		$('#pagemap div').slice(e,e+1).css({'height': mapPct});
	});
};