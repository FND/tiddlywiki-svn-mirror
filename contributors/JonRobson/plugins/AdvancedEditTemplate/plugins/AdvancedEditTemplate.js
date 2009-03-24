/***
|''Name:''|AdvancedEditTemplatePlugin based on ValueSwitcherPlugin|
|''Description:''|Gather values from a definition tiddler, and present the user with a UI for setting a value from those available options as an extende field |
|''Version:''|0.4|
|''Date:''|02 March 2009|
|''Source:''|http://www.jonrobson.me.uk|
|''Author:''|Jon Robson : based on the work by PhilHawksworth (phawksworth (at) gmail (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.3|

Allows the adding of multiple level drop down menus and checkboxes to the edit template.
***/

//{{{
// Ensure that this Plugin is only installed once.
if(!version.extensions.AdvancedEditTemplatePlugin) 
{
	version.extensions.AdvancedEditTemplatePlugin = {installed:true};
	config.macros.AdvancedEditTemplate = {
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
		,handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			
			var tiddlerDom = story.findContainingTiddler(place);
			var params = paramString.parseParams("anon",null,true,false,false);
			var ctrlType = getParam(params,"type",null);

			var title = tiddlerDom.getAttribute("tiddler");
			var tiddler = store.getTiddler(title);
			var metaDataName = getParam(params,"metaDataName", null);
			// build a drop down control
			var valueSource = getParam(params,"valuesSource", null);
			if(!valueSource) valueSource = metaDataName + "Definition";
			if(ctrlType == 'dropdown') {
				
				
				if(!valueSource) {
					displayMessage("Please provide a parameter valuesSource telling me the name of the tiddler where your drop down is defined.");
					return;
				}
				var selected = store.getValue(tiddler,metaDataName);
				if(!selected){
					var qsvalue =this.getVariableFromQueryString(metaDataName);
					if(qsvalue) selected = qsvalue;
				}
				var tiddler =store.getTiddler(valueSource);
				
				if(tiddler){
					var values = tiddler.text.split('\n');
					var sorted = tiddler.tags.contains("sorted");
					this.createDropDownMenu(place,metaDataName,values,false,this.setDropDownMetaData,selected,sorted);
				}
			}
			else if(ctrlType == 'search'){
				if(!valueSource) {
					displayMessage("Please provide a parameter valuesSource telling me the name of the tiddler where your drop down is defined.");
					return;
				}
				var selected = store.getValue(tiddler,metaDataName);
				if(!selected){
					var qsvalue =this.getVariableFromQueryString(metaDataName);
					if(qsvalue) selected = qsvalue;
				}
				var tiddler =store.getTiddler(valueSource);
				if(tiddler){
					var values = tiddler.text.split('\n');
					var handler= function(value){
						config.macros.AdvancedEditTemplate.setMetaData(title,metaDataName,value);
					}
					this.createSearchBox(place,metaDataName,values,selected,handler);
				}
			}
			else if(ctrlType == 'checkbox'){					
					var c = createTiddlyElement(place,"input");
					c.type = 'checkbox';
					c.value = true;
	
					var selected =this.getMetaData(title,metaDataName);
					if(!selected){
						var qsvalue =this.getVariableFromQueryString(metaDataName);
						if(qsvalue) selected = qsvalue;
					}
					
					if(selected){
						c.checked = true;
					}
					else{
						c.checked = false;
					}
					
					var that = this;
					c.onchange =function(e){
						var taskTiddler = story.findContainingTiddler(place);
						var title = taskTiddler.getAttribute("tiddler");
						
						if(this.checked){
							that.setMetaData(title,metaDataName,"true");
						}
						else{
							that.setMetaData(title,metaDataName,null);
						}
					};				
				
			}
			else if(ctrlType == 'color'){
				this.createColorBar(place,title,metaDataName);
			}

		}
		,createColorBar: function(place,tiddlerTitle,metaDataName){

			var aet = this;
			var curValue = this.getMetaData(tiddlerTitle,metaDataName);
			var changefunction = function(newcolor){
				aet.setMetaData(tiddlerTitle,metaDataName,newcolor)
			};
			
			var container = document.createElement("span");
			place.appendChild(container);
			var slider = new EasyColorSlider(container,200,15,changefunction);
			slider.setColor(curValue);
		}
		,createSearchBox: function(place,fieldName,values,initialValue,action){
			var holder = document.createElement("div");
			holder.style.position = "relative";
			var input = document.createElement("input");
			input.style.position = "relative";
			if(initialValue) input.value = initialValue;
			var suggestions = document.createElement("div");
			suggestions.className = "suggestions"
			suggestions.style.display = "none";
			var possibleSuggestions = values;
			
			for(var i=0; i < possibleSuggestions.length; i ++){
				possibleSuggestions[i]=possibleSuggestions[i].replace(/[>|<]/ig, "");
			}
			
			var selectValue = function(val){
				if(val){
					input.value = val;
				}
				suggestions.innerHTML = "";
				if(action){
					action(val);
				}
			}

			
			var makesuggestions = function(value){
					
					suggestions.innerHTML = "";
					if(value.length < 3) return;
					var list = document.createElement("ul");
					list.className = "suggestion";
					suggestions.style.display = "none";
					var regexp = new RegExp(value,"i");
					suggestions.style.display="none";
					for(var i=0; i<possibleSuggestions.length; i++){
						
						var trythis =possibleSuggestions[i];
						if(trythis.search(regexp) != -1){
							var suggestion = document.createElement("li");
							suggestion.innerHTML =possibleSuggestions[i];
							suggestions.style.display = "";
							suggestion.onmousedown = function(e){
								selectValue(this.innerHTML,suggestions);
							}
							list.appendChild(suggestion)

						}
					}
					suggestions.appendChild(list);
			};
			
			var old = window.onkeypress;
			window.onkeypress = function(e){
				var t = EasyClickingUtils.resolveTarget(e);
				if(t == input){
					makesuggestions(t.value);
				}
				if(old) old(e);
			};
			input.onchange = function(e){
				makesuggestions(this.value);
			}
			holder.appendChild(input);
			holder.appendChild(suggestions);
		
			place.appendChild(holder);
		}

		,_createMenus: function(menutextrepresentation){
			var chain = [0];
			var menus = [];
			var values = menutextrepresentation;
			var myparents = [];
			for (var i=0; i < values.length; i++) {
				
				var value = values[i];
				var caption = values[i];
				
				caption = caption.replace("<","");
				caption = caption.replace(">","");
				if(caption.indexOf(":") > -1){
					caption = caption.split(":")[0];
				}
				
				var chainid = chain.length -1;
				if(!menus[chain[chainid]]){
					menus[chain[chainid]] = {};
					menus[chain[chainid]].options= [];
				}
				var parentValue = "";
				for(var j=0; j < myparents.length; j++){
					parentValue += myparents[j].toString();
				}

				if(value.indexOf(">") != -1){
				
					value = value.replace(">","");
					var newmenuid = menus.length;
					menus[chain[chainid]].options.push({'caption': caption, 'value': parentValue+value,'childMenu': newmenuid});
					chain.push(newmenuid);
					myparents.push(value+">");	
			
				}
				else if(value.indexOf("<") != -1){			
					value = value.replace("<","");

					menus[chain[chainid]].options.push({'caption': caption,'value':parentValue + value});
					myparents.pop();
					chain.pop();	
				}
				else{
					menus[chain[chainid]].options.push({'caption': caption, 'value':parentValue+value});
				}
			
						

								
			}
			return menus;
		}
		,createDropDownMenu: function(place,fieldName,values,initialValue,handler,selected,sort){
				if(!selected) selected = "";
				if(!initialValue){
					initialValue = "Please select.. ";
				}
				var menus = this._createMenus(values);
				
						
				var lastMenu;
				var allMenus = [];
				var selectedItem = false;
				var nowtselected = true;
				
				
				for(var j=menus.length-1; j >-1; j--){
					//var newMenu =createTiddlyDropDown(place,this.setDropDownMetaData,menus[j].options,selected);
					
					var newMenu = document.createElement("select");
					
					if(j > 0){
						newMenu.style.display = "none";
					}
					newMenu.name = fieldName;
					
					var menuoptions = menus[j].options;
					
					if(sort){		 
						var sorter = function(a,b){if(a.caption < b.caption){ return -1; }else return 1;};
						sorter =menuoptions.sort(sorter);
					}
					var topitem = [{'caption': initialValue, 'value': 'null', 'name': null}];
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
			
							if(nowtselected && optionEl.value.replace(" ","") ==selected.replace(" ","")){
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
						var opt =this[this.selectedIndex];
			
						if(opt.childMenu){
							opt.childMenu.style.display=""
							if(this.expandedMenu) this.expandedMenu.style.display = "none";
							this.expandedMenu = opt.childMenu;
						}
						else{
							if(this.expandedMenu) this.expandedMenu.style.display = "none";
							this.expandedMenu = null;
						}
						
						handler(e,this);
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
		}

		,_revealSelectMenus: function(selecteditem){
			if(!selecteditem.selected) selecteditem.selected = true;
			
			var containingmenu = selecteditem.parentNode;
			
			
			if(selecteditem.childMenu){
				selecteditem.childMenu.style.display = "";
				containingmenu.expandedMenu = selecteditem.childMenu;
			}
			if(containingmenu.style.display == "none"){
				containingmenu.style.display = "";
			}
			while(containingmenu){
				var parentoption = containingmenu.parentOption;
				if(parentoption) {
					parentoption.selected = true;
					var parentmenu = parentoption.parentNode;
					if(parentmenu){ 
						parentmenu.style.display = "";
						parentmenu.expandedMenu = containingmenu;
						containingmenu = parentmenu;
					}
					else{
						containingmenu = false;
					}
				}
				else{
					containingmenu = false;
				}

				
				
			}
			
			//containingmenu.parentMenu.style.display = "";
		}



		// Ensure that changes to a dropdown field are stored as an extended field.
		,setDropDownMetaData: function(ev,el) {
			
			var e = ev ? ev : window.event;
			var taskTiddler = story.findContainingTiddler(el);
			if(taskTiddler && taskTiddler != undefined) {
				var title = taskTiddler.getAttribute('tiddler');

				
				var selected = el[el.selectedIndex];
				var fieldname = selected.parentNode.name;
				var fieldvalue = selected.value;
				if(selected.value == 'null'){
					var parent = selected.parentNode.parentOption;
					if(parent){
						selected = parent;
						fieldvalue = selected.value;	
					}
				}
				
				config.macros.AdvancedEditTemplate.setMetaData(title,fieldname,fieldvalue);
			}
		},
		
		getMetaData: function(title,extField){
			extField = extField.toLowerCase();
			var tiddler =  store.getTiddler(title);
			if(!tiddler) {
				return false;
			}
			else{
				if(!tiddler.fields[extField]){
					return false;
				}
				else{
					return tiddler.fields[extField];
				}
			}
		}
		
		,setMetaData: function(title,extField,extFieldVal){
			extField = extField.toLowerCase();
			if(extFieldVal == "null") {
				extFieldVal = "";
			}
			var tiddler =  store.getTiddler(title);
			if(!tiddler) {
				store.saveTiddler(title,title,null,true,null,[],{},null);
				tiddler =  store.getTiddler(title);
			}
			store.setValue(tiddler,extField,extFieldVal);	
			
		
		}
	};
}
//}}}
