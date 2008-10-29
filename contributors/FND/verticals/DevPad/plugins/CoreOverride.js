//{{{
//--
//-- Popup menu (improvements to be included in the core)
//--

var Popup = {
	stack: [] // Array of objects with members root: and popup:
	};

Popup.create = function(root,elem,theClass)
{
	var stackPosition = this.findStackPosition(root,"popup");
	Popup.remove(stackPosition+1);
	var popup = createTiddlyElement(document.body,elem ? elem : "ol","popup",theClass ? theClass : "popup");
	popup.stackPosition = stackPosition;
	Popup.stack.push({root: root, popup: popup});
	return popup;
};

Popup.onDocumentClick = function(e)
{
	if (!e) var e = window.event;
	var target = resolveTarget(e);
	if(e.eventPhase == undefined)
		Popup.remove();
	else if(e.eventPhase == Event.BUBBLING_PHASE || e.eventPhase == Event.AT_TARGET)
		Popup.remove();
	return true;
};

Popup.show = function(offset,unused1,unused2)
{
	var curr = Popup.stack[Popup.stack.length-1];
	this.place(curr.root,curr.popup,offset);
	addClass(curr.root,"highlight");
	if(config.options.chkAnimate && anim && typeof Scroller == "function")
		anim.startAnimating(new Scroller(curr.popup));
	else
		window.scrollTo(0,ensureVisible(curr.popup));
};

Popup.place = function(root,popup,offset)
{
	if(!offset) var offset = {x:0, y:0};
	if (popup.stackPosition>=0){
		offset.x = offset.x + 15;
		}
	var rootLeft = findPosX(root);
	var rootTop = findPosY(root);
	var rootHeight = root.offsetHeight;
	var popupLeft = rootLeft + offset.x;
	var popupTop = rootTop + rootHeight + offset.y;
	var winWidth = findWindowWidth();
	if(popup.offsetWidth > winWidth*0.75)
		popup.style.width = winWidth*0.75 + "px";
	var popupWidth = popup.offsetWidth;
	if(popupLeft + popupWidth > winWidth)
		popupLeft = winWidth - popupWidth;
	popup.style.left = popupLeft + "px";
	popup.style.top = popupTop + "px";
	popup.style.display = "block";
}

Popup.findStackPosition = function(item,node)
{
	var pointer = -1;
	for (var i=this.stack.length-1; i> -1; i--){
		if(isDescendant(item,this.stack[i][node])){
			pointer = i; 
		}
	}
	return pointer;
};

Popup.remove = function(pos)
{
	if (!pos) var pos = 0;
	if(Popup.stack.length > pos) {
		Popup.removeFrom(pos);
	}
};

Popup.removeFrom = function(from)
{
	for(var t=Popup.stack.length-1; t>=from; t--) {
		var p = Popup.stack[t];
		removeClass(p.root,"highlight");
		removeNode(p.popup);
	}
	Popup.stack = Popup.stack.slice(0,from);
};
//}}}