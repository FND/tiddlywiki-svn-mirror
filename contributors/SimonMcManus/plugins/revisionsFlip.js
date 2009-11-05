config.commands.revisionsFlip = {};
	merge(config.commands.revisionsFlip,{
		text: 'revisons',
		tooltip: 'Show revisions of secion.'
	});

	config.commands.revisionsFlip.handler = function(event,src,title)
	{
		var revdiv = document.createElement('div');
		revdiv.id = 'tiddlerGrowthRevisions';
		var tiddler = store.getTiddler(title);
		var type = config.commands.revisions._getField("server.type", tiddler);
		var adaptor = new config.adaptors[type]();
		var limit = null; // TODO: customizable
		var context = {
			host: config.commands.revisions._getField("server.host", tiddler),
			workspace: config.commands.revisions._getField("server.workspace", tiddler)
		};
		var loading = createTiddlyButton(popup, 'loading', 'laoding');
		var params = { popup: popup, loading: loading, origin: title };
		adaptor.getTiddlerRevisionList(title, limit, context, params, tconfig.commands.revisions.displayRevisions);

		revdiv.innerHTML = 'boooo';
		jQuery('#tiddler'+title).after(revdiv);
		$('#tiddler'+title).flip({ direction: 'tb', color: '#eee', content:$("#tiddler"+title+"Revisions") }); 		
	}
