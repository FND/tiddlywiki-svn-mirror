var testSpec = {title:'Creation', children:
					[{title:'Growth', children: 
						[{title:'Language', children: []}]
					 },
					 {title:'Mowth', children: []},
					 {title:'Jowth', children: []}
					]
				}
			 

//tdoc2Outline //

//{{{
config.macros.tdoc2Outline={};

config.macros.tdoc2Outline.editClick=function(){
	story.displayTiddler(null, this.parentNode.id.replace("HeadingView", ""));
}

config.macros.tdoc2Outline.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.tdoc2Outline.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.options.txtOpenType = "inline";
	config.macros.tdoc2Outline.refresh(place,macroName,params,wikifier,paramString,tiddler);
};



config.macros.tdoc2Outline.renderSpec = function(place, spec) {
	var ul = createTiddlyElement(place, "ul", "ul"+(window.ulCount++), "page-list");
   	var li = createTiddlyElement(ul, "li", "li"+window.liCount++, "clear-element page-item1 left");
	var sectionDiv = createTiddlyElement(li, "div", "div"+window.divCount++, "sort-handle");	
	var heading = createTiddlyElement(sectionDiv, "div",  config.macros.tdoc2Outline.strip(spec.title)+"HeadingView", "sectionHeading");		
	createTiddlyText(heading, spec.title);
	$.each(spec.children, function() {
		config.macros.tdoc2Outline.renderSpec(li, this);
	});
	
}

config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	window.ulCount=0;
	window.liCount=0;
	window.divCount=0;
	config.macros.tdoc2Outline.renderSpec(place, testSpec);
	
	
		$("#ul0").NestedSortable({
			accept: 'page-item1',
					helperclass: 'helper',
			handle: '.sort-handle ',
			onChange: function(serialized) {
				console.log(serialized, this)
			}
		});
		$(".sectionHeading").hover(
			function() {
				$(this).addClass("draggableOn");
			}, 
			function() {
				
					console.log(this);
				$(this).removeClass("draggableOn");
				$("#sortHelper").remove();
			}
		);
}	

//}}}

function log() { if (console) console.log.apply(console, arguments); };

//}}}