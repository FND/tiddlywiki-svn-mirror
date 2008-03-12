
// for displaying tiddlers in lists

// idea: use <<tiddler with:?>>


if (!config.mGTD) config.mGTD = {};

config.mGTD.data = {
	starOn:    'data:image/gif;base64,R0lGODlhDwAPAMQfAF9h4RYVnZeQJC0u0lRQU42R6P/7Fv74L05NrRkZxi4tW52XXv71D8nAIWxnjnRxr3NuMJKOluXbBe7kCa2x7UFD1vPoB77D8Jqe6n6B5tvTUr62BMrP8lJPh1xbuv///yH5BAEAAB8ALAAAAAAPAA8AAAWD4CeOWQKMaDpESepi3tFlLgpExlK9RT9ohkYi08N8KhWP8nEwMBwIDyJRSTgO2CaDYcBOCAlMgtDYmhmTDSFQ+HAqgbLZIlAMLqiKw7m1EAYuFQsGEhITEwItKBc/EgIEAhINAUYkCBIQAQMBEGonIwAKa21iCgo7IxQDFRQjF1VtHyEAOw==',
	starOff:   'data:image/gif;base64,R0lGODlhDwAPALMPAP///8zj++r7/7vb/rHW/tPt/9Lk+qzT/rbY/sHh/8Te/N7q+Nzy/7nY/djn+f///yH5BAEAAA8ALAAAAAAPAA8AAARg8MkZjpo4k0KyNwlQBB42MICAfEF7APDRBsYzIEkewGKeDI1DgUckMg6GTdFIqC0QgyUgQVhgGkOi4OBBCJYdzILAywIGNcoOgCAQvowBRpE4kgzCQgPjQCAcEwsNTRIRADs=',
	yuiSprite: 'data:image/png;base64,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',

	unicodeStar: "\u2605" // "black star"
};


merge(Tiddler.prototype,{

	render_Action: function() { return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		'<<multiToggleTag tag:ActionStatus title:[[%0]]>>'+
		//'<<multiSelectTag tag:Project title:[[%0]]>>'+
		//'<<multiCheckboxTag tag:ActionStatus title:[[%0]]>>'+
		'<<singleToggleTag tag:Starred title:[[%0]]>>'+
		' &nbsp;[[%0]] }}}',
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
		'<<singleToggleTag tag:Starred title:[[%0]]>>'+
		' &nbsp;[[%0]] }}}',
		[
			this.title
		]
	);},

	render_ProjectBare: function() { return this.renderUtil(
		'{{project{'+
		//'<<multiSelectTag tag:Project title:[[%0]]>>'+
		//'<<multiCheckboxTag tag:ActionStatus title:[[%0]]>>'+
		'<<singleToggleTag tag:Starred title:[[%0]]>>'+
		'&nbsp;[[%0]] }}}',
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
		'<<singleToggleTag tag:Starred title:[[%0]]>>'+
		' &nbsp;[[%0]] %1}}}',
		[
			this.title,
			pLink
		]
	);},

	render_DoneAction: function() { return this.renderUtil(
		'{{action{'+
		'<<toggleTag Done [[%0]] ->>'+
		' [[%0]] }}}',
		[
			this.title
		]
	);},

	render_ProjectHeading: function() { return this.renderUtil(
		'{{project{'+
		'[[%0]] '+
		'<<toggleTag Complete [[%0]] ->>'+
		'@@font-size:80%;<<multiToggleTag tag:ProjectStatus title:[[%0]]>>@@'+
		'<<singleToggleTag tag:Starred title:[[%0]]>>'+
 		'}}}',
		[
			this.title
		]
	);},

	render_Context: function() { return this.renderUtil(
		'[[%0]]',
		[
			this.title
		]
	);},

	render_plain: function() { return this.renderUtil(
		'[[%0]]',
		[
			this.title
		]
	);}



});


