// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	formatter = new Formatter(config.formatters);	
}

describe('Macros: list macro', {
	
	before_each : function() {
		__main();
	},

	'registerOnSubmit. Should return false due to username being null' : function() { 
		config.macros.ccRegister.username= {};   
		// null value which will make the test fail
		config.macros.ccRegister.username.value = null;
		// create the input field - this class us updated on an error	
		config.macros.ccRegister.username = createTiddlyElement(document.body, "input");
		// create the div to display the error message
		createTiddlyElement(document.body, "span", 'username_error', 'inlineError', '');
		var c = config.macros.ccRegister.registerOnSubmit();
		value_of(c).should_be(false);
	},
	
	'registerOnSubmit. Should return false due to username being empty string.' : function() { 
		this.username= {};   
		// null value which will make the test fail
		this.username.value = "";
		// create the input field - this class us updated on an error	
		config.macros.ccRegister.username = createTiddlyElement(document.body, "input");
		// create the div to display the error message
		createTiddlyElement(document.body, "span", 'username_error', 'inlineError', '');
		var c = config.macros.ccRegister.registerOnSubmit();
		value_of(c).should_be(false);
	},	
	'registerOnSubmit. Should return false due to password1 being empty string.' : function() { 
		this.username = {};
		this.username.value = "simon";
		config.macros.ccRegister.password1= {};   
		// null value which will make the test fail
		config.macros.ccRegister.password1.value = "";
		// create the input field - this class us updated on an error	
		config.macros.ccRegister.password1 = createTiddlyElement(document.body, "input");
		// create the div to display the error message
		createTiddlyElement(document.body, "span", 'spass1_error', 'inlineError', '');
		var c = config.macros.ccRegister.registerOnSubmit();
		value_of(c).should_be(false);
	},
	
	'emailValid. Should return true - testing for mail with only 1 .' : function() { 
		var c = config.macros.ccRegister.emailValid('simon@gmail.com');
		value_of(c).should_be(true);
	},
	'emailValid. Should return false due to lack of @' : function() { 
		var c = config.macros.ccRegister.emailValid('mcmanus.simongmail.com');
		value_of(c).should_be(false);
	},
	'emailValid. Should return false due to lack of .' : function() { 
		var c = config.macros.ccRegister.emailValid('mcmanussimon@gmailcom');
		value_of(c).should_be(false);
	},
	'emailValid. Should return true' : function() { 
		var c = config.macros.ccRegister.emailValid('mcmanus.simon@gmail.com');
		value_of(c).should_be(true);
	},
	'Displays register screen' : function() { 
	//	var c = new config.macros.ccAbout.sub();
		value_of(wikifyStatic('<<ccRegister>>')).should_be("a");
	},
	
});
// ]]>