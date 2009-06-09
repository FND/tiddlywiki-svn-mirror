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
  padding:3px 0;
  border-width:0;
  overflow:visible;
  font:100%/1.2 Arial,Sans-serif;
  text-decoration:none;
  color:#333;
  padding:2px;
  }
* html button.btn {
  padding-bottom:1px;
  }

.btn span {
  background:#aaa;
  z-index:1;
  margin:0;
  padding:3px 0;
  border-left:1px solid #ccc;
  border-right:1px solid #bbb;
  }
* html .btn span {
  padding-top:0;
  }
.btn span span {
  color:#fff;
  background:none;
  position:relative;
  padding:3px .4em;
  border-width:0;
  border-top:1px solid #ccc;
  border-bottom:1px solid #bbb;
  }
.btn b {
  background:#e3e3e3;
  position:absolute;
  z-index:2;
  bottom:0;
  left:0;
  width:100%;
  overflow:hidden;
  height:40%;
  border-top:3px solid #eee;
  }
* html .btn b {
  top:1px;
  }
.btn u {
  text-decoration:none;
  position:relative;
  z-index:3;
  }

.btn:hover span, .btn:hover span span {
  cursor:pointer;
  border-color:white!important;
  }

.primary {
  font-weight:bold;
  color:#000;
  }





****/
