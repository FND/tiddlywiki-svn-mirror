AnchorPlugin = {
	
	isDescendant : function(e,parent){
		while (e != null) {
			if (parent == e) return true;
			e = e.parentNode;
                }
		return false;
	},	
	
	hijackDisplayTiddler : function(){
		Story.prototype.origAnchor_DisplayTiddler = Story.prototype.displayTiddler; 
		Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle) {
			var title = (tiddler instanceof Tiddler)? tiddler.title : tiddler;
			var anchorname = '';
			var z = title.indexOf('#');
			if(z!=-1){
				anchorname = title;
				var title = title.split('#')[0];
			}
			story.origAnchor_DisplayTiddler(srcElement,title,template,animate,unused,customFields,toggle);
			var anchor = document.anchors[anchorname];
			var tiddlerElem = document.getElementById(this.idPrefix + title);
			var pos = (anchor && AnchorPlugin.isDescendant(anchor,tiddlerElem))? anchor : tiddlerElem;
			if(srcElement && typeof srcElement !== "string" && z!=-1) {
				if(config.options.chkAnimate && (animate == undefined || animate == true) && anim && typeof Zoomer == "function" && typeof Scroller == "function")
					anim.startAnimating(new Zoomer(title,srcElement,pos),new Scroller(pos));
				else
					window.scrollTo(0,ensureVisible(pos) + (findPosY(pos)> findWindowHeight() -  - findScrollY()?findWindowHeight() - pos.offsetHeight:0));
			}		
		}
	},
	
	hijackGetTiddlyLinkInfo : function(){
		window.origAnchor_GetTiddlyLinkInfo = window.getTiddlyLinkInfo
		window.getTiddlyLinkInfo = function(title, currClasses){
			var i = title.indexOf('#');
			if(i!=-1)
				title = title.substr(0,i);
			return window.origAnchor_GetTiddlyLinkInfo(title,currClasses);
		};
	},
	
	formatter : {
		name: 'anchor',
		match: '\\[\\[#',
		lookaheadRegExp: /\[\[#(.*?)(?:\|(~)?(.*?))?\]\]/mg,
		handler: function(w) {
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				var a = createTiddlyElement(w.output,'a',null,null,lookaheadMatch[3]? lookaheadMatch[3]:null);
				var t = w.tiddler ? w.tiddler.title + '#' : '';
				a.setAttribute('name',t+lookaheadMatch[1]);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},
	
	init : function() {
		this.hijackDisplayTiddler();
		this.hijackGetTiddlyLinkInfo();
		config.formatters.unshift(this.formatter);
	}
};

AnchorPlugin.init();