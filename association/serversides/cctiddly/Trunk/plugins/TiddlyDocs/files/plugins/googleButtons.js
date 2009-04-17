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
			img.style.width = "10px";
			img.style.height="10px";
			img.src = image;
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
	background:#eee url(img/bg-button.gif) repeat-x 0 0;
	margin:0;
	padding:3px 0;
	border-left:1px solid #333;
	border-right:1px solid #444;
}

* html .btn span {
	padding-top:0;
}

.btn span span {
	position:relative;
	padding:3px .4em;
	border-width:0;
	border-top:1px solid #333;
	border-bottom:1px solid #444;
	color:black;
}

.btn:focus, .btn:active {
	outline:none; 
}

.primary {
	font-weight:bold;
	color:#000;
}

****/
