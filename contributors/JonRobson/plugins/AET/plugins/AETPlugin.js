/***
|''Name:''|AET (Advanced Edit Template)|
|''Description:''|Provides stuff the standard edit macro doesn't. First things first.. dropdowns!|
|''Author:''|JonRobson |
|''Version:''|0.8.3|
|''Date:''|Nov 2010|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
!Usage
{{{<<aet type:dropdown field:foo values:{{tiddler title}}>>}}}
!Parameters
autosavechanges - updates fields as they change (For use in ViewTemplates)
***/
//{{{
(function($){
try{
		config.locationData = [];
		config.geoData = {};
	config.shadowTiddlers.AdvancedEditTemplateStyle = "/*{{{*/\n" +
	".clearboth {clear:both;}\n"+
	".aet_radioboxes label {width:auto;float:left;}\n"+
	".aet_radioboxes input {width:auto;float:left;}\n"+
	".tip {font-style:italic;font-weight:bold;}\n"+
	".dp-popup {position:absolute;background-color:white;} a.dp-choose-date {float: left; width: 16px; height: 16px; padding: 0; margin: 5px 3px 0; display: block; text-indent: -2000px; overflow: hidden; background: url(calendar.png) no-repeat; }a.dp-choose-date.dp-disabled { background-position: 0 -20px;	cursor: default;}input.dp-applied { width: 140px; float: left;}\n"+
	".filebrowser{background-color:white; border:solid 1px black;}\n"+
	"a.dp-choose-date {border:solid 1px black;}\n"+
	".dp-nav-prev {float:left;}\n"+
	".dp-nav-next {float:right;}\n"+
	".dp-calendar {clear:both;}\n"+
	".dp-popup {padding:10px;border:solid 1px black;z-index:4;}\n"+
	".jCalendar .selected {background-color:gray;}\n"+
	"/*}}}*/"
store.addNotification("AdvancedEditTemplateStyle", refreshStyles);
} catch(e) {
};

String.prototype.toJSON = function(){
	var namedprms = this.parseParams(null, null, true);
	var options = {};
	for(var i=0; i < namedprms.length;i++){
		var nameval = namedprms[i];
		if(nameval.name) {
			options[nameval.name] = nameval.value;
		}
	}
	return options;
};

var aet = config.macros.AdvancedEditTemplate = {
	lingo:{
		"aet_upload":"Upload a local file:",
		"aet_imgpreview":"a preview of currently selected image will be shown here",
		"aet_select":"Please select.."
	},
	translate: function(id){
		if(!aet.lingo[id]) {
			return id;
		} else {
			return aet.lingo[id];
		}
	},
	extensions: {
		"dropdown":{
			createDropDownMenu: function(place, fieldName, values, initialValue, tiddler, selected, sort){
				if(typeof fieldName == 'object'){
					fields = fieldName;
				} else {
					fields = [fieldName];
				}
				if(!selected) {
					selected = "";
				}
				if(!initialValue) {
					initialValue = "aet_select";
				}
				var menus = this._createMenus(values);
				var lastMenu, fieldid;
				var allMenus = [];
				var selectedItem = false;
				var nowtselected = true;
				for(var j=menus.length-1; j >-1; j--){
					var selectedOption = selected;
					var newMenu = document.createElement("select");
					if(j > 0){
						newMenu.style.display = "none";
					}
					if(fields.length == 1){
						fieldid = 0;
					} else{
						fieldid = menus[j].depth;
					}
					if(tiddler) {
						selectedOption = tiddler.fields[fields[fieldid]] || "";
					}
					newMenu.name = fields[fieldid];
					newMenu.associatedFields = fields;
					var menuoptions = menus[j].options;
					for(var k=0; k<menus[j].options.length;k++){
						var translation = aet.translate(menus[j].options[k].caption);
						if(translation) {
							menus[j].options[k].caption=translation;
						}
					}
					if(sort){
						var sorter = function(a,b){
							if(a.caption < b.caption){
								return -1;
							} else {
								return 1;
							}
						};
						sorter = menuoptions.sort(sorter);
					}
					var firstCaption = aet.translate(initialValue);
					firstCaption = !firstCaption ? initialValue : firstCaption;
					var topitem = [{'caption': firstCaption, 'value': 'null', 'name': null}];
					menuoptions = topitem.concat(menuoptions);
					for(var k=0; k <menuoptions.length; k++){
						var opt =menuoptions[k];
						if(opt.caption.replace(" ","") != ""){
							var optionEl = document.createElement("option");
							if(opt.childMenu) {
								optionEl.childMenu = allMenus[opt.childMenu];
								optionEl.childMenu.parentOption = optionEl;
							}
							if(opt.value){
								optionEl.value = opt.value;
							}
							if(nowtselected && optionEl.value ==selectedOption){
								optionEl.selected = true;
								newMenu.style.display = "";
								selectedItem = optionEl;
								nowtselected = false;
							}
							optionEl.appendChild(document.createTextNode(opt.caption));
							newMenu.appendChild(optionEl);
						}
					}
					newMenu.onchange = function(e){
						/*toggle menu*/
						var opt = this[this.selectedIndex];
						if(opt.childMenu){
							opt.childMenu.style.display=""
							if(this.expandedMenu) this.expandedMenu.style.display = "none";
							this.expandedMenu = opt.childMenu;
						}
						else{
							if(this.expandedMenu) {
								this.expandedMenu.style.display = "none";
							}
							this.expandedMenu = null;
						}
						var handler = aet.extensions["dropdown"].setDropDownMetaData(e,this,tiddler);
					};

					allMenus[j] = newMenu;
					if(lastMenu){
						lastMenu.childMenu = newMenu;
					}
					lastMenu = newMenu;

				}
				for(var k=0; k < allMenus.length; k++){
					place.appendChild(allMenus[k]);
				}

				if(nowtselected){
					selectedItem = allMenus[0].firstChild;
				}
				if(selectedItem){
					this._revealSelectMenus(selectedItem);
				}
			},
			_revealSelectMenus: function(selecteditem){
				if(!selecteditem.selected) {
					selecteditem.selected = true;
				}
				var containingmenu = selecteditem.parentNode;
				if(selecteditem.childMenu){
					selecteditem.childMenu.style.display = "";
					containingmenu.expandedMenu = selecteditem.childMenu;
				}
				if(containingmenu.style.display == "none"){
					containingmenu.style.display = "";
				}
				while(containingmenu) {
					var parentoption = containingmenu.parentOption;
					if(parentoption) {
						parentoption.selected = true;
						var parentmenu = parentoption.parentNode;
						if(parentmenu) { 
							parentmenu.style.display = "";
							parentmenu.expandedMenu = containingmenu;
							containingmenu = parentmenu;
						} else {
							containingmenu = false;
						}
					} else{
						containingmenu = false;
					}
				}
			},
			_createMenus: function(menutextrepresentation){
				var chain = [0];
				var menus = [];
				var values = menutextrepresentation;
				var myparents = [];
				var depth = 0;
				for (var i = 0; i < values.length; i++) {
					var value;
					var caption = values[i];
					if(caption.indexOf("##") > -1){ //remove any commenting
						caption = caption.substring(0,caption.indexOf("##"));
					}
					value = caption;
					if(caption.indexOf(":") > -1) {
						var splitstr= caption.split(":");
						caption = splitstr[0];
						value = splitstr[1];
					}
					caption = caption.replace("<","");
					caption = caption.replace(">","");

					var chainid = chain.length -1;
					if(!menus[chain[chainid]]) {
						menus[chain[chainid]] = {
							depth: depth
						};
						menus[chain[chainid]].options= [];
					}
					if(value.indexOf(">") != -1) {
						value = value.replace(">","");
						var newmenuid = menus.length;
						menus[chain[chainid]].options.push({'caption': caption, 'value': value,'childMenu': newmenuid});
						chain.push(newmenuid);
						myparents.push(value+">");
						depth += 1;	
					} else if(value.indexOf("<") != -1) {
						value = value.replace("<","");
						menus[chain[chainid]].options.push({'caption': caption,'value': value});
						myparents.pop();
						chain.pop();
						depth -= 1;	
					} else {
						menus[chain[chainid]].options.push({'caption': caption, 'value':value});
					}
				}
				return menus;
			},
			// Ensure that changes to a dropdown field are stored as an extended field.
			setDropDownMetaData: function(ev, el, tiddler, autosavechanges) {
				var e = ev ? ev : window.event;
				var title = tiddler.title
				var selected = el[el.selectedIndex];
				var fieldname = selected.parentNode.name;
				var fieldvalue = selected.value;
				for(var i=0; i < el.associatedFields.length; i++){
					var fieldname =el.associatedFields[i];
					aet.setMetaData(title,fieldname,fieldvalue,autosavechanges);
				}	
				var parent = selected.parentNode.parentOption;

				if(selected.value == 'null'){
					if(parent){
						selected = parent;
						fieldvalue = selected.value;	
					}
				}
				if(parent) {
					aet.extensions['dropdown'].setDropDownMetaData(ev,parent.parentNode,tiddler);
				}
				aet.setMetaData(title,fieldname,fieldvalue,autosavechanges);
			}
		},
		"if":{
			_doStatement: function(stmt, tiddler, or){
				var delimiter = "&";
				if(or) {
					delimiter = "|";
				}
				var params = stmt.split(delimiter);
				var finalEval = true;
				if(or) finalEval = false;
				for(var i=0; i < params.length; i++){
					var evaluatesTo = true;
					var arg = params[i];
					if(arg.indexOf("!") == 0){
							var x = tiddler.fields[arg.substr(1)];
							if(x) {
								evaluatesTo = false;
							} else {
								evaluatesTo = true;
							}
					} else{
						var x = tiddler.fields[arg];
						if(!x){
								evaluatesTo = false;
						}
					}
					if(or) {
						finalEval = evaluatesTo || finalEval;
					} else{
						finalEval = evaluatesTo && finalEval;
					}
				}
				return finalEval;
			},
			doIfStatement: function(place, stmt, tiddler){
				var or = false;
				if(stmt.indexOf("|") > -1) {
					or = true;
				}
				var finalEval = this._doStatement(stmt, tiddler, or);
				if(!finalEval) {
					$(place).empty();
				}
				return finalEval;
			}
		}
	},
	controlTypes: {
		text: function(place, tiddler, fieldName, options){
			var maxlength = options.maxlength;
			var rows = options.rows;
			params = [fieldName];
			if(rows) params.push(rows);
			paramString = "";
			var e = config.macros.edit.handler(place, null, params, null, paramString, tiddler);
			$(e).attr("maxlength",maxlength);
		},
		dropdown: function(place, tiddler, fieldName, options){
			var valueSource = options.values ||options.valuesSource;
			if(!valueSource) {
				displayMessage("Please provide a parameter valuesSource telling me the name of the tiddler where your drop down is defined.");
				return;
			}
			if(fieldName.indexOf(",") > -1) {
				fields = fieldName.split(",");
				for(var j = 0; j < fields.length; j++){
					fields[j] = $.trim(fields[j]);
				}
			} else {
				fields = [fieldName];
			}
			var selected = store.getValue(tiddlerobj,fields[fields.length -1]);
			if(!selected) {
				var qsvalue =aet.getVariableFromQueryString(fields[fields.length-1]);
				if(qsvalue) selected = qsvalue;
			}
			var tiddlerobj = store.getTiddler(valueSource);
			if(tiddlerobj) {
				var values = tiddlerobj.text.split('\n');
				var sorted = tiddlerobj.tags.contains("sorted");
				aet.extensions["dropdown"].createDropDownMenu(place, fields, values, false, tiddler, selected, sorted);
			}
		}
	},
	handler: function(place, macroName, p, wikifier, paramString, tiddler) {
		var options = paramString.toJSON();
		if(options["if"]){
			aet.extensions["if"].doIfStatement(place,options["if"],tiddler);
		}
		var controlType = options.type;
		var field = options.field || options.metaDataName;
		options.field = field;
		var controlHandler = aet.controlTypes[controlType];
		if(controlHandler) {
			controlHandler(place,tiddler,field,options);
		}
	},
	getMetaData: function(title, extField){ 
		extField = extField.toLowerCase();
		var tiddler = store.getTiddler(title);
		if(!tiddler) {
			return false;
		} else{
			if(!tiddler.fields[extField]){
				return false;
			}
			else{
				return tiddler.fields[extField];
			}
		}
	},
	setMetaData: function(title, extField, extFieldVal, autosavechanges){
		if(autosavechanges) {
			var t = store.getTiddler(title);
			if(!t) {
				t = new Tiddler(title);
				if(config.shadowTiddlers[title]) {
					t.text = config.shadowTiddlers[title];
				}
				merge(t.fields, config.defaultCustomFields);
			}
			t.fields[extField] = extFieldVal;
			t = store.saveTiddler(t.title,t.title,t.text,t.modifier,t.modified,t.tags,t.fields,true,t.created,t.creator);
			if(aet.savetimeout) {
				window.clearTimeout(aet.savetimeout);
			}
			aet.savetimeout = window.setTimeout(function() {
					autoSaveChanges(null, [t]);
				}, 1000);
		} else {
			extField = extField.toLowerCase();
			var tidEl = story.getTiddler(title);
			var edit = $("[edit=%0]".format([extField]), tidEl);
			if(edit.length === 0) {
				edit = $("<input />").attr("type", "hidden").attr("edit", extField).appendTo(tidEl);
			}
			extFieldVal = extFieldVal ? extFieldVal : "";
			edit.val(extFieldVal);
		}
	},
	getVariableFromQueryString:function(varName){
		var qs = window.location.search.substring(1);
		var atts = qs.split("&");
		for(var i =0; i <atts.length; i++){
			var varVal = atts[i].split("=");
			if(varVal[0]==varName){
				return decodeURI(varVal[1]);
			}
		}
		return false;
	}
};

config.macros.aet = aet;
if(config.macros.view){
	if(!config.macros.view.views) {
		config.macros.view.views = {};
	}
	config.macros.view.views.linklist = function(value,place,params,wikifier,paramString,tiddler) {
		var classname = "";
		var values = value.split("\n");
		for(var i = 0; i < values.length; i++){
				wikify("[[%0]]\n".format([values[i]]), place);
		}
	};
	config.macros.view.views.hiddeninput = function(value,place,params,wikifier,paramString,tiddler) {
		var classname="";
		if(params[2]) {
			classname = params[2];
		}
		$(place).append("<input type='hidden' value='"+value+"'/>");
	};
}
})(jQuery);
//}}}