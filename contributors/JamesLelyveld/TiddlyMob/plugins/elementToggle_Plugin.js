//{{{

// find containing element
//createTiddlyButton(parent,text,tooltip,action,className,id,accessKey,attribs)

config.macros.elementToggle = {};
config.macros.elementToggle.handler = function(place,macroName,params,wikifier,paramString,Tiddler)
{
	var params = paramString.parseParams("anon",null,true,false,false);
	var buttonName = getParam(params, 'name','info');
	var divClass = getParam(params, 'divClass','subtitle');
	var helpText = getParam(params,'helptext', 'info');
	var button = createTiddlyButton(place, buttonName, helpText, config.macros.elementToggle.onClick,'infoButton');
	button.setAttribute('divClass', divClass);
}


config.macros.elementToggle.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	var divClass = this.getAttribute('divClass');
	var curTiddler = story.findContainingTiddler(this);
	var curDiv = getElementsByClassName(divClass,"*",curTiddler)[0];
	if (curDiv.style.display && curDiv.style.display == 'block') {
		curDiv.style.display = 'none';
	}
	else{
		curDiv.style.display = 'block';
	}
	return false;
};

function getElementsByClassName(className, tag, elm){
	var testClass = new RegExp("(^|\\\\s)" + className + "(\\\\s|$)");
	var tag = tag || "*";
	var elm = elm || document;
	var elements = (tag == "*" && elm.all)? elm.all : elm.getElementsByTagName(tag);
	var returnElements = [];
	var current;
	var length = elements.length;
	for(var i=0; i<length; i++){
		current = elements[i];
		if(testClass.test(current.className)){
			returnElements.push(current);
		}
	}
	return returnElements;
}



//}}}
