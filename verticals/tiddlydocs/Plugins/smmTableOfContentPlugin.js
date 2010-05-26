config.macros.smmTableOfContent = merge(config.macros.smmNestedSortable, {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		 setStylesheet(store.getTiddlerText("smmTableOfContentPlugin##StyleSheet"), "smmTableOfContentPlugin");
		this.refresh(place,macroName,params,wikifier,paramString,tiddler);
	},
	renderItem: function(item, ul, label) {
		var li = createTiddlyElement(ul, "li", item.title, "toc-item");
		if(store.getTiddler(item.title)!=null){
			if(store.getTiddler(item.title).fields.tt_status == "Complete")
				var sectionClass = "completed"; 
		}else{
			var sectionClass = "";
		}
		var exists = (store.tiddlerExists(item.title)) ? "" : "sectionNotExist";

	    var sectionDiv = createTiddlyElement(li, "div", item.title+"_div", "sectionHeading toc-sort-handle "+sectionClass+" "+config.macros.TableOfContent.strip(item.title)+"_div "+exists);	
		sectionDiv.title = config.macros.TableOfContent.dragToolTip;
		sectionDiv.onclick = function() {
			if(config.options.chkOpenEditView == true)
				story.displayTiddler(this.id, this.id.replace("_div", ""), config.macros.TableOfContent.editTemplate ,null, null, null, null,this);
			else
				story.displayTiddler(this.id, this.id.replace("_div", ""), config.macros.TableOfContent.viewTemplate,null, null, null, null,this);
		};		
		jQuery(sectionDiv).hover( 
			function() { 
				jQuery(item).children().css('opacity', '1');
			},  
			function() {                  
				jQuery(item).children().css('opacity', '0');
			} 
        );
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+item.title);
		var a = createTiddlyElement(sectionDiv, "a", null, 'button deleteButton', config.macros.TableOfContent.deleteText);    
		jQuery(a).css('opacity', '0');
		jQuery(a).click(function() {
			jQuery(item).parent().parent().fadeOut('fast', function() {
				jQuery(item).remove();
				config.macros.TableOfContent.specChanged();
			});
			return false;
		})
		return li;
	},	
});



/***
!StyleSheet


.specView li {
	list-style:none;
}

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










.sortable li {
	cursor:move;
	background:#eee;
	border:2px solid #eee;
	list-style:none;
}



.ui-sortable li:hover {
	background:#ddd;
	border:2px solid #eee;
	list-style:none;
}


html body li.placeholder {
	border:1px solid red important;
background:red !important;
	opacity:0.2;
	min-height:1.4em;
	height:auto;
}

.placeholder  li {
	border:1px solid #333;
	
}
 li {
	list-style:none;
}


!(end of StyleSheet)








***/