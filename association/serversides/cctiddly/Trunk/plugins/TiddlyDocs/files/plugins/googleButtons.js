/// HACK TO ROUND OF THE EDGES OF EACH BUTTON
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