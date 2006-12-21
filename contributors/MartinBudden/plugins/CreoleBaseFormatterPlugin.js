/***
|''Name:''|CreoleBaseFormatterPlugin|
***/

//{{{
if(!version.extensions.CreoleBaseFormatterPlugin) {
version.extensions.CreoleBaseFormatterPlugin = {installed:true};
if(version.major < 2 || (version.major == 2 && version.minor < 1)) {
	alertAndThrow('CreoleBaseFormatterPlugin requires TiddlyWiki 2.1 or later.');
}

creoleBaseFormatter = {};

creoleBaseFormatter.bold = {
	name: 'creoleBaseBold',
	match: '\\*\\*',
	termRegExp: /(\*\*|(?=\n\n))/mg,
	element: 'strong',
	handler: config.formatterHelpers.createElementAndWikify
};

creoleBaseFormatter.italic = {
	name: 'creoleBaseItalic',
	match: '//',
	termRegExp: /(\/\/)/mg,
	element: 'em',
	handler: config.formatterHelpers.createElementAndWikify
};

creoleBaseFormatter.heading = {
	name: 'creoleBaseHeading',
	match: '^={1,6}(?!=)',
	termRegExp: /(={0,6}\n+)/mg,
	handler: function(w) {w.subWikifyTerm(createTiddlyElement(w.output,'h' + w.matchLength),this.termRegExp);}
};

creoleBaseFormatter.rule = {
	name: "creoleBaseRule",
	match: "^---+$\\n?",
	handler: function(w) {createTiddlyElement(output,"hr");}
};

creoleBaseFormatter.explicitLink = {
	name: "creoleBaseExplicitLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[(.*?)(?:\|(.*?))?\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[1];
			var text = lookaheadMatch[2] ? lookaheadMatch[2] : link;
			var e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
};

creoleBaseFormatter.urlLink = {
	name: "creoleBaseUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w) {w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);}
};

creoleBaseFormatter.list = {
	name: 'creoleBaseList',
	match: '^[\\*#]+ ',
	lookaheadRegExp: /^([\*#])+ /mg,
	termRegExp: /(\n+)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var itemType = 'li';
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			var listType = lookaheadMatch[1] == '*' ? 'ul' : 'ol';
			var listLevel = lookaheadMatch[0].length;
			w.nextMatch += listLevel;
			if(listLevel > currLevel) {
				for(var i=currLevel; i<listLevel; i++) {
					stack.push(createTiddlyElement(stack[stack.length-1],listType));
				}
			} else if(listLevel < currLevel) {
				for(i=currLevel; i>listLevel; i--) {
					stack.pop();
				}
			} else if(listLevel == currLevel && listType != currType) {
				stack.pop();
				stack.push(createTiddlyElement(stack[stack.length-1],listType));
			}
			currLevel = listLevel;
			currType = listType;
			var e = createTiddlyElement(stack[stack.length-1],itemType);
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	}
};

creoleBaseFormatter.preFormattedBlock = {
	name: 'creoleBasePreFormattedBlock',
	match: '^\\{\\{\\{\\n',
	lookaheadRegExp: /\{\{\{\n((?:.|\n)*?)\}\}\}\n/mg,
	/*lookaheadRegExp: /^\{\{\{\n((?:^[^\n]*\n)+?)(^\}\}\}$\n?)/mg,*/
	element: 'pre',
	handler: config.formatterHelpers.enclosedTextHelper
};

}// end of 'install only once'
//}}}
