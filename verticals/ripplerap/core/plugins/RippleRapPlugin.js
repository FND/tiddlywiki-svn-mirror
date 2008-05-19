/***
|''Name:''|RippleRapPLugin |
|''Description:''|Provide a RippleRap functionality |
|''Author:''|PhilHawksworth|
|''Version:''|0.1|
|''Date:''|Mon May 19 14:47:44 BST 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
***/

//{{{
	
if(!version.extensions.RippleRapPlugin) {
version.extensions.RippleRapPlugin = {installed:true};

config.macros.RippleRap = {};

// Initialise the application.
config.macros.RippleRap.init = function(){

	console.log("Starting ripplerap");

	// Render local tiddler in the RippleRap UI as required.
	
	// Get agenda updates and update UI.
	
	// Display appropriate tab in agenda view.
	
};

// Display discovered noted in the agenda UI
config.macros.RippleRap.displayNotesLinks = function(){



};

// provide a global checkbox to enable disable sharing of notes
config.macros.RippleRap.setSharingPreferences = function(){

	

};

}
//}}}
