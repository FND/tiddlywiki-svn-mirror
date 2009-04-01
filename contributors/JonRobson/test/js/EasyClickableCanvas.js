jQuery(document).ready(function() {
	module("EasyClickableCanvas");

	test("check setup with string", function() {
		var actual, expected;
		var el = document.createElement("div");
		el.id = "myel";
		document.body.appendChild(el);
		/* run */
		var s = new EasyClickableCanvas("myel");

		
		expected = s;
		actual = el.easyClicking;
		same(actual,expected, "dom element tied to easyclickablecanvas js variable");	
		expected = "CANVAS";
		actual = el.childNodes[0].tagName;
		/*verify */
		same(actual,expected, "canvas has been created as child");

	});
	
});