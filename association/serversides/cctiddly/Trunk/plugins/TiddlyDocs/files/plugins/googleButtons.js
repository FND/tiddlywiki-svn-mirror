/*

Taken from this blog post : 

http://stopdesign.com/archive/2009/02/04/recreating-the-button.html

*/
function createTiddlyButton(parent,text,tooltip,action,className,id,accessKey,attribs,image)
{
	var btn = document.createElement("a");
	if(action) {
		btn.onclick = action;
		btn.setAttribute("href","javascript:;");
	}
	if(tooltip)
		btn.setAttribute("title",tooltip);
	if(text){
		var span = createTiddlyElement(btn, "span");
		var span = createTiddlyElement(span, "span");
		if(image) {
			var img = createTiddlyElement(span, "img");
			img.style.width = "15px";
			img.style.height="15px";
			img.src = image;
			img.style.position = "relative";
			img.style.top = "0.3em";
		}
		span.appendChild(document.createTextNode(text));
	}
	btn.className = className || "btn";

	if(id)
		btn.id = id;
	if(attribs) {
		for(var i in attribs) {
			btn.setAttribute(i,attribs[i]);
		}
	}
	if(parent)
		parent.appendChild(btn);
	if(accessKey)
		btn.setAttribute("accessKey",accessKey);
	return btn;
}

config.shadowTiddlers.StyleSheetGoogleButton = store.getTiddlerText(tiddler.title + "##StyleSheet");
store.addNotification("StyleSheetGoogleButton", refreshStyles);

/***
!StyleSheet

.btn {
	display:inline-block;
	background:none;
	margin:0;
	padding:3px;
	border-width:0;
	overflow:visible;
	font:100%/1.2 Arial,Sans-serif;
	text-decoration:none;
	color:#333;
}

* html button.btn {
	padding-bottom:1px;
}

html:not([lang*=""]) button.btn {
	margin:0 -3px;
}

.btn span {
	background:#aaa url(img/bg-button.gif) repeat-x 0 0;
	margin:0;
	padding:3px 0;
}

.btn span:hover {
	background:#fff;
	color:#777;
}

* html .btn span {
	padding-top:0;
}

.btn span span {
	position:relative;
	padding:1.5px .3em;
	border-width:0;
	color:#fff;
	
font-size:100%;	
	font-family:Arial Black,Arial,Helvetica,sans-serif;
	font-weight:bold;

	height:auto !important;
	letter-spacing:-0.1px;
	line-height:14px;
	text-decoration:none;
	text-transform:uppercase;
}



.btn:focus, .btn:active {
	outline:none; 
	background:white;
}

.primary {
	font-weight:bold;
	color:#000;
}

****/
