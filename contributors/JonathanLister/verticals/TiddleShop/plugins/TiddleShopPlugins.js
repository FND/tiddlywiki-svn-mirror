/***
!TiddleShop plugins

Summary: template-based creation of blogs for dummies

User journey:
1. click on blog icon
2. new page: choose template
2a. onclick: save a new tiddlywiki with all the necessary tiddlers in the template (it's a pack)
3. test post (?)
4. on template click: preview result of implementing template with template selector menu bar on top

Dependencies: SinglePagePlugin(?), ListRelatedPlugin

Tiddler Structure to support user journey:
1. TopPage - to present the icons for clicking on to select blog journey
2. BlogTemplateChooser - to present all available templates and any necessary "chrome"
2a. SamplePost(1|2|3|...) - sample posts for preview
3. PreviewPage - to show preview of applying template and menu bar at the top

Functional journey:


***/

config.options.chkSinglePageMode = "true";
// config.options.chkSinglePageMode = "true";

// defaulted upload settings, working with iwab account
config.options.txtUploadUserName = "iwab";
config.options.pasUploadPassword = "janjan";
config.options.txtUploadStoreUrl = "http://tiddlyhome.bidix.info/iwantablog/store.php";
config.options.txtUploadFilename = "blog.html";

// extension to ListRelated relationships
merge(config.relationships,{
	none: {
		text: "a null relationship to hack the plugin to allow listing of any tiddlers",
		prompt: "Tiddlers that are ",
		getRelatedTiddlers: function(store,title) {
			var tiddlers = [];
			return tiddlers;
		}
	}
});
