/* to move tabs into a clickable tab interface */
$(document).ready(function() {
	var tabWidth, tabMargin, newWidth;
	$('#recordcontainer .record').each(function() {
		var $elem = $(this);
		$elem.css({'float':'left'});
		$('.entitycontent', $elem).css({
			"position":"absolute",
			"left":"0"
		});
		if(!$elem.hasClass("selected")) {
			$('.entitycontent',$elem).hide();
		}
	});
	$('#recordcontainer .tab').click(function() {
		//var i = $('#recordcontainer .tab').index(this);
		$('#recordcontainer .record.selected').removeClass('selected').find('.entitycontent').hide();
		$(this).parent().addClass('selected').end().next().show();
	}).each(function(i) {
		if(i!==0) {
			$(this).css("margin-left","5px");
		}
	});
	$('#recordcontainer .tab').eq(0).click();
	var $companyDiv = $('#recordcontainer');
	if($companyDiv.length) {
		$companyDiv.css("visibility","visible");
		var addressText = $.trim((//$companyDiv.find('.adr .street-address').text() + " " +
			$companyDiv.find('.adr .locality').text() + " " +
			$companyDiv.find('.adr .region').text() + " " +
			$companyDiv.find('.adr .country-name').text() + " " +
			$companyDiv.find('.adr .postal-code').text()).replace(/[\n|\r]/g,"").replace(/(\s)+/g," "));
		console.log(addressText);
		window.gMaps.op_address = addressText;
	}
});