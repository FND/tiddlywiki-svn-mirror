jQuery(document).ready(function() {
	module("EasyShapes");

	test("check setup of polygon", function() {
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,0,0)'};
		var coords = [0,0,100,0,100,100,0,100];
		var s = new EasyShape(properties,coords);

		var result = s.getProperties();
		
		/*verify */
		same(result.shape, properties.shape, "Shape Property for polygon has been set correctly");
		same(result.fill, properties.fill, "Fill Property for polygon has been set correctly");

	});



	
	test("check bounding box of polygon (getBoundingBox)", function() {
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,0,0)'};
		var coords = [0,0,100,0,100,100,0,300];
		var s = new EasyShape(properties,coords);
		actual = s.getBoundingBox();
		expected = {x1: 0, x2:100, y1:0,y2:300};
		same(actual,expected, "bounding box for polygon has been set correctly");
	
	});
	test("check set/get properties", function() {
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,0,0)'};
		var coords = [0,0,100,0,100,100,0,300];
		var s = new EasyShape(properties,coords);
		/* run */
		s.setProperties({fill: 'rgb(255,255,0)'});
		
		/*verify */
		expected = {fill: 'rgb(255,255,0)'};
		actual = s.getProperties();
		same(actual,expected, "setProperties works correctly");
	
	});
	
	test("changing coordinates of polygon changes bounding box", function() {
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,0,0)'};
		var coords = [0,0,100,0,100,100,0,300];
		var s = new EasyShape(properties,coords);
		/* run */
		s.setCoordinates([0,0,50,0,50,50,0,200])
		
		/*verify */
		expected = {x1: 0, x2:50, y1:0, y2: 200};
		actual = s.getBoundingBox();
		same(actual,expected, "setCoordinates of polygon changes bounding box");
	
	});
	
	
	
};
