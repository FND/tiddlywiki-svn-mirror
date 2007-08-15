
merge(config.macros,{
	test11: {
		handler: function (place,macroName,params,wikifier,paramString,tiddler) {

			var foo = store.getTaggedTiddlers("Project").render("Project");
			wikify(foo,place,null,tiddler);

			wikify(
				store.getTaggedTiddlers("Action").renderGroupedByTag("Action","Project","Project"),
				place,null,tiddler);

		}
	}
});

