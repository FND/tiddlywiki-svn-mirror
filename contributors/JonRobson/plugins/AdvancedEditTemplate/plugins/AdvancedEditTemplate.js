
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
		,advancedDropdown: function(){
			
		}
		,handler: function(place,macroName,p,wikifier,paramString,tiddler) {
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
				
				if(metaDataName.indexOf(",") > -1){
					fields = metaDataName.split(",");
					for(var j=0; j < fields.length; j++){
						fields[j] = jQuery.trim(fields[j]);
					}
				}
				else{
					fields = [metaDataName];
				}
				
				var selected = store.getValue(tiddler,fields[fields.length -1]);
				if(!selected){
					var qsvalue =this.getVariableFromQueryString(fields[fields.length-1]);
					if(qsvalue) selected = qsvalue;
				}
				var tiddler =store.getTiddler(valueSource);
				
				if(tiddler){
					var values = tiddler.text.split('\n');
					var sorted = tiddler.tags.contains("sorted");
					this.createDropDownMenu(place,fields,values,false,this.setDropDownMetaData,selected,sorted);
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
			        					
				this.createCheckBox(place,title,metaDataName);
				
			}
			else if(ctrlType == 'date'){
			        this.createDatePicker(place,title,metaDataName);
			}
			else if(ctrlType == 'color'){
				this.createColorBar(place,title,metaDataName);
			}
			else if(ctrlType == 'image'){
				var that = this;
				var handler = function(value){
					that.setMetaData(title,metaDataName,value);
				};
				var initialValue = "";
				initialValue = this.getMetaData(title,metaDataName);
				var image = new config.macros.AdvancedEditTemplate.EditTemplateImage(place, paramString,initialValue,handler);
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
			var slider = new VismoColorSlider(container,200,15,changefunction);
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
			var possibleSuggestions = {real:values,test:[]};
			
			for(var i=0; i < possibleSuggestions.real.length; i ++){
			        possibleSuggestions.real[i] = possibleSuggestions.real[i].replace(/[\>|\<]/ig, "")
				possibleSuggestions.test.push(possibleSuggestions.real[i].replace(/ /,""));
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
					value = value.replace(/ /ig,"");
					var regexp = new RegExp(value,"i");
					suggestions.style.display="none";
					for(var i=0; i<possibleSuggestions.test.length; i++){
						
						var trythis =possibleSuggestions.test[i];
						if(trythis.search(regexp) != -1){
							var suggestion = document.createElement("li");
							var text = possibleSuggestions.real[i];
							suggestion.innerHTML =text;
							suggestions.style.display = "";
							suggestion.onmousedown = function(e){
								selectValue(jQuery(this).text(),suggestions);
								suggestions.style.display = "none";
							}
							list.appendChild(suggestion);
						}
					        
					}
					
				
					jQuery(input).mouseover(function(e){ if(suggestions.innerHTML !="") suggestions.style.display = ""; return false;});
					jQuery(suggestions).mouseleave(function(e){ this.style.display = "none"; return false;});
					suggestions.appendChild(list);
					
			};
			
			var old = window.onkeypress;
			window.onkeydown = function(e){
				var t = VismoClickingUtils.resolveTarget(e);
				if(t && t == input){
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
			var depth = 0;
			for (var i=0; i < values.length; i++) {
				
				var value;
				var caption = values[i];
				if(caption.indexOf("##") > -1){ //remove any commenting
					caption = caption.substring(0,caption.indexOf("##"));
				}
				value = caption;

				if(caption.indexOf(":") > -1){
					var splitstr= caption.split(":");
					caption = splitstr[0];
					value = splitstr[1];
				}
				caption = caption.replace("<","");
				caption = caption.replace(">","");
		
				var chainid = chain.length -1;
				if(!menus[chain[chainid]]){
					menus[chain[chainid]] = {depth: depth};
					menus[chain[chainid]].options= [];
				}
	

				if(value.indexOf(">") != -1){
					value = value.replace(">","");
					var newmenuid = menus.length;
					menus[chain[chainid]].options.push({'caption': caption, 'value': value,'childMenu': newmenuid});
					chain.push(newmenuid);
					myparents.push(value+">");
					depth += 1;	
			
				}
				else if(value.indexOf("<") != -1){			
					value = value.replace("<","");

					menus[chain[chainid]].options.push({'caption': caption,'value': value});
					myparents.pop();
					chain.pop();
					depth -= 1;	
				}
				else{
					menus[chain[chainid]].options.push({'caption': caption, 'value':value});
				}
			
						

								
			}
	
			return menus;
		}
		,createDropDownMenu: function(place,fieldName,values,initialValue,handler,selected,sort){
				if(typeof fieldName == 'object'){
					fields = fieldName;
				}
				else{
					fields = [fieldName];
				}
				
				
				if(!selected) selected = "";
				if(!initialValue){
					initialValue = "Please select.. ";
				}
				var menus = this._createMenus(values);
				
				var lastMenu, fieldid;
				var allMenus = [];
				var selectedItem = false;
				var nowtselected = true;
				
				
				for(var j=menus.length-1; j >-1; j--){
					var newMenu = document.createElement("select");
					
					if(j > 0){
						newMenu.style.display = "none";
					}
					if(fields.length == 1){
						fieldid = 0;
					}
					else{
						fieldid = menus[j].depth;
					}
			
					newMenu.name = fields[fieldid];
					newMenu.associatedFields = fields;
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
			
							if(nowtselected && optionEl.value ==selected){
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
				var aet = config.macros.AdvancedEditTemplate;

				
				var fieldname = selected.parentNode.name;
				var fieldvalue = selected.value;
				for(var i=0; i < el.associatedFields.length; i++){
					var fieldname =el.associatedFields[i];
					aet.setMetaData(title,fieldname,fieldvalue);
				}	
				var parent = selected.parentNode.parentOption;
				
				if(selected.value == 'null'){
					if(parent){
						selected = parent;
						fieldvalue = selected.value;	
					}
				}
				
				if(parent){
					aet.setDropDownMetaData(ev,parent.parentNode);
				}
				
				aet.setMetaData(title,fieldname,fieldvalue);
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
		,createDatePicker: function(place,title,metaDataName){
		        
		        var tiddler = store.getTiddler(title);
		        var params = [metaDataName];
		        
                        var div = document.createElement("div");
                        div.className  = "datePicker";
                        var input = document.createElement("input");
                        input.className = "date-pick";
                        jQuery(div).append(input);
                        jQuery(place).append(div);
                        $(function()
                        {
                                var start =config.macros.AdvancedEditTemplate.getMetaData(title,metaDataName);
                                if(!start)start="";
                        	$(input).datePicker({startDate:'01/01/1700'}).val(start).trigger('change');
                        	$(input).change(function(e){
                        	        config.macros.AdvancedEditTemplate.setMetaData(title,metaDataName,this.value);
                        	
                        	});
                        });
              
		        //config.macros.edit.handler(place,false,params,false,false,tiddler)
                        
		}
		
		,createCheckBox: function(place,title,metaDataName){
		         
		        		var c = document.createElement("input");
		        		
					c.setAttribute("type","checkbox");
					c.value = "false";
					   //    alert("!");
	                               place.appendChild(c);
					var selected =this.getMetaData(title,metaDataName);
				
					if(!selected){
						var qsvalue =this.getVariableFromQueryString(metaDataName);
						if(qsvalue) selected = qsvalue;
					}
				
					if(selected){
					        alert("hereeee");
					        c.value = selected;
					        c.checked = true;
					  
					        
					}
			
					var that = this;
					
					jQuery(c).click(function(e){
					     
						var taskTiddler = story.findContainingTiddler(place);
						var title = taskTiddler.getAttribute("tiddler");
						
						if(this.checked){
							that.setMetaData(title,metaDataName,"true");
						}
						else{
						  
							that.setMetaData(title,metaDataName,null);
						}
					});
						
					
		}
	};
	
	
	config.macros.AdvancedEditTemplate.EditTemplateImage = function(place,initial,handler){
		this.init(place,initial,handler);
	};
	config.macros.AdvancedEditTemplate.EditTemplateImage.prototype = {
		init: function(place,paramString,initial,handler){
			var holder = document.createElement("div");
			holder.className = "AdvancedEditTemplateImage";
			var input = document.createElement("input");
			if(initial)input.value = initial;
			var image = document.createElement("img");
			image.src = initial;
			var browser = document.createElement("div");
			browser.className = "filebrowser";
			var params = paramString.parseParams("anon",null,true,false,false);
                	
			var root = getParam(params,"root", null);
			var connector = getParam(params,"connector", null);
		   
			var home =  getParam(params,"home", null);
			
			input.onchange = function(e){
				var newsrc = this.value;
				image.src=  "";
				image.src = newsrc;
				if(handler)handler(newsrc);
			};
			//var root  ='images/'
			//var connector = 
			//var home = http://www.jonrobson.me.uk/projects/AdvancedEditTemplate/connectors/

			//	var connector= "http://www.jonrobson.me.uk/projects/AdvancedEditTemplate/connectors/jqueryFileTree.php";	
			holder.appendChild(image);
			holder.appendChild(input);
			holder.appendChild(browser);
			place.appendChild(holder);
			var r;
			if(!home) home = "";
			if(root) r =root; else r ="";
			$(browser).fileTree({ root: r, script: connector }, function(file) { 
						input.value = home + file;
						input.onchange();
					
			});
			
		}
	};
};


//}}}
