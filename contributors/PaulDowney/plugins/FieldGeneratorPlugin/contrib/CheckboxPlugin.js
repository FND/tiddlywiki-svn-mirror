/***
|Name|CheckboxPlugin|
|Source|http://www.TiddlyTools.com/#CheckboxPlugin|
|Documentation|http://www.TiddlyTools.com/#CheckboxPluginInfo|
|Version|2.4.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Add checkboxes to your tiddler content|
This plugin extends the TiddlyWiki syntax to allow definition of checkboxes that can be embedded directly in tiddler content.  Checkbox states are preserved by:
* by setting/removing tags on specified tiddlers,
* or, by setting custom field values on specified tiddlers,
* or, by saving to a locally-stored cookie ID,
* or, automatically modifying the tiddler content (deprecated)
When an ID is assigned to the checkbox, it enables direct programmatic access to the checkbox DOM element, as well as creating an entry in TiddlyWiki's config.options[ID] internal data.  In addition to tracking the checkbox state, you can also specify custom javascript for programmatic initialization and onClick event handling for any checkbox, so you can provide specialized side-effects in response to state changes.
!!!!!Documentation
>see [[CheckboxPluginInfo]]
!!!!!Revisions
<<<
2008.01.08 [*.*.*] plugin size reduction: documentation moved to [[CheckboxPluginInfo]]
2008.01.05 [2.4.0] set global "window.place" to current checkbox element when processing checkbox clicks.  This allows init/beforeClick/afterClick handlers to reference RELATIVE elements, including using "story.findContainingTiddler(place)".  Also, wrap handlers in "function()" so "return" can be used within handler code.
|please see [[CheckboxPluginInfo]] for additional revision details|
2005.12.07 [0.9.0] initial BETA release
<<<
!!!!!Code
***/
//{{{
version.extensions.CheckboxPlugin = {major: 2, minor: 4, revision:0 , date: new Date(2008,1,5)};
//}}}
//{{{
config.checkbox = { refresh: { tagged:true, tagging:true, container:true } };
config.formatters.push( {
	name: "checkbox",
	match: "\\[[xX_ ][\\]\\=\\(\\{]",
	lookahead: "\\[([xX_ ])(=[^\\s\\(\\]{]+)?(\\([^\\)]*\\))?({[^}]*})?({[^}]*})?({[^}]*})?\\]",
	handler: function(w) {
		var lookaheadRegExp = new RegExp(this.lookahead,"mg");
		lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			// get params
			var checked=(lookaheadMatch[1].toUpperCase()=="X");
			var id=lookaheadMatch[2];
			var target=lookaheadMatch[3];
			if (target) target=target.substr(1,target.length-2).trim(); // trim off parentheses
			var fn_init=lookaheadMatch[4];
			var fn_clickBefore=lookaheadMatch[5];
			var fn_clickAfter=lookaheadMatch[6];
			var tid=story.findContainingTiddler(w.output);  if (tid) tid=tid.getAttribute("tiddler");
			var srctid=w.tiddler?w.tiddler.title:null;
			config.macros.checkbox.create(w.output,tid,srctid,w.matchStart+1,checked,id,target,config.checkbox.refresh,fn_init,fn_clickBefore,fn_clickAfter);
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	}
} );
config.macros.checkbox = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if(!(tiddler instanceof Tiddler)) { // if no tiddler passed in try to find one
			var here=story.findContainingTiddler(place);
			if (here) tiddler=store.getTiddler(here.getAttribute("tiddler"))
		}
		var srcpos=0; // "inline X" not applicable to macro syntax
		var target=params.shift(); if (!target) target="";
		var defaultState=params[0]=="checked"; if (defaultState) params.shift();
		var id=params.shift(); if (id && !id.length) id=null;
		var fn_init=params.shift(); if (fn_init && !fn_init.length) fn_init=null;
		var fn_clickBefore=params.shift();
		if (fn_clickBefore && !fn_clickBefore.length) fn_clickBefore=null;
		var fn_clickAfter=params.shift();
		if (fn_clickAfter && !fn_clickAfter.length) fn_clickAfter=null;
		var refresh={ tagged:true, tagging:true, container:false };
		this.create(place,tiddler.title,tiddler.title,0,defaultState,id,target,refresh,fn_init,fn_clickBefore,fn_clickAfter);
	},
	create: function(place,tid,srctid,srcpos,defaultState,id,target,refresh,fn_init,fn_clickBefore,fn_clickAfter) {
		// create checkbox element
		var c = document.createElement("input");
		c.setAttribute("type","checkbox");
		c.onclick=this.onClickCheckbox;
		c.srctid=srctid; // remember source tiddler
		c.srcpos=srcpos; // remember location of "X"
		c.container=tid; // containing tiddler (may be null if not in a tiddler)
		c.tiddler=tid; // default target tiddler 
		c.refresh = {};
		c.refresh.container = refresh.container;
		c.refresh.tagged = refresh.tagged;
		c.refresh.tagging = refresh.tagging;
		place.appendChild(c);
		// set default state
		c.checked=defaultState;
		// track state in config.options.ID
		if (id) {
			c.id=id.substr(1); // trim off leading "="
			if (config.options[c.id]!=undefined)
				c.checked=config.options[c.id];
			else
				config.options[c.id]=c.checked;
		}
		// track state in (tiddlername|tagname) or (fieldname@tiddlername)
		if (target) {
			var pos=target.indexOf("@");
			if (pos!=-1) {
				c.field=pos?target.substr(0,pos):"checked"; // get fieldname (or use default "checked")
				c.tiddler=target.substr(pos+1); // get specified tiddler name (if any)
				if (!c.tiddler || !c.tiddler.length) c.tiddler=tid; // if tiddler not specified, default == container
				if (store.getValue(c.tiddler,c.field)!=undefined)
					c.checked=(store.getValue(c.tiddler,c.field)=="true"); // set checkbox from saved state
			} else {
				var pos=target.indexOf("|"); if (pos==-1) var pos=target.indexOf(":");
				c.tag=target;
				if (pos==0) c.tag=target.substr(1); // trim leading "|" or ":"
				if (pos>0) { c.tiddler=target.substr(0,pos); c.tag=target.substr(pos+1); }
				if (!c.tag.length) c.tag="checked";
				var t=store.getTiddler(c.tiddler);
				if (t && t.tags)
					c.checked=t.isTagged(c.tag); // set checkbox from saved state
			}
		}
		// trim off surrounding { and } delimiters from init/click handlers
		if (fn_init) c.fn_init="(function(){"+fn_init.trim().substr(1,fn_init.length-2)+"})()";
		if (fn_clickBefore) c.fn_clickBefore="(function(){"+fn_clickBefore.trim().substr(1,fn_clickBefore.length-2)+"})()";
		if (fn_clickAfter) c.fn_clickAfter="(function(){"+fn_clickAfter.trim().substr(1,fn_clickAfter.length-2)+"})()";
		c.init=true; c.onclick(); c.init=false; // compute initial state and save in tiddler/config/cookie
	},
	onClickCheckbox: function(event) {
		window.place=this;
		if (this.init && this.fn_init) // custom function hook to set initial state (run only once)
			{ try { eval(this.fn_init); } catch(e) { displayMessage("Checkbox init error: "+e.toString()); } }
		if (!this.init && this.fn_clickBefore) // custom function hook to override changes in checkbox state
			{ try { eval(this.fn_clickBefore) } catch(e) { displayMessage("Checkbox onClickBefore error: "+e.toString()); } }
		if (this.id)
			// save state in config AND cookie (only when ID starts with 'chk')
			{ config.options[this.id]=this.checked; if (this.id.substr(0,3)=="chk") saveOptionCookie(this.id); }
		if (this.srctid && this.srcpos>0 && (!this.id || this.id.substr(0,3)!="chk") && !this.tag && !this.field) {
			// save state in tiddler content only if not using cookie, tag or field tracking
			var t=store.getTiddler(this.srctid); // put X in original source tiddler (if any)
			if (t && this.checked!=(t.text.substr(this.srcpos,1).toUpperCase()=="X")) { // if changed
				t.set(null,t.text.substr(0,this.srcpos)+(this.checked?"X":"_")+t.text.substr(this.srcpos+1),null,null,t.tags);
				if (!story.isDirty(t.title)) story.refreshTiddler(t.title,null,true);
				store.setDirty(true);
			}
		}
		if (this.field) {
			if (this.checked && !store.tiddlerExists(this.tiddler))
				store.saveTiddler(this.tiddler,this.tiddler,"",config.options.txtUserName,new Date());
			// set the field value in the target tiddler
			store.setValue(this.tiddler,this.field,this.checked?"true":"false");
			// DEBUG: displayMessage(this.field+"@"+this.tiddler+" is "+this.checked);
		}
		if (this.tag) {
			if (this.checked && !store.tiddlerExists(this.tiddler))
				store.saveTiddler(this.tiddler,this.tiddler,"",config.options.txtUserName,new Date());
			var t=store.getTiddler(this.tiddler);
			if (t) {
				var tagged=(t.tags && t.tags.indexOf(this.tag)!=-1);
				if (this.checked && !tagged) { t.tags.push(this.tag); store.setDirty(true); }
				if (!this.checked && tagged) { t.tags.splice(t.tags.indexOf(this.tag),1); store.setDirty(true); }
			}
			// if tag state has been changed, update display of corresponding tiddlers (unless they are in edit mode...)
			if (this.checked!=tagged) {
				if (this.refresh.tagged) {
					if (!story.isDirty(this.tiddler)) // the TAGGED tiddler in view mode
						story.refreshTiddler(this.tiddler,null,true); 
					else // the TAGGED tiddler in edit mode (with tags field)
						config.macros.checkbox.refreshEditorTagField(this.tiddler,this.tag,this.checked);
				}
				if (this.refresh.tagging)
					if (!story.isDirty(this.tag)) story.refreshTiddler(this.tag,null,true); // the TAGGING tiddler
			}
		}
		if (!this.init && this.fn_clickAfter) // custom function hook to react to changes in checkbox state
			{ try { eval(this.fn_clickAfter) } catch(e) { displayMessage("Checkbox onClickAfter error: "+e.toString()); } }
		// refresh containing tiddler (but not during initial rendering, or we get an infinite loop!) (and not when editing container)
		if (!this.init && this.refresh.container && this.container!=this.tiddler)
			if (!story.isDirty(this.container)) story.refreshTiddler(this.container,null,true); // the tiddler CONTAINING the checkbox
		return true;
	},
	refreshEditorTagField: function(title,tag,set) {
		var tagfield=story.getTiddlerField(title,"tags");
		if (!tagfield||tagfield.getAttribute("edit")!="tags") return; // if no tags field in editor (i.e., custom template)
		var tags=tagfield.value.readBracketedList();
		if (tags.contains(tag)==set) return; // if no change needed
		if (set) tags.push(tag); // add tag
		else tags.splice(tags.indexOf(tag),1); // remove tag
		for (var t=0;t<tags.length;t++) tags[t]=String.encodeTiddlyLink(tags[t]);
		tagfield.value=tags.join(" "); // reassemble tag string (with brackets as needed)
		return;
	}
}
//}}}