
// for displaying tiddlers in lists

// idea: use <<tiddler with:?>>


merge(Tiddler.prototype,{

	render_Action: function() { return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		'<<multiToggleTag tag:ActionStatus title:[[%0]]>>'+
		//'<<multiSelectTag tag:Project title:[[%0]]>>'+
		//'<<multiCheckboxTag tag:ActionStatus title:[[%0]]>>'+
		' &nbsp;[[%0]] }}}\n',
		[
			this.title
		]
	);},

	render_Project: function() { return this.renderUtil(
		'{{project{'+
		'<<toggleTag Complete [[%0]] ->>'+
		'<<multiToggleTag tag:ProjectStatus title:[[%0]]>>'+
		//'<<multiSelectTag tag:Project title:[[%0]]>>'+
		//'<<multiCheckboxTag tag:ActionStatus title:[[%0]]>>'+
		' &nbsp;[[%0]] }}}\n',
		[
			this.title
		]
	);},

	render_ProjectBare: function() { return this.renderUtil(
		'{{project{'+
		//'<<multiSelectTag tag:Project title:[[%0]]>>'+
		//'<<multiCheckboxTag tag:ActionStatus title:[[%0]]>>'+
		'&nbsp;[[%0]] }}}\n',
		[
			this.title
		]
	);},

	render_ActionProj: function() {

		// actually it's not going to be easy to have
		// an action in more than one project
		// but just in case....
		var pLink = "";
		this.getByIndex("Project").each(function(p){
			// shows just the P
			pLink += " [/%%/[[P|"+p+"]]]";
			// shows entire project
			//pLink += " [/%%/[["+p+"]]]";
		});

       		return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		'<<multiToggleTag tag:ActionStatus title:[[%0]]>>'+
		' &nbsp;[[%0]] %1}}}\n',
		[
			this.title,
			pLink
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

	render_ProjectHeading: function() { return this.renderUtil(
		'{{project{'+
		'[[%0]] '+
		'<<toggleTag Complete [[%0]] ->>'+
		'@@font-size:80%;<<multiToggleTag tag:ProjectStatus title:[[%0]]>>@@'+
 		'}}}'+
		'\n',
		[
			this.title
		]
	);},

	render_Context: function() { return this.renderUtil(
		'[[%0]]\n',
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


