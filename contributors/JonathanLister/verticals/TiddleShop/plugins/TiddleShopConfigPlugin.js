/***
|''Name:''|TiddleShopConfigPlugin |
|''Description:'' |IWantABlog-specific config |
|''Author:'' |JonLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/verticals/TiddleShop/plugins/TiddleShopConfigPlugin.js |
|''Dependencies:'' |ListRelatedPlugin |
|''Version:''|1 |
|''Date:''|25/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3 |

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
