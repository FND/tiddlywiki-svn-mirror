/***
| Name|CloseOnCancelPlugin|
| Description|Closes the tiddler if you click new tiddler then cancel. Default behaviour is to leave it open|
| Version|3.0 ($Rev$)|
| Date|$Date$|
| Source|http://mptw.tiddlyspot.com/#CloseOnCancelPlugin|
| Author|Simon Baird <simon.baird@gmail.com>|
***/
//{{{
merge(config.commands.cancelTiddler,{

	handler_orig_closeUnsaved: config.commands.cancelTiddler.handler,

	handler: function(event,src,title) {
		this.handler_orig_closeUnsaved(event,src,title);
		if (!store.tiddlerExists(title) && !store.isShadowTiddler(title))
			story.closeTiddler(title,true);
	 	return false;
	}

});

//}}}

