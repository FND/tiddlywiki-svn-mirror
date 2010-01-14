/* to move tabs into a clickable tab interface */
$(document).ready(function() {
	var tabWidth, tabMargin, newWidth;
	var $companyDiv = $('#recordcontainer');
	if($companyDiv.length) {
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
			var i = $('#recordcontainer .tab').index(this);
			$('#recordcontainer .record.selected').removeClass('selected').find('.entitycontent').hide();
			var $entitycontent = $(this).parent().addClass('selected').end().next();
			if(i>0) {
				$entitycontent.css({
					"left": -($(this).width()*i + 5*(i-1))
				});
			}
			$entitycontent.show();
			var origHeight = $('#recordcontainer').height();
			var overlap = origHeight+$companyDiv.offset().top - ($entitycontent.height()+$entitycontent.offset().top);
			/* 24 is entitycontent padding; 10 is added spacing around alt-buttons */
			$('#recordcontainer').height(origHeight-overlap+24+$('.alt-buttons:eq(0)').height()+10);
			/* that calculation is not efficient, but more understandable than removing origHeight from equation */
		}).each(function(i) {
			if(i!==0) {
				$(this).css("margin-left","5px");
			}
		});
		$companyDiv.removeClass('hide').css("visibility", "visible");
		$('#recordcontainer .tab').eq(0).click();
		var addressText = $.trim((//$companyDiv.find('.adr .street-address').text() + " " +
			$companyDiv.find('.adr .locality').text() + " " +
			$companyDiv.find('.adr .region').text() + " " +
			$companyDiv.find('.adr .country-name').text() + " " +
			$companyDiv.find('.adr .postal-code').text()).replace(/[\n|\r]/g,"").replace(/(\s)+/g," "));
		window.gMaps.op_address = addressText;
	}
});