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

	'Displays register screen' : function() { 
		window.can_create_account="1";
		value_of(wikifyStatic('<<ccRegister>>')).should_not_match(/errortext/);
	},
	'Displays register screen with error because can_create_account is not defined. ' : function() { 
		value_of(wikifyStatic('<<ccRegister>>')).should_not_match(/errortext/);
	},
	'ccLoginStatus should not return error' : function() { 
		value_of(wikifyStatic('<<ccLoginStatus>>')).should_not_match(/errortext/);
	},
	'ccLogin should not return error' : function() { 
				window.openid_enabled="1";
		value_of(wikifyStatic('<<ccLogin>>')).should_not_match(/errortext/);
	},
	'ccRegister should not return error' : function() { 
		value_of(wikifyStatic('<<ccRegister>>')).should_not_match(/errortext/);
	},
	'ccUpload should not return error' : function() { 
		window.workspacePermission="1";
		value_of(wikifyStatic('<<ccUpload>>')).should_not_match(/errortext/);
	},
	'ccWorkspace should not return error' : function() { 
		value_of(wikifyStatic('<<ccCreateWorkspace>>')).should_not_match(/errortext/);
	},
	
	'isLoggedIn is a function' : function() { 
		value_of(typeof isLoggedIn).should_be("function");
	},
	'findToken is a function' : function() { 
		value_of(typeof findToken).should_be("function");
	},
	
});
// ]]>