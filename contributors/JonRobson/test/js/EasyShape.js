jQuery(document).ready(function() {
	module("EasyShapes:Polygons");

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

	
	test("EasyShape optimise a polygon which is too small for the eye to see", function() {
		/*setup */
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,400,0)'};
		var coords = [20,30];
		var beforehijack = EasyOptimisations.easyShapeIsTooSmall;
		EasyOptimisations.easyShapeIsTooSmall = function(shape,t) { return true; };
		var beforehijacktwo = EasyOptimisations.easyShapeIsInVisibleArea;
		EasyOptimisations.easyShapeIsInVisibleArea = function(a,b,c) { return true; };
		var s = new EasyShape(properties,coords);
		

		/* run */
		actual = s.optimise(false,{});

		/*verify */
		expected = false;
		same(actual,expected, " optimise should return false when the shape is too small to be drawn");
		
		EasyOptimisations.easyShapeIsTooSmall = beforehijack;
		EasyOptimisations.easyShapeIsInVisibleArea = beforehijacktwo;
	});
	

	test("check bounding box of polygon (getBoundingBox)", function() {
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,0,0)'};
		var coords = [300,0,100,0,100,100,0,300];
		var s = new EasyShape(properties,coords);
		actual = s.getBoundingBox();
		expected = {x1: 0, x2:300, y1:0,y2:300,width: 300, height:300,"center": { "x": 150, "y": 150 }};
		same(actual,expected, "bounding box for polygon has been set correctly");
	
	});
	test("check set/get properties", function() {
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,0,0)'};
		var coords = [0,0,100,0,100,100,0,300];
		var s = new EasyShape(properties,coords);
		/* run */
		s.setProperty("fill","rgb(255,0,255)")
		/*verify */
		expected = "rgb(255,0,255)";
		actual = s.getProperty("fill")
		same(actual,expected, "set and get Properties works correctly");
	
	});
	
	test("changing coordinates of polygon changes bounding box", function() {
		var actual, expected;
		var properties = {shape:'polygon', fill: 'rgb(255,0,0)'};
		var coords = [0,0,100,0,100,100,0,300];
		var s = new EasyShape(properties,coords);
		/* run */
		s.setCoordinates([0,0,50,0,50,50,0,200])
		
		/*verify */
		expected = {x1: 0, x2:50, y1:0, y2: 200,width: 50, height: 200,"center": { "x": 25, "y": 100 }};
		actual = s.getBoundingBox();
		same(actual,expected, "setCoordinates of polygon changes bounding box");
	
	});
	
	
	module("EasyShape:points");
	test("check setup of point", function() {
		/*setup */
		var actual, expected;
		var properties = {shape:'point', fill: 'rgb(255,400,0)'};
		var coords = [0,0];
		
		/* run */
		var s = new EasyShape(properties,coords);
		var result = s.getProperties();
		
		/*verify */
		same(result.shape, "point", "Shape Property for polygon has been set correctly");
		same(result.fill, "rgb(255,400,0)", "Fill Property for polygon has been set correctly");

	});

	
	test("check bounding box of a point without a specifically defined radius", function() {
		/*setup */
		var actual, expected;
		var properties = {shape:'point', fill: 'rgb(255,400,0)'};
		var coords = [20,30];
		var s = new EasyShape(properties,coords);

		/* run */
		var actual = s.getBoundingBox();
		expected = {x1: 19.5, x2: 20.5, y1: 29.5, y2: 30.5, width: 1, height:1, center: {x: 20, y: 30}};
		/*verify */
		same(actual,expected, "radius should default to 0.5 and bounding box should be correct");
	});
	

	module("EasyShape:circle");
	test("check setup of circle", function(){
		var c = new EasyShape({shape:'circle',fill:'rgb(0,255,0)'},[50,75,80]);
		var expected,actual;
		
		expected = 80;
		actual = c.getRadius();
		same(actual,expected,"Radius has correctly been set");
		
		expected = [50,75];
		actual = c.getCoordinates();
		same(actual,expected,"coordiantes has correctly been set");	

		expected = "circle";
		actual = c.getShape();
		same(actual,expected,"shape type is correct");				
		
		expected = {x1:-30,x2:130, y1:-5,y2: 155,center:{x:50,y:75}, width:160, height:160};
		actual = c.getBoundingBox();
		same(actual,expected,"shape bounding box is correct");		
		
	});
	
	
	module("EasyShape:image");
	test("check setup of image", function(){
		var c = new EasyShape({shape:'image',src:'test.jpg',width:100,height:40},[-180,-20]);
		var expected,actual;
		
		expected = [-180,-20];
		actual = c.getCoordinates();
		same(actual,expected,"coordinates has correctly been set");	

		expected = "image";
		actual = c.getShape();
		same(actual,expected,"shape type is correct");				
		
		expected  = 100;
		actual = c.getDimensions().width;
		same(actual,expected,"dimensions set correctly width");			
		expected  = 40;
		actual = c.getDimensions().height;
		same(actual,expected,"dimensions set correctly height");	
		
		expected = {x1:-230,x2:-130, y1:-40,y2: 0,center:{x:-180,y:-20}, width:100, height:40};
		actual = c.getBoundingBox();
		same(actual,expected,"shape bounding box is correct");		
		
	});
	
	
	test("ie vml transforming (tests _transformDomElement and _csstransform)", function(){
		var shape = new EasyShape({shape:'image',src:'test.jpg',width:100,height:40},[-180,-20]);
		var canvas = document.createElement("div");
		var expected,actual;
		var vml = new EasyVML(shape,canvas);
		var t=  {translate:{x:100,y:100},scale:{x:2,y:2},origin:{x:300,y:300}};
		//run
		vml._cssTransform(t,canvas);
		var el = vml.getVMLElement();
		
		console.log("it",el);
		//verify
		expected = "200px";
		actual = el.style.width;
		same(actual,expected,"width set correctly");
		
		expected = "80px";
		actual = el.style.height;
		same(actual,expected,"height set correctly");
		
		expected = 300 + (2 * (-20+100));
		actual = el.style.top;
		same(actual,expected+"px","top set correctly");
		
		expected = 300 + (2 * (-180 +100));
		actual = el.style.left;
		same(actual,expected+"px","left set correctly");		
		
	});


	
});
