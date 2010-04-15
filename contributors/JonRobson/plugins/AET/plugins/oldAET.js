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

// create macro object
(function($) { // set up alias
try{
    config.locationData = [];
    config.geoData = {};
  config.shadowTiddlers.AdvancedEditTemplateStyle = "/*{{{*/\n" +
  ".clearboth {clear:both;}\n"+
  ".aet_radioboxes label {width:auto;float:left;}\n"+
  ".aet_radioboxes input {width:auto;float:left;}\n"+
  ".tip {font-style:italic;font-weight:bold;}\n"+
  ".dp-popup {position:absolute;background-color:white;} a.dp-choose-date {	float: left;	width: 16px;	height: 16px;	padding: 0;	margin: 5px 3px 0;	display: block;	text-indent: -2000px;	overflow: hidden;	background: url(calendar.png) no-repeat; }a.dp-choose-date.dp-disabled {	background-position: 0 -20px;	cursor: default;}input.dp-applied {	width: 140px;	float: left;}\n"+
  ".filebrowser{background-color:white; border:solid 1px black;}\n"+
  "a.dp-choose-date {border:solid 1px black;}\n"+
  ".dp-nav-prev {float:left;}\n"+
  ".dp-nav-next {float:right;}\n"+
  ".dp-calendar {clear:both;}\n"+
  ".dp-popup {padding:10px;border:solid 1px black;z-index:4;}\n"+
  ".jCalendar .selected {background-color:gray;}\n"+
  "/*}}}*/"
store.addNotification("AdvancedEditTemplateStyle", refreshStyles);
}catch(e){};






if(!version.extensions.AdvancedEditTemplatePlugin) 
{
  jQuery("#storeArea").append("<iframe id='aet_iframe' name='aet_post_to' src='' style='display:none;'></iframe>"); 
  
	version.extensions.AdvancedEditTemplatePlugin = {installed:true};
	
	config.macros.AdvancedEditTemplate = {
		,setupLocationFinder: function(place,tiddlerobj,initial,autosavechanges){
		    var searchurl = "http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q=";
		    var saveAs ={};
		    var that = this;
		    
		    var place_to_ll = config.geoData;
		    var saver = function(savethis){

		        if(place_to_ll[savethis]){
		            var lng = place_to_ll[savethis]['longitude'];
		            var lat = place_to_ll[savethis]['latitude'];
		            that.setMetaData(tiddlerobj.title,"longitude",lng,autosavechanges);
		            that.setMetaData(tiddlerobj.title,"latitude",lat,autosavechanges);
		            that.setMetaData(tiddlerobj.title,"place",savethis,autosavechanges);
		        }
		        
		        
		    };
		    var handler = function(event,values){
		        if(values.length == 0) return;
    			var name = values[0]
    		    saver(name);
		    }
		    var suggestions = config.locationData;
		    var options = {selectFirst:false,matchContains:true};
		    if(!initial)initial = "{type name of place}";
		    var ac = jQuery("<input type='text' value=\""+initial+"\"/>").autocomplete(suggestions,options).result(handler).appendTo(place);
            var keysSinceQuery =0;
            
            
            jQuery("input",place).keypress(function(e){
                if(e.which == 13){
                    handler(this.value);
                    return;
                }
                keysSinceQuery += 1;
                if(keysSinceQuery > 1){
                    keysSinceQuery = 0;
                    var that = this;
                    ajaxReq({url:searchurl+this.value,success:function(r){
                        var results = eval("("+r+")");
                        var data = results.responseData.results;
                        
                        for(var i=0; i < data.length;i++){
                            var res = data[i];
                            var lat =res.lat;
                            var lon = res.lng;
                            var city = res.city;
                            var address = res.addressLines.join(", ");
                            var country = res.country;
                           
                            if(!place_to_ll[address]){
                                
                                suggestions.push(address);
                                place_to_ll[address] = {longitude:lon,latitude:lat};
                            }
                            
                            
                            
                            
                        }
                        options.data = suggestions;
                        ac.setOptions(options);
                        
                    }});
                    
                    
                    
                }
                
                //console.log("cool",this.value);
            });
            
 
		}

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
				
				var selected = store.getValue(tiddlerobj,fields[fields.length -1]);
				if(!selected){
					var qsvalue =this.getVariableFromQueryString(fields[fields.length-1]);
					if(qsvalue) selected = qsvalue;
				}
				var tiddlerobj =store.getTiddler(valueSource);
				
				if(tiddlerobj){
					var values = tiddlerobj.text.split('\n');
					var sorted = tiddlerobj.tags.contains("sorted");
					this.createDropDownMenu(place,fields,values,false,this.setDropDownMetaData,selected,sorted);
				}
		}
		
		,_doStatement: function(stmt,tiddler,or){
		        var delimiter = "&";
		        if(or){
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
                        //console.log("cool");
                        if(x){
                            evaluatesTo = false;
                        }
                        else{
                            evaluatesTo = true;
                        }
                    }
                    else{
                        var x = tiddler.fields[arg];
                        if(!x){
                            evaluatesTo = false;
                        }
                    }
                    if(or){
                        finalEval = evaluatesTo || finalEval;
                    }
                    else{
                        finalEval = evaluatesTo && finalEval;
                    }//console.log(arg,evaluatesTo,finalEval);

                }
                return finalEval;
		}
		,doifstatement: function(place,stmt,tiddler){
		    var or = false;
		    if(stmt.indexOf("|") > -1){
		        or= true;
		    }
		    var finalEval = config.macros.aet._doStatement(stmt,tiddler,or);
            
            if(!finalEval){
                place.innerHTML = "";
             }
		    
		}
		,handler: function(place,macroName,p,wikifier,paramString,tiddler) {
			var tiddlerDom = story.findContainingTiddler(place);
			var params = paramString.parseParams("anon",null,true,false,false);
			var ifstmt = getParam(params,"if",null);
			if(ifstmt){
                config.macros.aet.doifstatement(place,ifstmt,tiddler);
			    //place.appendChild(newdiv);
			    return;
			}
			var ctrlType = getParam(params,"type",null);
      var autosavechanges = getParam(params,"autoSaveChanges");  
			var title = tiddlerDom.getAttribute("tiddler");
			var tiddlerobj = store.getTiddler(title);
			var metaDataName = getParam(params,"metaDataName", null);
			var needsWikify = getParam(params,"wikify", null);
			// build a drop down control
			var valueSource = getParam(params,"valuesSource", null);
			if(!valueSource) valueSource = metaDataName + "Definition";
			
			if(ctrlType == 'dropdown') {
			   
			}
			else if(ctrlType =='location'){
			    //http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q=
			    var selected = tiddlerobj.fields[metaDataName];
			    
			    this.setupLocationFinder(place,tiddlerobj,selected);
			}
			else if(ctrlType == 'embedvideo'){
			    this.setupEmbeddedVideo(place,tiddlerobj,metaDataName,valueSource);
			}
			else if(ctrlType == 'search'){

			}
			else if(ctrlType == 'checkbox'){      					
				
				
			}
			else if(ctrlType == 'radio'){

			}
			else if(ctrlType == 'date'){

			}
			else if(ctrlType == 'color'){
				this.createColorBar(place,title,metaDataName);
			}
			else if(ctrlType == 'image'){

			}
			else if(ctrlType == 'text'){
			    var maxlength = getParam(params,"maxlength", null);
			    var rows = getParam(params,"rows", null);
			    params = [metaDataName];
			    if(rows) params.push(rows);
			    paramString ="";
			    var e = config.macros.edit.handler(place,macroName,params,wikifier,paramString,tiddler);
			    if(maxlength) e.setAttribute("maxlength",maxlength); 
			}
			else if(ctrlType == 'file'){
				var that = this;
				var handler = function(value){
					that.setMetaData(title,metaDataName,value,autosavechanges);
				};
				var initialValue = "";
				initialValue = this.getMetaData(title,metaDataName);
				var image = new config.macros.AdvancedEditTemplate.EditTemplateFile(place, paramString,initialValue,handler,false);
			}
		}



		,setupEmbeddedVideo: function(place){
		    place.append("video url:<input type='text' class='videoinput'/>");
		    jQuery(".videoinput",place).change(function(){
		        //alert("cool");
		    });
		    
		}

	};
	
	
	config.macros.AdvancedEditTemplate.EditTemplateFile = function(place,paramString,initial,handler,preview){
		this.init(place,paramString,initial,handler,preview);
	};
	config.macros.AdvancedEditTemplate.EditTemplateFile.prototype = {
		init: function(place,paramString,initial,handler,preview){
			var holder = document.createElement("div");
			holder.className = "AdvancedEditTemplateImage";
			//JON
			
			var imageholder = document.createElement("div");
			imageholder.className = "aet_ImageHolder";

			//image.src = initial;
			//image.alt = config.macros.aet.translate("aet_imgpreview");

			var params = paramString.parseParams("anon",null,true,false,false);
                	
			var root = getParam(params,"root", null);
			var connector = getParam(params,"browser", null);
			var uploader =getParam(params,"uploader",null);
			var home = "";
			place.appendChild(holder);
			if(preview){
			    holder.appendChild(imageholder);			
			    config.macros.viewimage.handler(imageholder,false,false,false,"maxwidth:200 maxheight:200 src:"+initial,tiddler);
			}

			

			
			var form = document.createElement("div");
			holder.appendChild(form);
			var filenameid = "filename_"+ Math.random();
            form.innerHTML = "<form target='aet_post_to' action='"+uploader+"?postbackto="+ filenameid +"' id='submitter' enctype='multipart/form-data' name='mysexyform' action='/ilga/upload/image' method='POST'>"+config.macros.aet.translate("aet_upload")+"url:<input type='text' id='"+filenameid+"' name='NewFilename' class='filename' value=''/><input type='file' class='file' id='NewFile' name='NewFile'/><input type='submit' value='Send'></form>";
         
            
            var jqFile = jQuery(".file",form);
			jqFile.change(function(e){
			    var newvalue = jQuery(e.target).val();
			    
			   jQuery(".filename",form).val(newvalue); 
			});
			  
                
			jQuery(holder).append("<div class='leftcol'></div><div class='rightcol'></div>");

			var filename = jQuery(".filename",form)[0];		
			filename.onchange = function(e){
				var newsrc = this.value;
				//image.src=  "";
				//image.src = newsrc;
				jQuery(imageholder).html("");
				config.macros.viewimage.handler(imageholder,false,false,false,"maxwidth:200 maxheight:200 src:"+newsrc,tiddler);
				if(handler)handler(newsrc);
			};
			if(initial)filename.value = initial;	
			jQuery(".rightcol",holder).append("<div class='browserarea' style='position:relative;'><input type='button' class='browsebutton' value='browse'><div class='filebrowser' style='position:absolute;display:none;z-index:200'></div></div>");
			var bb = jQuery(".browsebutton",holder);
			bb.click(function(e){
			    var browser =$(".filebrowser",$(this).parent());
			    browser.toggle();
		
			    browser.css({left:$(this).position().left});    
			})
			
			
			var browser = jQuery(".filebrowser");

			var r;
			if(!home) home = "";
			if(root) r =root; else r ="";
			/*browser.fileTree({ root: r, script: connector }, function(file) { 
						filename.value = file;
						filename.onchange();
			});*/
			
		}
	};
};
config.macros.aet = config.macros.AdvancedEditTemplate;



// jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
if(jQuery) (function($){
	
	$.extend($.fn, {
		fileTree: function(o, h) {
			// Defaults
			if( !o ) var o = {};
			if( o.root == undefined ) o.root = '/';
			if( o.script == undefined ) o.script = 'jqueryFileTree.php';
			if( o.folderEvent == undefined ) o.folderEvent = 'click';
			if( o.expandSpeed == undefined ) o.expandSpeed= 500;
			if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
			if( o.expandEasing == undefined ) o.expandEasing = null;
			if( o.collapseEasing == undefined ) o.collapseEasing = null;
			if( o.multiFolder == undefined ) o.multiFolder = true;
			if( o.loadMessage == undefined ) o.loadMessage = 'Loading...';
			
			$(this).each( function() {
				
				function showTree(c, t) {
					$(c).addClass('wait');
					$(".jqueryFileTree.start").remove();
					
					if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
						window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
					
					//changed from post to get
					$.post(o.script, { dir: t }, function(data) {
						$(c).find('.start').html('');
						$(c).removeClass('wait').append(data);
						if( o.root == t ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
						bindTree(c);
					});
				}
				
				function bindTree(t) {
					$(t).find('LI A').bind(o.folderEvent, function() {
						if( $(this).parent().hasClass('directory') ) {
							if( $(this).parent().hasClass('collapsed') ) {
								// Expand
								if( !o.multiFolder ) {
									$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								}
								$(this).parent().find('UL').remove(); // cleanup
								showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) );
								$(this).parent().removeClass('collapsed').addClass('expanded');
							} else {
								// Collapse
								$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
								$(this).parent().removeClass('expanded').addClass('collapsed');
							}
						} else {
							h($(this).attr('rel'));
						}
						return false;
					});
					// Prevent A from triggering the # on non-click events
					if( o.folderEvent.toLowerCase != 'click' ) $(t).find('LI A').bind('click', function() { return false; });
				}
				// Loading message
				$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
				// Get the initial file list
				showTree( $(this), escape(o.root) );
			});
		}
	});
	
})(jQuery);


