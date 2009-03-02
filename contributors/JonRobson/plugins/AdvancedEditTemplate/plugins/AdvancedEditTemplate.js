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

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			
			var tiddlerDom = story.findContainingTiddler(place);
			var params = paramString.parseParams("anon",null,true,false,false);
			var ctrlType = getParam(params,"type",null);

			var title = tiddlerDom.getAttribute("tiddler");
			var tiddler = store.getTiddler(title);
			var metaDataName = getParam(params,"metaDataName", null);
			// build a drop down control
			if(ctrlType == 'dropdown') {
				
				var valueSrc = getParam(params,"valuesSource", null);
				if(!valueSrc) {
					displayMessage("Please provide a parameter valuesSource telling me the name of the tiddler where your drop down is defined.");
					return;
				}
				var selected = store.getValue(tiddler,metaDataName);
				var values = this.getDefValues(valueSrc);
				this.createDropDownMenu(place,metaDataName,values,this.setDropDownMetaData,selected);
				
			}
			else if(ctrlType == 'checkbox'){					
					var c = createTiddlyElement(place,"input");
					c.type = 'checkbox';
					c.value = true;
	
					if(this.getMetaData(title,metaDataName)){
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
			console.log(place.style.width, " is width");
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
		,createDropDownMenu: function(place,fieldName,values,handler,selected){
				if(!selected) selected = "";
	
				var menuid = 0;
				var lastmenuid = 0;
				var menus = [];
				
				for (var i=0; i < values.length; i++) {
					
					var value = values[i];
					if(!menus[menuid]){
						menus[menuid] = {};
						menus[menuid].options= [];
						menus[menuid].options.push({'caption': 'Please select', 'value': "", 'name': null});
					 }
					if(value.indexOf(">") != -1){
						lastmenuid = menuid;
						value = value.replace(">","");
						var newmenuid =menus.length;
						menus[menuid].options.push({'caption': value, 'name': fieldName + '::' + value,'childMenu': newmenuid});
						menuid = newmenuid;
					
					}
					else if(value.indexOf("<") != -1){
						value = value.replace("<","");
						menus[menuid].options.push({'caption': value, 'name': fieldName + '::' + value});
						menuid = lastmenuid;
					}
					else{
						menus[menuid].options.push({'caption': value, 'name': fieldName + '::' + value});
					}
							
	
									
				}
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
					
					var menuoptions = menus[j].options
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
							else{
							optionEl.value = opt.caption;
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
		,_handleOptionChange: function(){
			
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
		//Get definition values for populating UI from definition tiddlers.
		,getDefValues: function(src) {
			var text = store.getTiddlerText(src).split('\n');
			var output = [];
			for(var t=0; t<text.length; t++) {
				//support calling the old TaskViewBuilder macro to list the tasks here too.
				var blob = wikifyStatic(text[t],null,tiddler,null);				
				var linktitle = /tiddlylink="[^"]*"/mg;
				var titles = blob.match(linktitle);
				if(titles) {
					for(var n=0; n<titles.length; n++) {
						output.push(titles[n].replace(/tiddlylink="([^"]*)"/,'$1'));
					}
				}
				else {
					output.push(text[t]);
				}
			}
			return (output);	
		},


		// Ensure that changes to a dropdown field are stored as an extended field.
		setDropDownMetaData: function(ev,el) {
			
			var e = ev ? ev : window.event;
			var taskTiddler = story.findContainingTiddler(el);
			if(taskTiddler && taskTiddler != undefined) {
				var title = taskTiddler.getAttribute('tiddler');

				
				var selected = el[el.selectedIndex];
				var fieldname = selected.parentNode.name;
				var fieldvalue = selected.value;
				config.macros.AdvancedEditTemplate.setMetaData(title,fieldname,fieldvalue);
			}
		},
		
		getMetaData: function(title,extField){
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
		
			var tiddler =  store.getTiddler(title);
			if(!tiddler) {
				var fields = {};
				fields[extField] = extFieldVal;
				store.saveTiddler(title,title,null,true,null,[],fields,null);
			}
			else{
			store.setValue(tiddler,extField,extFieldVal);	
			}
		
		}
		// Ensure that changes to a free text field are stored as an extended field.
		,changeFreetext: function(ev) {
			var e = ev ? ev : window.event;
			var ttField = this.getAttribute('ttname');
			var value = this.value;
			if(ttField) {
				var t = story.findContainingTiddler(this);
				var title = t.getAttribute('tiddler');
				config.macros.ValueSwitcher.setMetaData(title,ttField,value);
			}
			return false;
		}
	};
}
//}}}
