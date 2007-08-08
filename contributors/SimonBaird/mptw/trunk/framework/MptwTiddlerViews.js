
merge(Tiddler.prototype,{

	render_action: function() { return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		'<<tTag tag:Next mode:text text:N title:[[%0]]>>'+
		'<<tTag tag:[[Waiting For]] mode:text text:W title:[[%0]]>>'+
		'<<tTag tag:[[Starred]] mode:text text:%1 title:[[%0]]>>'+
		' [[%0]] }}}\n',
		[
			this.title,
			'*'
		]
	);},

	render_test: function(foo) { return this.renderUtil(
		"*test %0 %1\n",
		[this.render("action"), foo]
	);}

});

merge(config.macros,{
	test11: {
		handler: function (place,macroName,params,wikifier,paramString,tiddler) {

			createTiddlyButton(place,"test","test",function() {
				alert(store.getTiddler("Test").render("action"));
				alert(store.getTiddler("Test").render("test",123));
				alert("%0,%1".format([99,111]));
				alert("%0,%1".format(99,111));
				alert("%0,%1".format(["asdf","1232"]));
				alert("%0,%1".format("aaaa","1234"));
			});

			var foo = store.getTaggedTiddlers("css").map(function(t) { return t.render("test") }).join("\n");
			wikify(foo,place,null,tiddler);

		}
	}
});
