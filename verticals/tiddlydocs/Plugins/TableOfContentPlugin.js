/***
|''Name''|TableOfContentPlugin|
|''Description''|macro provides a view on the table of content for the currently active document|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/TableOfContentPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/TableOfContentPlugin.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

macro provides a view on the table of content for the currently active document

!Usage
{{{

<<TableOfContentPlugin>>

}}}

!Code
***/

//{{{
	
config.macros.TableOfContent={
	'emptyDocumentSpecPrompt':'Click the "New Section" link above to add a section to the document. Document section titles can be dragged into the table of contents.',
	'editTemplate':'TableOfContentPlugin##EditSectionTemplate', 
	'viewTemplate':DEFAULT_VIEW_TEMPLATE,
	'dragToolTip': 'Drag and drop to re-arrange sections in the table of content.',
	'deleteText': 'remove'
};

config.macros.TableOfContent.strip=function(s) {
	return s.replace(/ /g,'');
};

config.macros.TableOfContent.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.shadowTiddlers["tdocsMenuStyles"] = store.getTiddlerText("TableOfContentPlugin##StyleSheet");
	store.addNotification("tdocsMenuStyles", refreshStyles);
	config.macros.TableOfContent.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

config.macros.TableOfContent.specChanged = function() {
	window.testSpec = config.macros.TableOfContent.buildSpec(); 
	if(store.tiddlerExists(window.activeDocument)) { 
		var specTiddler = store.getTiddler(window.activeDocument); 
		var fields = merge(specTiddler.fields, config.defaultCustomFields); 
	} else { 
	    var fields = config.defaultCustomFields; 
	} 
	var spec = { format: { name: 'TiddlyDocsSpec', majorVersion:'0', minorVersion:'1' }, content: window.testSpec}; 
	store.saveTiddler(window.activeDocument, window.activeDocument, jQuery.toJSON(spec), null, null, "document", fields); 
	autoSaveChanges(true, window.activeDocument);
	refreshAll();
};

config.macros.TableOfContent.renderSpec = function(specView, spec) {
	window.ulCount=0;
	window.liCount=0;
	window.divCount=0;
	window.sectionCount = 1;
	jQuery(specView).empty();
	if(spec[0]) {
		config.macros.TableOfContent._renderSpec(specView, spec, []);
	} else {
				spec[0] = {};
				spec[0].title = 'Empty Document';
				spec[0].children = [];
				config.macros.TableOfContent._renderSpec(specView, spec, []);		
	}
	jQuery("#ul0").NestedSortable({
			accept: 'toc-item',
			noHoverClass: 'notHoverable',
			noNestingClass: "no-nesting", 
            helperclass: 'helper', 
            onChange: function(serialized) { 
              config.macros.TableOfContent.specChanged();
            }, 
            autoScroll: true, 
            handle: '.toc-sort-handle',
			onStart: function() {
				story.refreshTiddler(this.id,1,true);
			},
			onStop: function() {
				story.refreshTiddler(this.id,1,true);
			}
    }); 
    jQuery(".sectionHeading").hover( 
            function() { 
                    jQuery(this).parent().addClass("draggableHover");
                    jQuery(this).addClass("draggableChildHover");
            },  
            function() { 
                    jQuery(this).parent().removeClass("draggableHover");
                    jQuery(this).removeClass("draggableChildHover");

            } 
    );

};

config.macros.TableOfContent.buildSpec = function() {
  return config.macros.TableOfContent._buildSpec(jQuery(".specView > ul > li"));
};

config.macros.TableOfContent._buildSpec = function (liList) {
	var spec = [];
	liList.each(function() {
		if(this.id != 'empty'){
			var li=this;
			var node = {
				title: li.id
			};
			node.children = config.macros.TableOfContent._buildSpec(jQuery(li).children("ul").children("li"));
			spec.push(node);
		}
 	});
  return spec;
};
 
config.macros.TableOfContent._renderSpec = function(specView, spec, label) {
	var ul = createTiddlyElement(specView, "ul", "ul"+(window.ulCount++), "toc");
	if(spec[0] && spec[0].title == 'Empty Document'){
			var li = createTiddlyElement(ul, "li", 'empty', "clear-element toc-item no-nesting left ");
			var sectionDiv = createTiddlyElement(li, "h5", null, null, config.macros.TableOfContent.emptyDocumentSpecPrompt);	
			return false;
	}
	var childCount=1;
	label=label.concat([0])
	jQuery.each(spec, function() {
		label[label.length-1]++;
		var li = createTiddlyElement(ul, "li", this.title, "clear-element toc-item left");
		if(store.getTiddler(this.title)!=null){
			if(store.getTiddler(this.title).fields.tt_status == "Complete")
				var sectionClass = "completed"; 
		}else{
			var sectionClass = "";
		}
		var exists = (store.tiddlerExists(this.title)) ? "" : "sectionNotExist";
	    var sectionDiv = createTiddlyElement(li, "div", this.title+"_div", "sectionHeading toc-sort-handle "+sectionClass+" "+config.macros.TableOfContent.strip(this.title)+"_div "+exists);	
		sectionDiv.title = config.macros.TableOfContent.dragToolTip;
		sectionDiv.onclick = function() {
			if(config.options.chkOpenEditView == true)
				story.displayTiddler(this.id, this.id.replace("_div", ""), config.macros.TableOfContent.editTemplate ,null, null, null, null,this);
			else
				story.displayTiddler(this.id, this.id.replace("_div", ""), config.macros.TableOfContent.viewTemplate,null, null, null, null,this);
		}
		jQuery(sectionDiv).hover( 
                function() { 
	   				jQuery(this).children().css('opacity', '1');
                },  
                function() {                  
                 	jQuery(this).children().css('opacity', '0');
                } 
        );
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+this.title);
		var a = createTiddlyElement(sectionDiv, "a", null, 'button deleteButton', config.macros.TableOfContent.deleteText);    
		jQuery(a).css('opacity', '0');
		jQuery(a).click(function() {
			jQuery(this).parent().parent().fadeOut('slow', function() {
						jQuery(this).remove();
					    config.macros.TableOfContent.specChanged();
			});
			return false;
		})
		config.macros.TableOfContent._renderSpec(li, this.children, label);
	});
};

config.macros.TableOfContent.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	if(store.tiddlerExists(window.activeDocument)) {
		var spec = jQuery.parseJSON(store.getTiddlerText(window.activeDocument)).content;
	}
	var specView = createTiddlyElement(place, "div", "", "specView");	
	config.macros.TableOfContent.renderSpec(specView, spec);
}	


/***
!StyleSheet

#mainMenu {
    width:25%;
    margin-left:0.4%;
    margin-top:0.5em;
	text-align:left;
	color:#333;
}

#displayArea {
	margin-left:27%;
	width:73%;
}

#tiddlerDisplay {
	width:80%;
}

.current-nesting {
	background-color: yellow;
}
.helper {		
	border:2px dashed #777777;
}

.deleteHelper {
	background-color:#eee;
	font-weight:bold;
	border:1px solid red;
	color:#222;
}
.sectionHeading {
	width:100%;
}
.sort-handle-edit {
	border:1px solid #C7C7C7;
	background:white;
	padding:1em;
	margin-bottom:1em;
}
.sort-handle-edit .button {
	border:1px solid #C7C7C7;
	background:white !important;
	color:black !important;
}

html body li.draggableHover {
    color:[[ColorPalette::PrimaryDark]]; 
    background:[[ColorPalette::SecondaryLight]]; 
    border-color:[[ColorPalette::SecondaryMid]];
	cursor:move;
}

html body div.draggableChildHover {
	background:[[ColorPalette::SecondaryMid]];
	cursor:move;
}

li.toc-item {
	border:2px solid transparent;
	list-style:none;
}
html body #backstageShow {
	right:1em;
	display:none !important;
}

.secretBackstage {
	background:#E6E6E6;
}

a.secretBackstage {
	color:#E6E6E6;		
}
#backstageArea, #backstageArea a {
	background:#444444 none repeat scroll 0 0;
}

#backstageArea {
	border-bottom:1px solid #777;
}

div.subtitle {
	font-size:0.7em;
	padding:0.5em;
}

div.title {
	font-weight:none;
	padding:0em 0.5em 0 0.2em;
	color:#666;
}

#buttonHolder {
	font-size:0.9em;
	height:100%;
	left:-3em;
	position:relative;
	top:-0.7em;
}

html body .btn span span {
	background:#FFFFFF none repeat scroll 0 0;
	border-bottom:1px solid #BBBBBB;
	border-top:1px solid #CCCCCC;
	border-width:1px 0;
	color:#003366;
	padding:3px 0.4em;
	position:relative;
}

.completed {
	border-right : 10px solid #248A22;
}

.incomplete {
	border-right : 0px solid #d3bebe;
}

ul {
	margin:0em;
}

.specView {
	position:relative;
}

html body a.deleteButton {
	cursor:pointer;
	float:right;
	position:absolute;
	right:1em;
	border:0em;
	color:[[ColorPalette::Foreground]];
}

.specView h5.emptySpec {
	position:relative;
	left:4em;
}

.highlight {
	background-color:red;
}

.sectionNotExist {
	font-style:italic;
}

!(end of StyleSheet)


!EditSectionTemplate

<div class='toolbar' macro='toolbar [[ToolbarCommands::EditToolbar]]'></div>
<div  class='title' macro='droppableSection'></div>
<div class='taskControls' macro='tiddler TaskTiddlerControls'></div>
<div class='editor' macro='edit text'></div>

!(end of EditSectionTemplate)


***/


//}}}