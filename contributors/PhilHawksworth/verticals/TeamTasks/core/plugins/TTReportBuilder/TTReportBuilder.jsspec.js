// <![CDATA[


function __setupStore() {
	store = new TiddlyWiki();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}

function __teardownStore() {
	delete store;
}


describe('TTReportBuilder : Handler', {

	'it should create a container div.' : function() {
		var container;
		value_of(typeof container).should_be("object");
	}

});


describe('TTReportBuilder : paramStringGetter', {

	before_each: function(){
		__setupStore();
		tiddlerText = [
			"",
			"<<dummyMacro foo:bar baz:bop>>",
			"<<dummyMacro foo:'bar' baz:'bop'>>",
			"wibble wobble <<dummyMacro foo:bar baz:bop>>",
			"wibble wobble <<dummyMacro foo:bar baz:bop>> wobble wibble ",
			"<<dummyMacro foo:bar baz:bop>> wobble wibble ",
			"<<notTheMacroYouAreLookingFor foo:bar baz:bop>>",
		];
		resultStrings = [
			"",
			"foo:bar baz:bop",
			"foo:'bar' baz:'bop'",
			"foo:bar baz:bop",
			"foo:bar baz:bop",
			"foo:bar baz:bop",
			""
		];

	},

	'it should return the paramString text from a tiddler when given the macro name' : function() {
		var expected, actual, funcToMock;
		for (var t=0; t < resultStrings.length; t++) {
			funcToMock = 'TiddlyWiki.prototype.getTiddlerText';
			tests_mock.before(funcToMock,function(tiddler){
				return tiddlerText[tiddler];
			});
			expected = resultStrings[t];
			actual = config.macros.TTReportBuilder.paramStringGetter(""+t,"dummyMacro");
			tests_mock.after(funcToMock);
			value_of(actual).should_be(expected);
		};
	},
	
	'it should return false if a macro name is not provided': function() {
		var actual = config.macros.TTReportBuilder.paramStringGetter("");
		value_of(actual).should_be_false();
	},
	
	'it should return false if a tiddler title is not provided': function() {
		var actual = config.macros.TTReportBuilder.paramStringGetter(null,"");
		value_of(actual).should_be_false();
	}

});

describe('TTReportBuilder : macroCallSetter', {
	
	before_each: function() {
		__setupStore();
		tiddlerText = [
			"",
			"<<dummyMacro foo:bar baz:bop>>",
			"wibble wobble <<dummyMacro foo:bar baz:bop>> wobble wibble ",
			"<<notTheMacroYouAreLookingFor foo:bar baz:bop>>",
		];
		newParamStrings = [
			"",
			"foo:blah baz:bop",
			"foo:'blah' baz:'bop'"
		];
		expectedTiddlerText = [
			[ // for tiddlerText ""
				"",
				"",
				""
			],
			[ // for tiddlerText "<<dummyMacro foo:bar baz:bop>>"
				"<<dummyMacro>>",
				"<<dummyMacro foo:blah baz:bop>>",
				"<<dummyMacro foo:'blah' baz:'bop'>>"
			],
			[ // for tiddlerText "wibble wobble <<dummyMacro foo:bar baz:bop>> wobble wibble "
				"wibble wobble <<dummyMacro>> wobble wibble ",
				"wibble wobble <<dummyMacro foo:blah baz:bop>> wobble wibble ",
				"wibble wobble <<dummyMacro foo:'blah' baz:'bop'>> wobble wibble "
			],
			[ // for tiddlerText "<<notTheMacroYouAreLookingFor foo:bar baz:bop>>"
				"<<notTheMacroYouAreLookingFor foo:bar baz:bop>>",
				"<<notTheMacroYouAreLookingFor foo:bar baz:bop>>",
				"<<notTheMacroYouAreLookingFor foo:bar baz:bop>>"
			]
		];
	},
	
	after_each: function() {
		__teardownStore();
		delete tiddlerText;
		delete newParamStrings;
		delete expectedTiddlerText;
	},
	
	
	'it should not change the tiddler text if a macro name is not provided': function() {
		funcToMock = 'TiddlyWiki.prototype.getTiddlerText';
		tests_mock.before(funcToMock,function(tiddler){
			return tiddlerText[tiddler];
		});
		var expected = tiddlerText[1];
		config.macros.TTReportBuilder.macroCallSetter(1,null,newParamStrings[1]);
		var actual = store.getTiddlerText(1);
		value_of(actual).should_be(expected);
		tests_mock.after(funcToMock);
	},
	
	'it should not change the tiddler text if a tiddler name is not provided': function() {
		funcToMock = 'TiddlyWiki.prototype.getTiddlerText';
		tests_mock.before(funcToMock,function(tiddler){
			return tiddlerText[tiddler];
		});
		var expected = tiddlerText[1];
		config.macros.TTReportBuilder.macroCallSetter(null,"dummyMacro",newParamStrings[1]);
		var actual = store.getTiddlerText(1);
		value_of(actual).should_be(expected);
		tests_mock.after(funcToMock);
	},
	
	'it should not change the tiddler text if a new paramString is not provided': function() {
		funcToMock = 'TiddlyWiki.prototype.getTiddlerText';
		tests_mock.before(funcToMock,function(tiddler){
			return tiddlerText[tiddler];
		});
		var expected = tiddlerText[1];
		config.macros.TTReportBuilder.macroCallSetter(1,"dummyMacro",null);
		var actual = store.getTiddlerText(1);
		value_of(actual).should_be(expected);
		tests_mock.after(funcToMock);
	},

	'it should change the paramString of the first macro call in a tiddler matching the supplied macro name': function() {
		var expected, actual, funcToMock, paramString, title, resultTiddlerText;
		var macroName = "dummyMacro";
		// assumes the use of store.saveTiddler when setting the macro call
		funcToMock = 'TiddlyWiki.prototype.saveTiddler';
		tests_mock.before(funcToMock,function(oldTitle,newTitle,body){
			resultTiddlerText = body;
		});
		funcToMock2 = 'TiddlyWiki.prototype.getTiddlerText';
		tests_mock.before(funcToMock2,function(tiddler){
			return tiddlerText[tiddler];
		});
		for(var i=0;i<tiddlerText.length;i++) {
			title = ""+i;
			for(var j=0;j<newParamStrings.length;j++) {
				resultTiddlerText = tiddlerText[i];
				config.macros.TTReportBuilder.macroCallSetter(title,macroName,newParamStrings[j]);
				actual = resultTiddlerText;
				expected = expectedTiddlerText[i][j];
				value_of(actual).should_be(expected);
			}
		}
		tests_mock.after(funcToMock);
		tests_mock.after(funcToMock2);
	}
	
});

describe('TTReportBuilder : paramStringBuilder', {
	
	before_each: function() {
		__setupStore();
		paramStrings = [
			"foo:bar",
			"",
			"foo:boop",
			"foo:bar foo:boop",
		];
		name = 'foo';
		value = 'bar';
		newValue = 'boop';
		paramStringBuilder = config.macros.TTReportBuilder.paramStringBuilder;
	},
	
	after_each: function() {
		__teardownStore();
		delete paramStrings;
		delete name;
		delete value;
		delete newValue;
		delete paramStringBuilder;
	},

	'it should do nothing to the paramString if the behaviour is "add", the name exists and the value exists' : function() {
		var actual = paramStringBuilder(paramStrings[0],name,value,"add");
		var expected = paramStrings[0];
		value_of(actual).should_be(expected);
	},
	
	'it should do nothing to the paramString if the behaviour is "add", the name exists and the value exists (for more than one parameter of the same name)' : function() {
		var actual = paramStringBuilder(paramStrings[3],name,value,"add");
		var expected = paramStrings[3];
		value_of(actual).should_be(expected);
	},
	
	'it should add the parameter to the paramString if the behaviour is "add" and the name does not exist' : function() {
		var actual = paramStringBuilder(paramStrings[1],name,value,"add");
		var expected = paramStrings[0];
		value_of(actual).should_be(expected);
	},

	'it should change the value of the parameter in the paramString if the behaviour is "replace", the name exists and the value exists' : function() {
		var actual = paramStringBuilder(paramStrings[0],name,newValue,"replace");
		var expected = paramStrings[2];
		value_of(actual).should_be(expected);
	},
	
	'it should add the parameter to the paramString if the behaviour is "replace" and the name does not exist' : function() {
		var actual = paramStringBuilder(paramStrings[1],name,newValue,"replace");
		var expected = paramStrings[2];
		value_of(actual).should_be(expected);
	},
	
	'it should remove the parameter from the paramString if the behaviour is "delete", the name exists and the value exists' : function() {
		var actual = paramStringBuilder(paramStrings[0],name,value,"delete");
		var expected = paramStrings[1];
		value_of(actual).should_be(expected);
	},
	
	'it should remove the parameter from the paramString if the behaviour is "delete", the name exists and the value exists (for more than one parameter of the same name)' : function() {
		var actual = paramStringBuilder(paramStrings[3],name,newValue,"delete");
		var expected = paramStrings[0];
		value_of(actual).should_be(expected);
	},
	
	'it should do nothing to the paramString if the behaviour is "delete" and the name does not exist' : function() {
		var actual = paramStringBuilder(paramStrings[1],name,value,"delete");
		var expected = paramStrings[1];
		value_of(actual).should_be(expected);
	}
});

describe('TTReportBuilder : Results limit', {

	before_each: function(){
		__setupStore();
		name = "limit";
		limits = [0,1,2,3,null];
		limitStrings = [
			"limit:0",
			"limit:1",
			"limit:2",
			"limit:3"
		];
	},

	after_each: function(){
		__teardownStore();
		delete name;
		delete limits;
		delete limitStrings;
	},
	
	'it should return no more results than specified' : function() {
		var actual = "";
		for(var i=0;i<limits.length;i++) {
			actual = config.macros.TTReportBuilder.limitResults(limits[i]);
			// assuming implementation like: paramStringBuilder(paramString,name,limits[i],"replace");
			actual = actual.indexOf(limitStrings[i]);
			value_of(actual).should_be_true();
		}
	},
	
	'it should not limit results if no value is specified' : function() {
		var actual = config.macros.TTReportBuilder.limitResults(limits[4]);
		// assuming implementation like: paramStringBuilder(paramString,name,limits[4]);
		actual = actual.indexOf(name+":");
		value_of(actual).should_be_false();
	}	

});

describe('TTReportBuilder : Add column button', {

	before_each: function(){
		__setupStore();
	},
	
	after_each: function(){
		__teardownStore();
	},

	'it should create a new column when clicked' : function() {
		var columnsBefore = [];
		var columnsAfter = [];
		
		// do stuff
		value_of(columnsAfter.length).should_be(columnsBefore.length + 1);
	},

	'it should create a new column in edit mode' : function() {
		var editMode = false;
		value_of(editMode).should_be_true();
	},
	
	'it should display a message instructing the user to add a column if there are no columns displayed' : function() {
		var columns = [];
		var NoColumnsMessage;
		value_of(NoColumnsMessage.style.display).should_not_be('none');
	}

});

describe('TTReportBuilder : Delete column button', {

	'it should prompt the user with a confirm box' : function() {
		var calledConfirm = false;
		value_of(calledConfirm).should_be_true();
	},

	'it should remove the column if the confirmation is given' : function() {
		var columnsBefore = [];
		var columnsAfter = [];
		// do stuff
		value_of(columnsAfter.length).should_be(columnsBefore.length - 1);
	}
	
});

describe('TTReportBuilder : Column headers', {

	'it should display the edit and delete buttons when it is moused-over' : function() {
		var columnHeader;
		value_of(columnHeader.className).should_be('hover');
	},

	'it should change to edit mode when the edit button is clicked' : function() {
		var editMode = false;
		value_of(editMode).should_be_true();
	},
	
	'it should leave edit mode if a click event occurs elsewhere' : function() {
		var editMode = true;
		value_of(editMode).should_be_false();
	},
	
	'it should leave edit mode when a value is chosen from the dropdown' : function() {
		var editMode = true;
		value_of(editMode).should_be_false();		
	}

});

describe('TTReportBuilder : Column header edit mode', {

	'it should display a dropdown' : function() {
		var columnHeaderEditor;
		value_of(columnHeaderEditor.nodeType).should_be('select');
	},
	
	'it should be populated with the values of the taskDefinitions ' : function() {
		var options; // = [];
		var taskDefinitions = [];
		value_of(options).should_be(taskDefinitions);
	},
	
	'it should set the field for display to the selected option when a different option is selected' : function() {
		var displayField = "";
		var selectedOption;
		value_of(displayField).should_be(selectedOption);
	},

	'it should exit edit mode when a different option is selected' : function() {
		var editMode = true;
		value_of(editMode).should_be_false();
	}
	
});

describe('TTReportBuilder : The Done checkbox', {

	'it should be checked if the task is done' : function() {
		var doneCheckbox;
		var taskDone = true;
		value_of(doneCheckbox.checked).should_be(taskDone);
	},

	'it should not be checked if the task is not done' : function() {
		var doneCheckbox;
		var taskDone = false;
		value_of(doneCheckbox.checked).should_be(taskDone);
	},

	'it should mark the task as done when checked' : function() {
		var doneCheckbox;
		doneCheckbox.checked = true;
		var taskDone;
		value_of(taskDone).should_be(true);		
	},
	
	'it should mark the task as not done when unchecked' : function() {
		var doneCheckbox;
		doneCheckbox.checked = false;
		var taskDone;
		value_of(taskDone).should_be(false);	
	}

});




// ]]>