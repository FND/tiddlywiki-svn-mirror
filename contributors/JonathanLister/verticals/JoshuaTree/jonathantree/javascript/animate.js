var anim = typeof Animator == "function" ? new Animator() : null; // Animation engine

var config = {
	animDuration:500
};

var classes = {
	'title1':toggleChildren,
	'title2':toggleChildren
};

var elements = ["h2","h3"];

function toggleChildren() {
	var elem = hasClass(this.nextSibling,"content") ? this.nextSibling : this.nextSibling.nextSibling;
	var animation;
	var isOpen = elem.open;
	if(typeof Slider == "function") {
		anim.startAnimating(new Slider(elem,!isOpen,null,"none"));
		elem.open = !isOpen;
	}
	if(isOpen) {
		// window.scrollTo(0,ensureVisible(this));
	} else {
		window.setTimeout(function() {
			//window.scrollTo(0,ensureVisible(elem));
			anim.startAnimating(new Scroller(elem));
		},config.animDuration);
	}
}

(function initHandlers() {

	var headers = [];
	var header;
	
	for(var i=0; i<elements.length; i++) {
		headers = document.getElementsByTagName(elements[i]);
		for(var j=0; j<headers.length; j++) {
			header = headers[j];
			for (var n in classes) {
				if(hasClass(header,n)) {
					header.onclick = classes[n];
					header.open = false;
				}
			}
		}
	}
})();

// register handlers on page load - BUG: onload doesn't happen until the images have loaded?
// window.onload = initHandlers;

