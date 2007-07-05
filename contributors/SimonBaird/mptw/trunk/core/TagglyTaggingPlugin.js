/***
| Name|TagglyTaggingPlugin|
| Description|tagglyTagging macro is a replacement for the builtin tagging macro in your ViewTemplate|
| Version|3.1 ($Rev$)|
| Date|$Date$|
| Source|http://mptw.tiddlyspot.com/#TagglyTaggingPlugin|
| Author|Simon Baird <simon.baird@gmail.com>|
| License|http://mptw.tiddlyspot.com/#TheBSDLicense|
!Notes
See http://mptw.tiddlyspot.com/#TagglyTagging
***/
//{{{
config.taggly = {

	// for translations
	lingo: {
		labels: {
			asc:        "\u2191", // down arrow
			desc:       "\u2193", // up arrow
			title:      "title",
			modified:   "modified",
			created:    "created",
			show:       "+",
			hide:       "-",
			normal:     "normal",
			group:      "group",
			commas:     "commas",
			sitemap:    "sitemap",
			numCols:    "cols\u00b1", // plus minus sign
			label:      "Tagged as '%0':",
			excerpts:   "excerpts",
			contents:   "contents",
			sliders:    "sliders",
			noexcerpts: "title only"
		},

		tooltips: {
			title:    "Click to sort by title",
			modified: "Click to sort by modified date",
			created:  "Click to sort by created date",
			show:     "Click to show tagging list",
			hide:     "Click to hide tagging list",
			normal:   "Click to show a normal ungrouped list",
			group:    "Click to show list grouped by tag",
			sitemap:  "Click to show a sitemap style list",
			commas:   "Click to show a comma separated list",
			numCols:  "Click to change number of columns",
			excerpts: "Click to show excerpts",
			contents: "Click to show entire tiddler contents",
			sliders:  "Click to show tiddler contents in sliders",
			noexcerpts: "Click to show entire title only"
		}
	},

	config: {
		showTaggingCounts: true,
		listOpts: {
			// the first one will be the default
			sortBy:     ["title","modified","created"],
			sortOrder:  ["asc","desc"],
			hideState:  ["show","hide"],
			listMode:   ["normal","group","sitemap","commas"],
			numCols:    ["1","2","3","4","5","6"],
			excerpts:   ["noexcerpts","excerpts","contents","sliders"]
		},
		valuePrefix: "taggly.",
		excludeTags: ["excludeLists","excludeTagging"],
		excerptSize: 50,
		excerptMarker: "/%"+"%/"
	},

	getTagglyOpt: function(title,opt) {
		var val = store.getValue(title,this.config.valuePrefix+opt);
		return val ? val : this.config.listOpts[opt][0];
	},

	setTagglyOpt: function(title,opt,value) {
		if (!store.tiddlerExists(title))
			// create it silently
			store.saveTiddler(title,title,config.views.editor.defaultText.format([title]),config.options.txtUserName,new Date(),null);
		// if value is default then remove it to save space
		return store.setValue(title,
			this.config.valuePrefix+opt,
			value == this.config.listOpts[opt][0] ? null : value);
	},

	getNextValue: function(title,opt) {
		var current = this.getTagglyOpt(title,opt);
		var pos = this.config.listOpts[opt].indexOf(current);
		// a little usability enhancement. actually it doesn't work right for grouped or sitemap
		var limit = (opt == "numCols" ? store.getTaggedTiddlers(title).length : this.config.listOpts[opt].length);
		var newPos = (pos + 1) % limit;
		return this.config.listOpts[opt][newPos];
	},

	toggleTagglyOpt: function(title,opt) {
		var newVal = this.getNextValue(title,opt);
		this.setTagglyOpt(title,opt,newVal);
	}, 

	createListControl: function(place,title,type) {
		var lingo = config.taggly.lingo;
		var label;
		var tooltip;
		var onclick;

		if ((type == "title" || type == "modified" || type == "created")) {
			// "special" controls. a little tricky. derived from sortOrder and sortBy
			label = lingo.labels[type];
			tooltip = lingo.tooltips[type];

			if (this.getTagglyOpt(title,"sortBy") == type) {
				label += lingo.labels[this.getTagglyOpt(title,"sortOrder")];
				onclick = function() {
					config.taggly.toggleTagglyOpt(title,"sortOrder");
					return false;
				}
			}
			else {
				onclick = function() {
					config.taggly.setTagglyOpt(title,"sortBy",type);
					config.taggly.setTagglyOpt(title,"sortOrder",config.taggly.config.listOpts.sortOrder[0]);
					return false;
				}
			}
		}
		else {
			// "regular" controls, nice and simple
			label = lingo.labels[type == "numCols" ? type : this.getNextValue(title,type)];
			tooltip = lingo.tooltips[type == "numCols" ? type : this.getNextValue(title,type)];
			onclick = function() {
				config.taggly.toggleTagglyOpt(title,type);
				return false;
			}
		}

		// hide button because commas don't have columns
		if (!(this.getTagglyOpt(title,"listMode") == "commas" && type == "numCols"))
			createTiddlyButton(place,label,tooltip,onclick,type == "hideState" ? "hidebutton" : "button");
	},

	makeColumns: function(orig,numCols) {
		var listSize = orig.length;
		var colSize = listSize/numCols;
		var remainder = listSize % numCols;

		var upperColsize = colSize;
		var lowerColsize = colSize;

		if (colSize != Math.floor(colSize)) {
			// it's not an exact fit so..
			upperColsize = Math.floor(colSize) + 1;
			lowerColsize = Math.floor(colSize);
		}

		var output = [];
		var c = 0;
		for (var j=0;j<numCols;j++) {
			var singleCol = [];
			var thisSize = j < remainder ? upperColsize : lowerColsize;
			for (var i=0;i<thisSize;i++) 
				singleCol.push(orig[c++]);
			output.push(singleCol);
		}

		return output;
	},

	drawTable: function(place,columns,theClass) {
		var newTable = createTiddlyElement(place,"table",null,theClass);
		var newTbody = createTiddlyElement(newTable,"tbody");
		var newTr = createTiddlyElement(newTbody,"tr");
		for (var j=0;j<columns.length;j++) {
			var colOutput = "";
			for (var i=0;i<columns[j].length;i++) 
				colOutput += columns[j][i];
			var newTd = createTiddlyElement(newTr,"td",null,"tagglyTagging"); // todo should not need this class
			wikify(colOutput,newTd);
		}
		return newTable;
	},

	createTagglyList: function(place,title) {
		switch(this.getTagglyOpt(title,"listMode")) {
			case "group":  return this.createTagglyListGrouped(place,title); break;
			case "normal": return this.createTagglyListNormal(place,title,false); break;
			case "commas": return this.createTagglyListNormal(place,title,true); break;
			case "sitemap":return this.createTagglyListSiteMap(place,title); break;
		}
	},

	getTaggingCount: function(title) {
		// thanks to Doug Edmunds
		if (this.config.showTaggingCounts) {
			var tagCount = store.getTaggedTiddlers(title).length;
			if (tagCount > 0)
				return " ("+tagCount+")";
		}
		return "";
	},

	getExcerpt: function(inTiddlerTitle,title,indent) {
    if (!indent)
			indent = 1;
		if (this.getTagglyOpt(inTiddlerTitle,"excerpts") == "excerpts") {
			var t = store.getTiddler(title);
			if (t) {
				var text = t.text.replace(/\n/," ");
				var marker = text.indexOf(this.config.excerptMarker);
				if (marker != -1) {
					return " {{excerpt{<nowiki>" + text.substr(0,marker) + "</nowiki>}}}";
				}
				else if (text.length < this.config.excerptSize) {
					return " {{excerpt{<nowiki>" + t.text + "</nowiki>}}}";
				}
				else {
					return " {{excerpt{<nowiki>" + t.text.substr(0,this.config.excerptSize) + "..." + "</nowiki>}}}";
				}
			}
		}
		else if (this.getTagglyOpt(inTiddlerTitle,"excerpts") == "contents") {
			var t = store.getTiddler(title);
			if (t) {
				return "\n{{contents indent"+indent+"{\n" + t.text + "\n}}}";
			}
		}
		else if (this.getTagglyOpt(inTiddlerTitle,"excerpts") == "sliders") {
			var t = store.getTiddler(title);
			if (t) {
				return "<slider open>\n{{contents{\n" + t.text + "\n}}}\n</slider>";
			}
		}
		return "";
	},

	notHidden: function(t,inTiddler) {
		if (typeof t == "string") 
			t = store.getTiddler(t);
		return (!t || !t.tags.containsAny(this.config.excludeTags) ||
				(inTiddler && this.config.excludeTags.contains(inTiddler)));
	},

	// this is for normal and commas mode
	createTagglyListNormal: function(place,title,useCommas) {

		var list = store.getTaggedTiddlers(title,this.getTagglyOpt(title,"sortBy"));

		if (this.getTagglyOpt(title,"sortOrder") == "desc")
			list = list.reverse();

		var output = [];
		var first = true;
		for (var i=0;i<list.length;i++) {
			if (this.notHidden(list[i],title)) {
				var countString = this.getTaggingCount(list[i].title);
				var excerpt = this.getExcerpt(title,list[i].title);
				if (useCommas)
					output.push((first ? "" : ", ") + "[[" + list[i].title + "]]" + countString + excerpt);
				else
					output.push("*[[" + list[i].title + "]]" + countString + excerpt + "\n");

				first = false;
			}
		}

		return this.drawTable(place,
			this.makeColumns(output,useCommas ? 1 : parseInt(this.getTagglyOpt(title,"numCols"))),
			useCommas ? "commas" : "normal");
	},

	// this is for the "grouped" mode
	createTagglyListGrouped: function(place,title) {
		var sortBy = this.getTagglyOpt(title,"sortBy");
		var sortOrder = this.getTagglyOpt(title,"sortOrder");

		var list = store.getTaggedTiddlers(title,sortBy);

		if (sortOrder == "desc")
			list = list.reverse();

		var leftOvers = []
		for (var i=0;i<list.length;i++)
			leftOvers.push(list[i].title);

		var allTagsHolder = {};
		for (var i=0;i<list.length;i++) {
			for (var j=0;j<list[i].tags.length;j++) {

				if (list[i].tags[j] != title) { // not this tiddler

					if (this.notHidden(list[i].tags[j],title)) {

						if (!allTagsHolder[list[i].tags[j]])
							allTagsHolder[list[i].tags[j]] = "";

						if (this.notHidden(list[i],title)) {
							allTagsHolder[list[i].tags[j]] += "**[["+list[i].title+"]]"
										+ this.getTaggingCount(list[i].title) + this.getExcerpt(title,list[i].title) + "\n";

							leftOvers.setItem(list[i].title,-1); // remove from leftovers. at the end it will contain the leftovers

						}
					}
				}
			}
		}

		var allTags = [];
		for (var t in allTagsHolder)
			allTags.push(t);

		var sortHelper = function(a,b) {
			if (a == b) return 0;
			if (a < b) return -1;
			return 1;
		};

		allTags.sort(function(a,b) {
			var tidA = store.getTiddler(a);
			var tidB = store.getTiddler(b);
			if (sortBy == "title") return sortHelper(a,b);
			else if (!tidA && !tidB) return 0;
			else if (!tidA) return -1;
			else if (!tidB) return +1;
			else return sortHelper(tidA[sortBy],tidB[sortBy]);
		});

		var leftOverOutput = "";
		for (var i=0;i<leftOvers.length;i++)
			if (this.notHidden(leftOvers[i],title))
				leftOverOutput += "*[["+leftOvers[i]+"]]" + this.getTaggingCount(leftOvers[i]) + this.getExcerpt(title,leftOvers[i]) + "\n";

		var output = [];

		if (sortOrder == "desc")
			allTags.reverse();
		else if (leftOverOutput != "")
			// leftovers first...
			output.push(leftOverOutput);

		for (var i=0;i<allTags.length;i++)
			if (allTagsHolder[allTags[i]] != "")
				output.push("*[["+allTags[i]+"]]" + this.getTaggingCount(allTags[i]) + this.getExcerpt(title,allTags[i]) + "\n" + allTagsHolder[allTags[i]]);

		if (sortOrder == "desc" && leftOverOutput != "")
			// leftovers last...
			output.push(leftOverOutput);

		return this.drawTable(place,
				this.makeColumns(output,parseInt(this.getTagglyOpt(title,"numCols"))),
				"grouped");

	},

	// used to build site map
	treeTraverse: function(title,depth,sortBy,sortOrder) {

		var list = store.getTaggedTiddlers(title,sortBy);
		if (sortOrder == "desc")
			list.reverse();

		var indent = "";
		for (var j=0;j<depth;j++)
			indent += "*"

		var childOutput = "";
		for (var i=0;i<list.length;i++)
			if (list[i].title != title)
				if (this.notHidden(list[i].title,this.config.inTiddler))
					childOutput += this.treeTraverse(list[i].title,depth+1,sortBy,sortOrder);

		if (depth == 0)
			return childOutput;
		else
			return indent + "[["+title+"]]" + this.getTaggingCount(title) + this.getExcerpt(this.config.inTiddler,title,depth) + "\n" + childOutput;
	},

	// this if for the site map mode
	createTagglyListSiteMap: function(place,title) {
		this.config.inTiddler = title; // nasty. should pass it in to traverse probably
		var output = this.treeTraverse(title,0,this.getTagglyOpt(title,"sortBy"),this.getTagglyOpt(title,"sortOrder"));
		return this.drawTable(place,
				this.makeColumns(output.split(/(?=^\*\[)/m),parseInt(this.getTagglyOpt(title,"numCols"))), // regexp magic
				"sitemap"
				);
	},

	macros: {
		tagglyTagging: {
			handler: function (place,macroName,params,wikifier,paramString,tiddler) {
				var refreshContainer = createTiddlyElement(place,"div");
				// do some refresh magic to make it keep the list fresh - thanks Saq
				refreshContainer.setAttribute("refresh","macro");
				refreshContainer.setAttribute("macroName",macroName);
        			refreshContainer.setAttribute("title",tiddler.title);
				this.refresh(refreshContainer);
			},

			refresh: function(place) {
				var title = place.getAttribute("title");
				removeChildren(place);
				if (store.getTaggedTiddlers(title).length > 0) {
					var lingo = config.taggly.lingo;
					config.taggly.createListControl(place,title,"hideState");
					if (config.taggly.getTagglyOpt(title,"hideState") == "show") {
						createTiddlyElement(place,"span",null,"tagglyLabel",lingo.labels.label.format([title]));
						config.taggly.createListControl(place,title,"title");
						config.taggly.createListControl(place,title,"modified");
						config.taggly.createListControl(place,title,"created");
						config.taggly.createListControl(place,title,"listMode");
						config.taggly.createListControl(place,title,"excerpts");
						config.taggly.createListControl(place,title,"numCols");
						config.taggly.createTagglyList(place,title);
					}
				}
			}
		}
	},

	// todo fix these up a bit
	styles: [
"/*{{{*/",
"/* created by TagglyTaggingPlugin */",
".tagglyTagging { padding-top:0.5em; }",
".tagglyTagging li.listTitle { display:none; }",
".tagglyTagging ul {",
"	margin-top:0px; padding-top:0.5em; padding-left:2em;",
"	margin-bottom:0px; padding-bottom:0px;",
"}",
".tagglyTagging { vertical-align: top; margin:0px; padding:0px; }",
".tagglyTagging table { margin:0px; padding:0px; }",
".tagglyTagging .button { visibility:hidden; margin-left:3px; margin-right:3px; }",
".tagglyTagging .button, .tagglyTagging .hidebutton {",
"	color:[[ColorPalette::TertiaryLight]]; font-size:90%;",
"	border:0px; padding-left:0.3em;padding-right:0.3em;",
"}",
".tagglyTagging .button:hover, .hidebutton:hover, ",
".tagglyTagging .button:active, .hidebutton:active  {",
"	border:0px; background:[[ColorPalette::TertiaryPale]]; color:[[ColorPalette::TertiaryDark]];",
"}",
".selected .tagglyTagging .button { visibility:visible; }",
".tagglyTagging .hidebutton { color:[[ColorPalette::Background]]; }",
".selected .tagglyTagging .hidebutton { color:[[ColorPalette::TertiaryLight]] }",
".tagglyLabel { color:[[ColorPalette::TertiaryMid]]; font-size:90%; }",
".tagglyTagging ul {padding-top:0px; padding-bottom:0.5em; margin-left:1em; }",
".tagglyTagging ul ul {list-style-type:disc; margin-left:-1em;}",
".tagglyTagging ul ul li {margin-left:0.5em; }",
".editLabel { font-size:90%; padding-top:0.5em; }",
".tagglyTagging .commas { padding-left:1.8em; }",
"/* not technically tagglytagging but will put them here anyway */",
".tagglyTagged li.listTitle { display:none; }",
".tagglyTagged li { display: inline; font-size:90%; }",
".tagglyTagged ul { margin:0px; padding:0px; }",
".excerpt { color:[[ColorPalette::TertiaryDark]]; }",
"div.tagglyTagging table,",
"div.tagglyTagging table tr,",
"td.tagglyTagging",
" {border-style:none!important; }",
".tagglyTagging .contents { border:1px solid [[ColorPalette::TertiaryPale]]; padding:0 1em 0 0.5em; }",
".tagglyTagging .indent1  { margin-left:3em;  }",
".tagglyTagging .indent2  { margin-left:4em;  }",
".tagglyTagging .indent3  { margin-left:5em;  }",
".tagglyTagging .indent4  { margin-left:6em;  }",
".tagglyTagging .indent5  { margin-left:7em;  }",
".tagglyTagging .indent6  { margin-left:8em;  }",
".tagglyTagging .indent7  { margin-left:9em;  }",
".tagglyTagging .indent8  { margin-left:10em; }",
".tagglyTagging .indent9  { margin-left:11em; }",
".tagglyTagging .indent10 { margin-left:12em; }",
"/*}}}*/",
		""].join("\n"),

	init: function() {
		merge(config.macros,this.macros);
		config.shadowTiddlers["TagglyTaggingStyles"] = this.styles;
		store.addNotification("TagglyTaggingStyles",refreshStyles);
	}
};

config.taggly.init();

//}}}

/***
InlineSlidersPlugin
By Saq Imtiaz
http://tw.lewcid.org/sandbox/#InlineSlidersPlugin

// syntax adjusted to not clash with NestedSlidersPlugin

***/
//{{{
config.formatters.unshift( {
	name: "inlinesliders",
	// match: "\\+\\+\\+\\+|\\<slider",
	match: "\\<slider",
	// lookaheadRegExp: /(?:\+\+\+\+|<slider) (.*?)(?:>?)\n((?:.|\n)*?)\n(?:====|<\/slider>)/mg,
	lookaheadRegExp: /(?:<slider) (.*?)(?:>)\n((?:.|\n)*?)\n(?:<\/slider>)/mg,
	handler: function(w) {
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart ) {
			var btn = createTiddlyButton(w.output,lookaheadMatch[1] + " "+"\u00BB",lookaheadMatch[1],this.onClickSlider,"button sliderButton");
			var panel = createTiddlyElement(w.output,"div",null,"sliderPanel");
			panel.style.display = "none";
			wikify(lookaheadMatch[2],panel);
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
   },
   onClickSlider : function(e) {
		if(!e) var e = window.event;
		var n = this.nextSibling;
		n.style.display = (n.style.display=="none") ? "block" : "none";
		return false;
	}
});

//}}}

