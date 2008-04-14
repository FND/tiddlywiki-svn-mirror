//to do: links,images
//better support for line breaks when wrapping

config.macros.markupHelper = {
    
    defaultFormat : 'tiddlywiki',
	
	rules : {},
    
    handler: function(place,macroName,params,wikifier,paramString,tiddler){
        var wikiformat = tiddler.fields['wikiformat'] || this.defaultFormat;
        var rulesTiddler = wikiformat + 'MarkupRules';
		if (!store.getTiddlerText(rulesTiddler))
            return; //no definitions for this wikiformat
		this.rules[wikiformat] = this.getRules(rulesTiddler);
		var rules = this.rules[wikiformat]
        var box = createTiddlyElement(place,'div',null,'formatHelperDiv');
        for (var i=0; i<rules.length; i++) {
            if (rules[i].type && this.creators[rules[i].type])
                this.creators[rules[i].type](box,rules[i],wikiformat,tiddler);
            else
                this.creators['text'](box,rules[i],wikiformat,tiddler);
        }
    },
	
	getRules: function(title){
		var rules = [];
		var myregexp = /^(?:!{1,6})(.*?)\n((?:.|\n)*?)(?:^\n?)/mg;
		while (m = myregexp.exec(store.getTiddlerText(title))) {
			var map = store.calcAllSlices(title+ '##' + m[1]);
			map['formatname'] = m[1];
			rules.push(map);
		}
		return rules;
	},
	
    creators : {
        text : function(place,rule,wikiformat,tiddler) {
            var btn = createTiddlyButton(place,rule.label,rule.tooltip,config.macros.markupHelper.onClickButton,null,null,null,{'formatname':rule.formatname,'wikiformat':wikiformat});
            btn.innerHTML = rule.label;
        },
        
        headings : function(place,rule,wikiformat,tiddler) {
            var prefixes = rule.prefix.split("||");
            //var suffixes = rule.suffix? rule.suffix.split("||") : new Array(prefixes.length);
            var sel = createTiddlyElement(place,"select",null,'headingSelect',null,{'formatname':rule.formatname,'wikiformat':wikiformat});
            for(var t=0; t<prefixes.length; t++) {
                var e = createTiddlyElement(sel,"option",null,'heading'+(t+1),'heading ' + (t+1));
                e.value = t+1;
            }
            var e = createTiddlyElement(sel,"option",null,null,"normal");
            e.value = 0;
            e.selected = true;
            sel.onchange = config.macros.markupHelper.onClickButton;
        }
    },
    
	onClickButton : function(ev){
		var me = config.macros.markupHelper;
		//var e = e ? e : window.event;
		var title = story.findContainingTiddler(this).getAttribute('tiddler');
		var wikiformat = this.getAttribute('wikiformat');
		var formatname = this.getAttribute('formatname');
		var pos = me.rules[wikiformat].findByField('formatname',formatname);
		var rule = me.rules[wikiformat][pos];
		if (rule.type && me.formatHandlers[rule.type])
			me.formatHandlers[rule.type](me,title,rule,this);
		return false;
	},
	
	formatHandlers : {
		text : function(me,title,rule){
			me.setSelection(title,'text',rule.prefix,rule.suffix);
		},
        
		table : function(me,title,rule){
		    var size = prompt("How many columns and rows should the table contains?","2x2");
		    if (!size)
			return;
		    var cols = parseInt(size.split('x')[0]);
		    var rows = parseInt(size.split('x')[1]);
		    var row = "\n" + rule.marker;
		    var table = '';
		    while (--cols >= 0)
			row += " " + rule.marker;
		    while (--rows >= 0)
			table += row;// + "\n";
		    me.setSelection(title,'text',table);
		},
		
		headings : function(me,title,rule,el) {
		    var prefixes = rule.prefix.split("||");
		    var suffixes = rule.suffix? rule.suffix.split("||") : undefined;
		    var e = story.getTiddlerField(title,'text');
		    var oldSel = config.macros.markupHelper.getSelection(e).customTrim(prefixes[0].trim());
		    if (el.value == 0)
			replaceSelection(e,oldSel)
		    else
			replaceSelection(e,prefixes[el.value-1].trim()+oldSel+ (suffixes? suffixes[el.value-1].trim():''));
		}
	},    
    
    setSelection : function(title,field,prefix,suffix) {
        prefix = prefix? prefix : '';
        suffix = suffix? suffix: '';
        var e = story.getTiddlerField(title,field);
	e.focus();
        var oldSel = this.getSelection(e)||'';
        replaceSelection(e, prefix + oldSel + suffix);
    },
    
    getSelection: function(e) {
		if (document.selection) {
			var sel = document.selection.createRange();
			if (sel.parentElement() == e) {
                return sel.text
			}
		}
		else if (e && e.setSelectionRange){
			return e.value.substr(e.selectionStart, e.selectionEnd - e.selectionStart);
		}
		return '';
	}
}

String.prototype.customTrim = function(seq){
    seq = seq.escapeRegExp();
    var re = new RegExp("^" + seq + "*|" + seq + "*$","mg");
    return this.replace(re,"");
}

setStylesheet("div.formatHelperDiv {\n"+
    "    margin: 1em 0.5em 0.5em ;\n"+
    "}\n"+
    "\n"+
    "div.formatHelperDiv .button {\n"+
    "    background:#eee;\n"+
    "    border:2px solid #ccc;\n"+
    "    margin:0.2em;\n"+
    "    color:#000;\n"+
    "}\n"+
    "\n"+
    "div.formatHelperDiv .button:hover {\n"+
    "    background: #CCC;\n"+
    "    border:2px solid #EEE;\n"+
    "}\n"+
    "\n"+
    "div.formatHelperDiv .heading1{\n"+
    "    font-weight:bold;\n"+
    "    font-size: 1.4em;\n"+
    "}\n"+
    "\n"+
    "\n"+
    "div.formatHelperDiv .heading2{\n"+
    "    font-weight:bold;\n"+
    "    font-size: 1.3em;\n"+
    "}\n"+
    "\n"+
    "\n"+
    "div.formatHelperDiv .heading3{\n"+
    "    font-weight:bold;\n"+
    "    font-size: 1.2em;\n"+
    "}\n"+
    "\n"+
    "\n"+
    "div.formatHelperDiv .heading4{\n"+
    "    font-size: 1.1em;\n"+
    "}\n"+
    "\n"+
    "div.formatHelperDiv .heading5{\n"+
    "    font-size: 1.08em;\n"+
    "}\n"+
    "\n"+
    "div.formatHelperDiv .heading6{\n"+
    "    font-size: 1.03em;\n"+
    "}\n"+
    "\n"+
    "div.formatHelperDiv .headingSelect {\n"+
    "    margin: 1px;\n"+
    "    font-size:1.1em;\n"+
    "    width: 100px;\n"+
    "    height: 22px;\n"+
    "}", "markupHelperStyles");
