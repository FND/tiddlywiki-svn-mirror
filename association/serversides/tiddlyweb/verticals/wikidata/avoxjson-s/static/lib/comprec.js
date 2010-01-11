/* to move tabs into a clickable tab interface */
$(document).ready(function() {
	var tabWidth, tabMargin, newWidth;
	$('#recordcontainer .record').each(function() {
		var $elem = $(this);
		$elem.css({'float':'left','position':'absolute'});
		if(!$elem.hasClass("selected")) {
			$('.entitycontent',$elem).hide();
		}
	});
	$('#recordcontainer .tab').click(function() {
		//var i = $('#recordcontainer .tab').index(this);
		$('#recordcontainer .record.selected').removeClass('selected').find('.entitycontent').hide();
		$(this).parent().addClass('selected').end().next().show();
	}).each(function(i) {
		var $elem = $(this);
		$elem.css({'position':'absolute','top':'-35px','cursor':'pointer'});
		if(i===0) {
			tabWidth = $elem.width();
			tabMargin = 5; //parseInt($elem.css('marginRight'),10); doesn't work in Safari
		} else {
			newWidth = (tabWidth+tabMargin);
			$(this).css('left',newWidth*i+'px');
		}
	});
	$('#recordcontainer .tab').eq(0).click();
	var $companyDiv = $('#recordcontainer');
	if($companyDiv.length) {
		$companyDiv.css("visibility","visible");
		window.gMaps.op_address = $.trim($companyDiv.find('.adr div').text().replace(/[\n|\r]/g,"").replace(/(\s)+/g," "));
	}
});