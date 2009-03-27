
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
		actual = place.childNodes[0][0].value;
		same(actual, expected, "Menu 1 menu initialValue should have null value and not be saveable.");
		
		expected = 4;
		actual = place.childNodes[2].length;
		same(actual, expected, "Menu 2 should have 3 kids + please select");
		expected = 'null';
		actual = place.childNodes[2][0].value;
		same(actual, expected, "Menu 3 menu initialValue should have null value and not be saveable.");
	
		expected = 'special value';
		actual = place.childNodes[2][1].value;
		same(actual, expected, "Menu 2.1 value is correct");
		
		expected = 'Option 2.1';
		actual = place.childNodes[2][1].innerHTML;
		same(actual, expected, "Menu 2.1 inner html is correct");
		document.getElementById("tiddlerGettingStarted").appendChild(place);

	});
	
	
	test("createDropDownMenu simple", function() {
		/*setup */
		var actual, expected;
		var ev,el;

		var opts =["1", "2","3","4"];
		var initialValue = "MM..";
		var selected = "3";
		var sort = false;
		var handler = function(){
			
		};
		var place = document.createElement("div");
		/*run */
		config.macros.AdvancedEditTemplate.createDropDownMenu(place,"blah",opts,initialValue,handler,selected,sort)
		
		/*verify */
		expected = 5;
		actual = place.childNodes[0].childNodes.length;
		same(actual, expected, "4 top level menus should be created with syntax given (initialValue, option 1, option 2 and option 3)");

		expected = 3;
		actual = place.childNodes[0].selectedIndex;
		same(actual, expected, "selected right option");
		
	

	});
	
	
	test("setDropDownMetaData: visibility and saving", function() {
		var actual, expected;
		var ev,el;

		config.macros.AdvancedEditTemplate.setDropDownMetaData(ev,el);
		//story.findContainingTiddler(el);	

	});
	
	
	test("_createMenus", function(){
		
		var opts= ["toolbox1>","spanner","hammer<", "toolbox2>","screwdriver"];
		var actual = config.macros.AdvancedEditTemplate._createMenus(opts);
		var emenu1 = {depth:0, options:[{caption:"toolbox1",value:"toolbox1",childMenu: 1},{caption:"toolbox2", value: "toolbox2",childMenu: 2}]};
		var emenu2 = {depth:1, options:[{caption:"spanner",value:"spanner"},{caption:"hammer", value: "hammer"}]};
		var emenu3 = {depth:1, options:[{caption:"screwdriver",value:"screwdriver"}]};
		
	
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
		var selected = "";
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
		same(actual, expected, "sub menu with 2.1 in it starts off hidden (only revealed when selected)");

			
		/*run: select Option 2.2.1*/
		place.childNodes[0].selectedIndex = 2; //select "menu 2""
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
		
		expected = "Option 2.2.1";
		actual = config.macros.AdvancedEditTemplate.getMetaData("GettingStarted","testmeta");
		same(actual, expected, "change in an option at A SUBMENU dropdown saves correct value to correct field");
		
		place.childNodes[2].selectedIndex = 3; //select option 2.3
		place.childNodes[2].onchange(window.event);
		same(place.childNodes[3].style.display, "none", "menu containing 2.2.1 should be invisible");
		same(place.childNodes[2].style.display, "", "menu containing option 2.1 should be visible");
		same(place.childNodes[1].style.display, "none", "menu containing Option 1.1 should be invisible");
		
		actual = config.macros.AdvancedEditTemplate.getMetaData("GettingStarted","testmeta");
		expected = "Option 2.3"
		same(actual, expected, "change in an option at top level dropdown saves correct value to correct field");
		
		/*rollback */
		story.findContainingTiddler = real;
	
	});


	test("setDropDownMetaData: Sorting", function(){
		/*setup */
		var expected,actual;
		var opts =["Asia>", "Japan", "Taiwan", "China<", "Europe>", "UK", "France"];
		var initialValue = "MM..";
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");

		config.macros.AdvancedEditTemplate.createDropDownMenu(place,"country1",opts,initialValue,handler,"",true);
		
		expected = "China";
		actual = place.childNodes[1][1].innerHTML;
		same(actual, expected, "options correctly sorted - China at top of list 2");
		
		expected = "UK";
		actual = place.childNodes[2][2].innerHTML;
		same(actual, expected, "options correctly sorted UK at bottom of list 3");
		
		
	});

	test("setDropDownMetaData: Multifield saving", function(){
		/*setup */
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("tiddler","CrashTestDummy");
			return mockdom;
		};
		story.findContainingTiddler = mockf;
		
		var expected,actual;
		var opts =["Asia>", "Japan", "Taiwan", "China<", "Europe>", "UK", "France"];
		var initialValue = "MM..";
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");

		/* run */
		config.macros.AdvancedEditTemplate.createDropDownMenu(place,["region", "country"],opts,initialValue,handler,"",true);
		place.childNodes[0].selectedIndex = 1; //select ASIA
		place.childNodes[1].selectedIndex = 1; //select CHINA
		place.childNodes[1].onchange(window.event);
		
		/* verify */
		expected = "China";
		actual = config.macros.AdvancedEditTemplate.getMetaData("CrashTestDummy","country");
		same(actual, expected, "correctly saved level 1 dropdown to country");
		expected = "Asia";
		actual = config.macros.AdvancedEditTemplate.getMetaData("CrashTestDummy","region");
		same(actual, expected, "correctly saved level 1 dropdown to region");			

		
	});
	
	
	test("setDropDownMetaData: Multifield saving if depth is 0, depths 1 and 0 get depth 0 value", function(){
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("tiddler","CrashTestDummy");
			return mockdom;
		};
		story.findContainingTiddler = mockf;
		/*setup */
		var expected,actual;
		var opts =["Asia>", "Japan", "Taiwan", "China<", "Europe>", "UK", "France"];
		var initialValue = "MM..";
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");

		/* run */

		config.macros.AdvancedEditTemplate.createDropDownMenu(place,["region", "country"],opts,initialValue,handler,"France",true);
		
		/* verify */		
		actual = place.childNodes[0].selectedIndex;
		expected = 2;
		same(actual, expected, "europe has been correctly identified as existing value");	

		actual = place.childNodes[2].selectedIndex;
		expected = 1;
		same(actual, expected, "france has been correctly identified as existing value");	

				
		/* run */
		place.childNodes[0].selectedIndex = 1; //select ASIA
		place.childNodes[1].onchange(window.event);
		
		/* verify */	
		expected = "Asia";
		actual = config.macros.AdvancedEditTemplate.getMetaData("CrashTestDummy","country");
		same(actual, expected, "correctly saved level 2 dropdown to country");
		expected = "Asia";
		actual = config.macros.AdvancedEditTemplate.getMetaData("CrashTestDummy","region");
		same(actual, expected, "correctly saved level 1 dropdown to region");	
		
		
		place.childNodes[1].selectedIndex = 3; //select Taiwan
		place.childNodes[1].onchange(window.event);		
		actual = config.macros.AdvancedEditTemplate.getMetaData("CrashTestDummy","country");
		same(actual, "Taiwan", "correctly saved level 2 dropdown to country");
		
		place.childNodes[0].selectedIndex = 2; //select Europe
		place.childNodes[0].onchange(window.event);		
		actual = config.macros.AdvancedEditTemplate.getMetaData("CrashTestDummy","country");
		same(actual, "Europe", "correctly saved level 1 dropdown to country");
		actual = config.macros.AdvancedEditTemplate.getMetaData("CrashTestDummy","region");
		same(actual, "Europe", "correctly saved level 1 dropdown to region");
		
		
	});
	
	test("handler for tiddlywiki (option menu)", function(){
		/*setup */
		var text,title,expected,actual;
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("title","test111");
			mockdom.setAttribute("tiddler","test111");
			return mockdom;
		};
		story.findContainingTiddler = mockf;
		title = "test111";
		store.saveTiddler(title,title,text,true,null,[],{dave:"2"},null);
		
		text = "1\n2\n3\n4\n";
		title = "simpledef";
		store.saveTiddler(title,title,text,true,null,[],{},null);
		
		var initialValue = "MM..";
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");
		/* run */
		var paramString = "type:dropdown valuesSource:simpledef metaDataName:dave";
		config.macros.AdvancedEditTemplate.handler(place,false,params,false,paramString,false);
		
		/* verify */
		actual = place.firstChild.selectedIndex;
		expected = 2;
		same(actual, expected, "the current value of the field is correctly selected in the drop down for a depth 1 menu");
		

		
	});
	
	test("ignore syntax that follows ## in an option definition", function(){
		/*setup */
		var text,title,expected,actual;
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("title","test111");
			mockdom.setAttribute("tiddler","test111");
			return mockdom;
		};
		story.findContainingTiddler = mockf;
		title = "test111";
		store.saveTiddler(title,title,text,true,null,[],{dave:"2"},null);
		
		text = "1\n2\n3##>ignore me \n4:value## and me! \n";
		title = "simpledef";
		store.saveTiddler(title,title,text,true,null,[],{},null);
		
		var initialValue = "MM..";
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");
		/* run */
		var paramString = "type:dropdown valuesSource:simpledef metaDataName:dave";
		config.macros.AdvancedEditTemplate.handler(place,false,params,false,paramString,false);
		
		/* verify */
		actual = place.firstChild.childNodes[3].innerHTML;
		expected = "3";
		same(actual, expected, "syntax ## has been ignored in menu item with text '3'");
		
		actual = place.firstChild.childNodes[4].innerHTML;
		expected = "4";
		same(actual, expected, "syntax ## has been ignored in menu item with text '4'");

		actual = place.firstChild.childNodes[4].value;
		expected = "value";
		same(actual, expected, "syntax ## has been ignored in menu item with text '4' and value is correct.");
		
	});
	
	test("handler for tiddlywiki (option menu depth 2)", function(){
		/*setup */
		var text,title,expected,actual;
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("title","test111");
			mockdom.setAttribute("tiddler","test111");
			return mockdom;
		};
		story.findContainingTiddler = mockf;
		title = "test111";
		store.saveTiddler(title,title,text,true,null,[],{frank:"3.1"},null);
		
		text = "1\n2\n3>\n3.1\n3.2<\n4\n";
		title = "depth2";
		store.saveTiddler(title,title,text,true,null,[],{},null);
		
		var initialValue = "MM..";
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");
		/* run */
		var paramString = "type:dropdown valuesSource:depth2 metaDataName:frank";
		config.macros.AdvancedEditTemplate.handler(place,false,params,false,paramString,false);
		
		/* verify */
		actual = place.firstChild.selectedIndex;
		expected = 3;
		same(actual, expected, "depth dropdown 1 ok");
		
		actual = place.childNodes[1].selectedIndex;
		expected = 1;
		same(actual, expected, "depth 2 drop down ok");

		
	});
	
	test("handler for tiddlywiki - run twice", function(){
		/*setup */
		var text,title,expected,actual;
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("title","salut");
			mockdom.setAttribute("tiddler","salut");
			return mockdom;
		};
		story.findContainingTiddler = mockf;
		title = "salut";
		store.saveTiddler(title,title,text,true,null,[],{frank:"3.1"},null);
		
		text = "1\n2\n3>\n3.1\n3.2<\n4\n";
		title = "depth2";
		store.saveTiddler(title,title,text,true,null,[],{},null);
		
		var initialValue = "MM..";
		var handler = config.macros.AdvancedEditTemplate.setDropDownMetaData;
		var place = document.createElement("div");
		var place2 = document.createElement("div");
		
		/* run */
		var paramString = "type:dropdown valuesSource:depth2 metaDataName:frank";
		config.macros.AdvancedEditTemplate.handler(place,false,params,false,paramString,false);
	
		var paramString = "type:dropdown valuesSource:depth2 metaDataName:james";
		config.macros.AdvancedEditTemplate.handler(place2,false,params,false,paramString,false);
		
			
		/* verify */
		place.firstChild.selectedIndex = 1;
		place.firstChild.onchange();
		
		place2.firstChild.selectedIndex = 3;
		place2.firstChild.onchange();
		
		expected = "1" 
		actual = config.macros.AdvancedEditTemplate.getMetaData("salut","frank")
		same(actual, expected, "when more than one dropdown are associated with one tiddler and manipulated both values save (frank field set ok)");
		
		expected = "3" 
		actual = config.macros.AdvancedEditTemplate.getMetaData("salut","james")
		same(actual, expected, "when more than one dropdown are associated with one tiddler and manipulated both values save (james field set ok)");


		
	});
	
	test("macro test ", function(){
		/*setup */
		var mockf = function(el){
			var mockdom = document.createElement("div");
			mockdom.setAttribute("title","bonjour");
			mockdom.setAttribute("tiddler","bonjour");
			return mockdom;
		};
		story.findContainingTiddler = mockf;	
		var text,title;
		title = "bonjour";
		store.saveTiddler(title,title,"",true,null,[],{assignee: 'JR'},null);
		
		text = "Team 1>\nAndrew Back:AB\nMichael Mahemoff:MM<\nTeam 2>\nPhil Hawksworth:PH\nJeremy Ruston:JR<\nTeam 3>\nJon Robson:JDLR\nJon Lister:JRL\nResources>\nSimon McManus:SM\nPaul Downey:PD<";
		title = "DropDownData";
		store.saveTiddler(title,title,text,true,null,[],{},null);
		var place = document.createElement("div");
		var paramString = "type:dropdown metaDataName:assignee valuesSource:DropDownData";
		config.macros.AdvancedEditTemplate.handler(place,false,params,false,paramString,false);	
		
		/* run */
		actual = place.childNodes.length;
		expected = 5;
		same(actual, expected, "right number of dropdowns created");
	});
});