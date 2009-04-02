jQuery(document).ready(function() {
	var images = jQuery("img");

	for(var i=0; i < images.length; i++){
	var newel = document.createElement("div");
	newel.className = "zoomyimg";
	var el = images[i];
	var width = jQuery(el).width();
	var height = jQuery(el).height();
	jQuery(newel).css({width: el.width, height: height});
	el.parentNode.appendChild(newel);
	el.parentNode.replaceChild(newel, el);
	var imgproperties = {shape:'image',src:el.src,width:width,height:height};
	var x = new EasyClickableCanvas(newel,[new EasyShape(imgproperties,[-width/2,-height/2])]);
	var c = new EasyController(x,newel);
	x.render();
	}
});

