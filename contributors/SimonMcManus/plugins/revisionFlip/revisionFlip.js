config.commands.revisionsFlip = {};
	merge(config.commands.revisionsFlip,{
		text: 'revisons',
		tooltip: 'Show revisions of secion.',
		loading: 'loading....'
	});

	config.commands.revisionsFlip.handler = function(event,src,title)
	{
		var revdiv = document.createElement('div');
		revdiv.id = "tiddler"+title+"Revisions";
		revdiv.innerHTML = config.commands.revisionsFlip.loading;
		jQuery(revdiv).hide();
		var tiddler = store.getTiddler(title);
		jQuery('#tiddler'+title).after(revdiv);
		jQuery('#tiddler'+title).flip({ direction: 'bt', color: '#eee', content:jQuery("#tiddler"+title+"Revisions") }); 		
		
		// start revisions specific code
		var type = tiddler.fields['server.type'];
		var params = {origin: title};
		var context = {
			host: tiddler.fields['server.host'],
			workspace: tiddler.fields['server.workspace']
		};
		var adaptor = new config.adaptors[type]();		
		adaptor.getTiddlerRevisionList(title, 10, context, params, config.commands.revisionsFlip.displayResult);
	}
	
	
	config.commands.revisionsFlip.displayResult = function(results, params) {
		var containerId = "#tiddler"+params.origin+"Revisions";
		var html = [];
		for(var g=0; g<results.revisions.length; g++) {
			html.push("<b>"+results.revisions[g].fields['server.page.revision']+"</b>: 	"+results.revisions[g].modifier+" "+humane_date(results.revisions[g].modified)+'<hr/>');
		}
		jQuery(containerId).html(html.join('\n'));		
	}
