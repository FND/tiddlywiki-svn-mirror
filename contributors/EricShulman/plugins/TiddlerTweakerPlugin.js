/***
|Name|TiddlerTweakerPlugin|
|Source|http://www.TiddlyTools.com/#TiddlerTweakerPlugin|
|Version|2.2.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides||
|Description|select multiple tiddlers and modify author, created, modified and/or tag values|
~TiddlerTweaker is a tool for TiddlyWiki authors.  It allows you to select multiple tiddlers from a listbox, either by direct interaction or automatically matching specific criteria.  You can then modify the creator, author, created, modified and/or tag values of those tiddlers using a compact set of form fields.  The values you enter into the fields simultantously overwrite the existing values in all tiddlers you have selected.
!!!!!Usage
<<<
{{{<<tiddlerTweaker>>}}}
{{smallform{<<tiddlerTweaker>>}}}
By default, any tags you enter into the TiddlerTweaker will //replace// the existing tags in all the tiddlers you have selected.  However, you can also use TiddlerTweaker to quickly filter specified tags from the selected tiddlers, while leaving any other tags assigned to those tiddlers unchanged:
>Any tag preceded by a "+" (plus) or "-" (minus), will be added or removed from the existing tags //instead of replacing the entire tag definition// of each tiddler (e.g., enter "-excludeLists" to remove that tag from all selected tiddlers.  When using this syntax, care should be taken to ensure that //every// tag is preceded by "+" or "-", to avoid inadvertently overwriting any other existing tags on the selected tiddlers.  (note: the "+" or "-" prefix on each tag value is NOT part of the tag value, and is only used by TiddlerTweaker to control how that tag value is processed)
Important Notes:
* Inasmuch as TiddlerTweaker is a 'power user' tool that can perform 'batch' functions (operating on many tiddlers at once), you should always have a recent backup of your document (or "save changes" just *before* tweaking the tiddlers), just in case you "shoot yourself in the foot".
* By design, TiddlerTweaker does NOT update the 'modified' date of tiddlers simply by making changes to the tiddler's values.  A tiddler's dates are ONLY updated when the corresponding 'created' and/or 'modified' checkboxes are selected and you enter new values for those dates.  As a general rule, after using TiddlerTweaker, always ''//remember to save your document//'' when you are done, even though the tiddler timeline tab may not show any recently modified tiddlers.
* Because you may be changing the values on many tiddlers simultaneously, selecting and updating all tiddlers in a document operation may take a while and your browser might warn about an "unresponsive script"... you should give it a whole bunch of time to 'continue'... it should complete the processing... eventually.
<<<
!!!!!Revisions
<<<
2008.01.13 [2.2.0] added "auto-selection" links: all, changed, tags, title, text
2007.12.26 [2.1.0] added support for managing 'creator' custom field (see [[CoreTweaks]])
2007.11.01 [2.0.3] added config.options.txtTweakerSortBy for cookie-based persistence of list display order preference setting.
2007.09.28 [2.0.2] in settiddlers() and deltiddlers(), added suspend/resume notification handling (improves performance when operating on multiple tiddlers)
2007.08.03 [2.0.1] added shadow definition for [[TiddlerTweaker]] tiddler for use as parameter references with {{{<<tiddler>>, <<slider>> or <<tabs>>}}} macros.
2007.08.03 [2.0.0] converted from inline script
2006.01.01 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.tiddlerTweaker= {major: 2, minor: 2, revision: 0, date: new Date(2008,1,13)};
config.shadowTiddlers.TiddlerTweaker="<<tiddlerTweaker>>";
if (config.options.txtTweakerSortBy==undefined) config.options.txtTweakerSortBy="title";
config.macros.tiddlerTweaker = {
	html: '<form style="display:inline"><!--\
		--><table style="padding:0;margin:0;border:0;width:100%"><tr valign="top" style="padding:0;margin:0;border:0"><!--\
		--><td  style="text-align:center;white-space:nowrap;width:99%;padding:0;margin:0;border:0"><!--\
			--><font size=-2><div style="text-align:left;"><span style="float:right"><!--\
			-->&nbsp; <a href="javascript:;" \
				title="select all tiddlers"\
				onclick="\
				var f=this; while (f&&f.nodeName.toLowerCase()!=\'form\')f=f.parentNode;\
				for (var t=0; t<f.list.options.length; t++)\
					if (f.list.options[t].value.length) f.list.options[t].selected=true;\
				config.macros.tiddlerTweaker.selecttiddlers(f.list);\
				return false">all</a><!--\
			-->&nbsp; <a href="javascript:;" \
				title="select tiddlers that are new/changed since the last file save"\
				onclick="\
				var lastmod=new Date(document.lastModified);\
				var f=this; while (f&&f.nodeName.toLowerCase()!=\'form\')f=f.parentNode;\
				for (var t=0; t<f.list.options.length; t++) {\
					var tid=store.getTiddler(f.list.options[t].value);\
					f.list.options[t].selected=tid&&tid.modified>lastmod;\
				}\
				config.macros.tiddlerTweaker.selecttiddlers(f.list);\
				return false">changed</a><!--\
			-->&nbsp; <a href="javascript:;" \
				title="select tiddlers with at least one matching tag"\
				onclick="\
				var t=prompt(\'Enter space-separated tags (match ONE)\');\
				if (!t||!t.length) return false;\
				var tags=t.readBracketedList();\
				var f=this; while (f&&f.nodeName.toLowerCase()!=\'form\')f=f.parentNode;\
				for (var t=0; t<f.list.options.length; t++) {\
					f.list.options[t].selected=false;\
					var tid=store.getTiddler(f.list.options[t].value);\
					if (tid&&tid.tags.containsAny(tags)) f.list.options[t].selected=true;\
				}\
				config.macros.tiddlerTweaker.selecttiddlers(f.list);\
				return false">tags</a><!--\
			-->&nbsp; <a href="javascript:;" \
				title="select tiddlers whose titles include matching text"\
				onclick="\
				var txt=prompt(\'Enter a title (or portion of a title) to match\');\
				if (!txt||!txt.length) return false;\
				var f=this; while (f&&f.nodeName.toLowerCase()!=\'form\')f=f.parentNode;\
				for (var t=0; t<f.list.options.length; t++) {\
					f.list.options[t].selected=f.list.options[t].value.indexOf(txt)!=-1;\
				}\
				config.macros.tiddlerTweaker.selecttiddlers(f.list);\
				return false">titles</a><!--\
			-->&nbsp; <a href="javascript:;" \
				title="select tiddlers containing matching text"\
				onclick="\
				var txt=prompt(\'Enter tiddler text (content) to match\');\
				if (!txt||!txt.length) return false;\
				var f=this; while (f&&f.nodeName.toLowerCase()!=\'form\')f=f.parentNode;\
				for (var t=0; t<f.list.options.length; t++) {\
					var tt=store.getTiddlerText(f.list.options[t].value,\'\');\
					f.list.options[t].selected=(tt.indexOf(txt)!=-1);\
				}\
				config.macros.tiddlerTweaker.selecttiddlers(f.list);\
				return false">text</a> &nbsp;<!--\
			--></span><span>select tiddlers</span><!--\
			--></div><!--\
			--></font><select multiple name=list size="10" style="width:99.99%" \
				title="use click, shift-click and/or ctrl-click to select multiple tiddler titles" \
				onclick="config.macros.tiddlerTweaker.selecttiddlers(this)" \
				onchange="config.macros.tiddlerTweaker.setfields(this)"><!--\
			--></select><br><!--\
			-->show<input type=text size=1 value="10" \
				onchange="this.form.list.size=this.value; this.form.list.multiple=(this.value>1);"><!--\
			-->by<!--\
			--><select name=sortby size=1 \
				onchange="config.macros.tiddlerTweaker.init(this.form,this.value)"><!--\
			--><option value="title">title</option><!--\
			--><option value="size">size</option><!--\
			--><option value="modified">date</option><!--\
			--></select><!--\
			--><input type="button" value="refresh" \
				onclick="config.macros.tiddlerTweaker.init(this.form,this.form.sortby.value)"<!--\
			--> <input type="button" name="stats" disabled value="totals..." \
				onclick="config.macros.tiddlerTweaker.stats(this)"><!--\
		--></td><td style="white-space:nowrap;padding:0;margin:0;border:0;width:1%"><!--\
			--><div style="text-align:left"><font size=-2>&nbsp;modify values</font></div><!--\
			--><table border=0 style="width:100%;padding:0;margin:0;border:0;"><tr style="padding:0;border:0;"><!--\
			--><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=checkbox name=settitle unchecked \
					title="allow changes to tiddler title (rename tiddler)" \
					onclick="this.form.title.disabled=!this.checked">title<!--\
			--></td><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=text name=title size=35 style="width:98%" disabled><!--\
			--></td></tr><tr style="padding:0;border:0;"><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=checkbox name=setcreator unchecked \
					title="allow changes to tiddler creator" \
					onclick="this.form.creator.disabled=!this.checked">created by<!--\
			--></td><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=text name=creator size=35 style="width:98%" disabled><!--\
			--></td></tr><tr style="padding:0;border:0;"><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=checkbox name=setwho unchecked \
					title="allow changes to tiddler author" \
					onclick="this.form.who.disabled=!this.checked">modified by<!--\
			--></td><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=text name=who size=35 style="width:98%" disabled><!--\
			--></td></tr><tr style="padding:0;border:0;"><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=checkbox name=setcdate unchecked \
					title="allow changes to created date" \
					onclick="var f=this.form; f.cm.disabled=f.cd.disabled=f.cy.disabled=f.ch.disabled=f.cn.disabled=!this.checked"><!--\
				-->created on<!--\
			--></td><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=text name=cm size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
				--> / <input type=text name=cd size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
				--> / <input type=text name=cy size=4 style="width:3em;padding:0;text-align:center" disabled><!--\
				--> at <input type=text name=ch size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
				--> : <input type=text name=cn size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
			--></td></tr><tr style="padding:0;border:0;"><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=checkbox name=setmdate unchecked \
					title="allow changes to modified date" \
					onclick="var f=this.form; f.mm.disabled=f.md.disabled=f.my.disabled=f.mh.disabled=f.mn.disabled=!this.checked"><!--\
				-->modified on<!--\
			--></td><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=text name=mm size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
				--> / <input type=text name=md size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
				--> / <input type=text name=my size=4 style="width:3em;padding:0;text-align:center" disabled><!--\
				--> at <input type=text name=mh size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
				--> : <input type=text name=mn size=2 style="width:2em;padding:0;text-align:center" disabled><!--\
			--></td></tr><tr style="padding:0;border:0;"><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=checkbox name=settags checked \
					title="allow changes to tiddler tags" \
					onclick="this.form.tags.disabled=!this.checked">tags<!--\
			--></td><td style="padding:1px;border:0;white-space:nowrap"><!--\
				--><input type=text name=tags size=35 value="" style="width:98%" \
					title="enter new tags or use \'+tag\' and \'-tag\' to add/remove tags from existing tags"><!--\
			--></td></tr></table><!--\
			--><div style="margin-top:.8em;text-align:center"><!--\
			--><nobr><input type=button name=display disabled style="width:32%" value="display tiddlers" \
				onclick="config.macros.tiddlerTweaker.displaytiddlers(this)"><!--\
			--> <input type=button name=del disabled style="width:32%" value="delete tiddlers" \
				onclick="config.macros.tiddlerTweaker.deltiddlers(this)"><!--\
			--> <input type=button name=set disabled style="width:32%" value="update tiddlers" \
				onclick="config.macros.tiddlerTweaker.settiddlers(this)"></nobr><!--\
			--></div><!--\
		--></td></tr></table><!--\
		--></form><span style="display:none"><!--content replaced by tiddler "stats"--></span>\
	',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var span=createTiddlyElement(place,"span");
		span.innerHTML=this.html;
		this.init(span.firstChild,config.options.txtTweakerSortBy);
	},
	init: function(f,sortby) { // initialize form controls
		if (!f) return; // form might not be rendered yet...
		while (f.list.options[0]) f.list.options[0]=null; // empty current list content
		var tids=store.getTiddlers(sortby);
		if (sortby=="size") // descending order (largest tiddlers listed first)
			tids.sort(function(a,b) {return a.text.length > b.text.length ? -1 : (a.text.length == b.text.length ? 0 : +1);});
		for (i=0; i<tids.length; i++) {
			var label=tids[i].title; var value=tids[i].title;
			if (sortby=="modified") {
				label=tids[tids.length-i-1].modified.formatString("YY.0MM.0DD 0hh:0mm ")+tids[tids.length-i-1].title;
				value=tids[tids.length-i-1].title;
			}
			if (sortby=="size") label="["+tids[i].text.length+"] "+label;
			f.list.options[f.list.length]=new Option(label,value,false,false);
		}
		f.title.value=f.who.value=f.creator.value=f.tags.value="";
		f.cm.value=f.cd.value=f.cy.value=f.ch.value=f.cn.value="";
		f.mm.value=f.md.value=f.my.value=f.mh.value=f.mn.value="";
		f.stats.disabled=f.set.disabled=f.del.disabled=f.display.disabled=true;
		f.settitle.disabled=false;
		config.options.txtTweakerSortBy=sortby; // remember current setting
		f.sortby.value=sortby; // sync droplist selection with current setting
		if (sortby!="title") // non-default preference... save cookie
			saveOptionCookie("txtTweakerSortBy");
		else { // default preference... clear cookie
			var ex=new Date(); ex.setTime(ex.getTime()-1000);
			document.cookie = "txtTweakerSortBy=null; path=/; expires="+ex.toGMTString();
		}
	},
	selecttiddlers: function(here) { // enable/disable tweaker fields based on number of items selected
		// count how many tiddlers are selected
		var f=here.form; var list=f.list;
		var c=0; for (i=0;i<list.length;i++) if (list.options[i].selected) c++;
		if (c>1) f.title.disabled=true;
		if (c>1) f.settitle.checked=false;
		f.set.disabled=(c==0);
		f.del.disabled=(c==0);
		f.display.disabled=(c==0);
		f.settitle.disabled=(c>1);
		f.stats.disabled=(c==0);
		var msg=(c==0)?'select tiddlers':(c+' tiddler'+(c!=1?'s':'')+' selected');
		here.previousSibling.firstChild.firstChild.nextSibling.innerHTML=msg;
		if (c) clearMessage(); else displayMessage("no tiddlers selected");
	},
	setfields: function(here) { // set tweaker edit fields from first selected tiddler
		var f=here.form;
		if (!here.value.length) {
			f.title.value=f.who.value=f.creator.value=f.tags.value="";
			f.cm.value=f.cd.value=f.cy.value=f.ch.value=f.cn.value="";
			f.mm.value=f.md.value=f.my.value=f.mh.value=f.mn.value="";
			return;
		}
		var tid=store.getTiddler(here.value); if (!tid) return;
		f.title.value=tid.title;
		f.who.value=tid.modifier;
		f.creator.value=tid.fields['creator']||''; // custom field - might not exist
		f.tags.value=tid.tags.join(' ');
		var c=tid.created; var m=tid.modified;
		f.cm.value=c.getMonth()+1;
		f.cd.value=c.getDate();
		f.cy.value=c.getFullYear();
		f.ch.value=c.getHours();
		f.cn.value=c.getMinutes();
		f.mm.value=m.getMonth()+1;
		f.md.value=m.getDate();
		f.my.value=m.getFullYear();
		f.mh.value=m.getHours();
		f.mn.value=m.getMinutes();
	},
	settiddlers: function(here) {
		var f=here.form; var list=f.list;
		var tids=[];
		for (i=0;i<list.length;i++) if (list.options[i].selected) tids.push(list.options[i].value);
		if (!tids.length) { alert("please select at least one tiddler"); return; }
		var cdate=new Date(f.cy.value,f.cm.value-1,f.cd.value,f.ch.value,f.cn.value);
		var mdate=new Date(f.my.value,f.mm.value-1,f.md.value,f.mh.value,f.mn.value);
		if (tids.length>1 && !confirm("Are you sure you want to update these tiddlers:\n\n"+tids.join(', '))) return;
		store.suspendNotifications();
		for (t=0;t<tids.length;t++) {
			var tid=store.getTiddler(tids[t]); if (!tid) continue;
			var title=!f.settitle.checked?tid.title:f.title.value;
			var who=!f.setwho.checked?tid.modifier:f.who.value;
			var tags=tid.tags
			if (f.settags.checked) { 
				var intags=f.tags.value.readBracketedList();
				var addtags=[]; var deltags=[]; var reptags=[];
				for (i=0;i<intags.length;i++) {
					if (intags[i].substr(0,1)=='+')
						addtags.push(intags[i].substr(1));
					else if (intags[i].substr(0,1)=='-')
						deltags.push(intags[i].substr(1));
					else
						reptags.push(intags[i]);
				}
				if (reptags.length)
					tags=reptags;
				if (addtags.length)
					tags=Array.concat(tags,addtags);
				if (deltags.length)
					for (i=0;i<deltags.length;i++)
						{ var pos=tags.indexOf(deltags[i]); if (pos!=-1) tags.splice(pos,1); }
			}
			if (!f.setcdate.checked) cdate=tid.created;
			if (!f.setmdate.checked) mdate=tid.modified;
			store.saveTiddler(tid.title,title,tid.text,who,mdate,tags,tid.fields);
			if (f.setcreator.checked) store.setValue(tid.title,'creator',f.creator.value); // set creator
			if (f.setcdate.checked) tid.assign(null,null,null,null,null,cdate); // set create date
		}
		store.resumeNotifications();
		this.init(f,f.sortby.value);
	},
	displaytiddlers: function(here) {
		var f=here.form; var list=f.list;
		var tids=[];
		for (i=0; i<list.length;i++) if (list.options[i].selected) tids.push(list.options[i].value);
		if (!tids.length) { alert("please select at least one tiddler"); return; }
		story.displayTiddlers(story.findContainingTiddler(f),tids)
	},
	deltiddlers: function(here) {
		var f=here.form; var list=f.list;
		var tids=[];
		for (i=0;i<list.length;i++) if (list.options[i].selected) tids.push(list.options[i].value);
		if (!tids.length) { alert("please select at least one tiddler"); return; }
		if (!confirm("Are you sure you want to delete these tiddlers:\n\n"+tids.join(', '))) return;
		store.suspendNotifications();
		for (t=0;t<tids.length;t++) {
			var tid=store.getTiddler(tids[t]); if (!tid) continue;
			if (tid.tags.contains("systemConfig"))
				if (!confirm("'"+tid.title+"' is tagged with 'systemConfig'.\n\nRemoving this tiddler may cause unexpected results.  Are you sure?"))
					continue;
			store.removeTiddler(tid.title);
			story.closeTiddler(tid.title);
		}
		store.resumeNotifications();
		this.init(f,f.sortby.value);
	},
	stats: function(here) {
		var f=here.form; var list=f.list; var tids=[]; var out=''; var tot=0;
		var target=f.nextSibling;
		for (i=0;i<list.length;i++) if (list.options[i].selected) tids.push(list.options[i].value);
		if (!tids.length) { alert("please select at least one tiddler"); return; }
		for (t=0;t<tids.length;t++) {
			var tid=store.getTiddler(tids[t]); if (!tid) continue;
			out+='[['+tid.title+']] '+tid.text.length+'\n'; tot+=tid.text.length;
		}
		var avg=tot/tids.length;
		out=tot+' bytes in '+tids.length+' selected tiddlers ('+avg+' bytes/tiddler)\n<<<\n'+out+'<<<\n';
		removeChildren(target);
		target.innerHTML="<hr><font size=-2><a href='javascript:;' style='float:right' onclick='this.parentNode.parentNode.style.display=\"none\"'>close</a></font>";
		wikify(out,target);
		target.style.display="block";
	}
};
//}}}