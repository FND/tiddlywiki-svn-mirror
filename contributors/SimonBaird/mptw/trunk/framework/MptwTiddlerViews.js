
merge(Tiddler.prototype,{

	render_Action: function() { return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		//'<<tTag tag:Next mode:text text:N title:[[%0]]>>'+
		//'<<tTag tag:[[Waiting For]] mode:text text:W title:[[%0]]>>'+
		//'<<tTag tag:[[Starred]] mode:text text:%1 title:[[%0]]>>'+
		' [[%0]] }}}\n',
		[
			this.title
		]
	);},

	render_Project: function() { return this.renderUtil(
		'{{project{'+
		'<<toggleTag Complete [[%0]] ->>'+
		' [[%0]] }}}\n',
		[
			this.title
		]
	);}


});

