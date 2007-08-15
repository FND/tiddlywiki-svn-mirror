
merge(Tiddler.prototype,{

	render_Action: function() { return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		'<<multiToggleTag tag:ActionStatus title:[[%0]]>>'+
		' &nbsp;[[%0]] }}}\n',
		[
			this.title
		]
	);},

	render_DoneAction: function() { return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		' [[%0]] }}}\n',
		[
			this.title
		]
	);},

	render_Project: function() { return this.renderUtil(
		'{{project{'+
		'[[%0]] '+
		'<<toggleTag Complete [[%0]] ->>'+
 		'}}}'+
		'\n',
		[
			this.title
		]
	);},

	render_plain: function() { return this.renderUtil(
		'[[%0]]\n',
		[
			this.title
		]
	);}



});

merge(Tiddler.prototype,{

	sort_tickleDate: function() { return this.modified; }, // todo 

	sort_orderSlice: function() { return store.getTiddlerSlice(this.title,"order"); }

});
