
jQuery(document).ready(function() {
	module("AdvancedEditTemplate");

	test("setMetaData and getMetaData", function() {
		var actual, expected;


		config.macros.AdvancedEditTemplate.setMetaData("tiddlerX","fieldy","valueY");
		config.macros.AdvancedEditTemplate.setMetaData("tiddlerX","fielda","valueA");
		config.macros.AdvancedEditTemplate.setMetaData("tiddlerX","fieldB","valueB");
		config.macros.AdvancedEditTemplate.setMetaData("tiddlerX","bah","null");
					
		actual = config.macros.AdvancedEditTemplate.getMetaData("tiddlerX","fieldy");
		expected = "valueY";
		same(actual, expected, "after setting a field even if tiddler doesn't exist it should be retrievable");

		actual = config.macros.AdvancedEditTemplate.getMetaData("tiddlerX","fielda");
		expected = "valueA";
		same(actual, expected, "setting a field on an existing tiddler");
		
		actual = config.macros.AdvancedEditTemplate.getMetaData("tiddlerX","fieldB");
		expected = "valueB";
		same(actual, expected, "metafields with capitals should be rewritten lowercase");
		
		actual = config.macros.AdvancedEditTemplate.getMetaData("tiddlerX","bah");
		expected = false;
		same(actual, expected, "keyword 'null' is reserved for resetting field value. Should save as false");
		

	});
	test("createDropDownMenu unsorted", function() {
		/*setup */
		var actual, expected;
		var ev,el;

		var opts =["Menu 1>","Option 1.1","Option 1.2<","Menu 2>","Option 2.1:special value", "Option 2.2>","Option 2.2.1","Option 2.2.2<", "Option 2.3<","Menu 3" ];
		var initialValue = "MM..";
		var selected = "Option 2.2.2";
		var sort = false;
		var handler = function(){
			
		};
		/*
		MM..
		Menu 1
			MM..
			Option 1.1
			Option 1.2
		Menu 2
			MM..
			Option 2.1
			Option 2.2
				MM..
				Option 2.2.1
				Option 2.2.2
			Option 2.3
		Menu 3
		*/
		var place = document.createElement("div");
		/*run */
		config.macros.AdvancedEditTemplate.createDropDownMenu(place,"fNaMe",opts,initialValue,handler,selected,sort)
		
		/*verify */
		expected = 4;
		actual = place.childNodes.length;
		same(actual, expected, "4 top level menus should be created with syntax given (initialValue, option 1, option 2 and option 3)");

		expected = 'null';
		actual = place.childNodes[0].value;
		same(actual, expected, "Menu 1 menu initialValue should have null value and not be saveable.");
		
		expected = 4;
		actual = place.childNodes[2].length;
		same(actual, expected, "Menu 2 should have 3 kids + please select");
		expected = 'null';
		actual = place.childNodes[2][0].value;
		same(actual, expected, "Menu 3 menu initialValue should have null value and not be saveable.");
	
		expected = 'Menu 2>Option 2.1:special value';
		actual = place.childNodes[2][1].value;
		same(actual, expected, "Menu 2.1 value is correct");
		
		expected = 'Option 2.1';
		actual = place.childNodes[2][1].innerHTML;
		same(actual, expected, "Menu 2.1 inner html is correct");


	});
	
	test("setDropDownMetaData", function() {
		var actual, expected;
		var ev,el;

		config.macros.AdvancedEditTemplate.setDropDownMetaData(ev,el);
		//story.findContainingTiddler(el);	

	});
	
	
	test("_createMenus", function(){
		
		var opts= ["toolbox1>","spanner","hammer<", "toolbox2>","screwdriver"];
		var actual = config.macros.AdvancedEditTemplate._createMenus(opts);
		var emenu1 = {options:[{caption:"toolbox1",value:"toolbox1",childMenu: 1},{caption:"toolbox2", value: "toolbox2",childMenu: 2}]};
		var emenu2 = {options:[{caption:"spanner",value:"toolbox1>spanner"},{caption:"hammer", value: "toolbox1>hammer"}]};
		var emenu3 = {options:[{caption:"screwdriver",value:"toolbox2>screwdriver"}]};
		
	
		var actual =config.macros.AdvancedEditTemplate._createMenus(opts);
		same(actual.length, 3, "_createMenus returns the right number of menus");
		same(actual[0], emenu1, "_createMenus returns the expected data structure for menu 1");
		same(actual[1], emenu2, "_createMenus returns the expected data structure for menu 2");
		same(actual[2], emenu3, "_createMenus returns the expected data structure for menu 3");
	});
	
	test("setDropDownMetaData", function(){
		/*setup */
		var expected,actual;
		var opts =["Menu 1>","Option 1.1","Option 1.2<","Menu 2>","Option 2.1:special value", "Option 2.2>","Option 2.2.1","Option 2.2.2<", "Option 2.3<","Menu 3" ];
		var initialValue = "MM..";
		var selected = "Option 2.2.2";
		var sort = false;
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");
		
		config.macros.AdvancedEditTemplate.createDropDownMenu(place,"testMeTa",opts,initialValue,handler,selected,sort)		
		var real = story.findContainingTiddler;
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("tiddler","GettingStarted");
			return mockdom;
		};
		story.findContainingTiddler = mockf;

		/* verify only root menu is visible */
		actual =place.childNodes[2].style.display;
		expected ="none";
		same(actual, expected, "sub menu starts off hidden (only revealed when selected)");
		
		/*run: select Option 2.2.1*/
		place.childNodes[0].selectedIndex = 2;
		place.childNodes[0].onchange(window.event);
		
		/*verify */
		actual =place.childNodes[2].style.display;
		expected ="";
		same(actual, expected, "when change occurs sub menu becomes visible");
		expected = "Menu 2";
		actual = config.macros.AdvancedEditTemplate.getMetaData("GettingStarted","testmeta");
		same(actual, expected, "change in an option at top level dropdown saves correct value to correct field");
		
		
		/*run: select Option 2.2.1*/
		place.childNodes[0].selectedIndex = 2;
		place.childNodes[2].selectedIndex = 2;
		place.childNodes[3].selectedIndex = 1;
		place.childNodes[3].onchange(window.event);
		
		expected = "Menu 2>Option 2.2>Option 2.2.1";
		actual = config.macros.AdvancedEditTemplate.getMetaData("GettingStarted","testmeta");
		same(actual, expected, "change in an option at A SUBMENU dropdown saves correct value to correct field");
		
		place.childNodes[2].selectedIndex = 3;
		place.childNodes[2].onchange(window.event);
		same(place.childNodes[3].style.display, "none", "menu containing 2.2.1 should be invisible");
		same(place.childNodes[2].style.display, "", "menu containing option 2.1 should be visible");
		same(place.childNodes[1].style.display, "none", "menu containing Option 1.1 should be invisible");
		
		
		/*rollback */
		story.findContainingTiddler = real;
	
	});


});