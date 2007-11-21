SendSMS = {};

SendSMS.UI = function(place,sendee){
	// Some code to insert the appropriate styles into StyleSheet tiddler
	var cssText = "div.feedSelector {border-width:0px; border:0; padding:5px;} \n" +
                  "div.feedSelector TABLE {border-width:0px; border:0; } \n" +
		          "div.feedSelector SELECT {width:300px;} \n" +
		          "div.feedSelector INPUT.Text {width:300px;} \n" +
		          "div.feedSelector INPUT.Button {width:100px;}";

	//store.saveTiddler("StyleSheet","StyleSheet", cssText);
	setStylesheet(cssText);

	var feedSelector = createTiddlyElement(place,"div",null,"feedSelector");
	var feedTable = createTiddlyElement(createTiddlyElement(feedSelector,"table"),"tbody");

	var feedTR = createTiddlyElement(feedTable,"tr");
	var feedTD = createTiddlyElement(feedTR,"td");
    createTiddlyText(feedTD, "Enter Message Text: ");

    var feedTD = createTiddlyElement(feedTR,"td");
	var txtSMSText = createTiddlyElement(feedTD,"textarea");
	txtSMSText.setAttribute("width","300px");
	txtSMSText.setAttribute("name","txtSMSText");
	txtSMSText.setAttribute("id","txtSMSText");
	txtSMSText.setAttribute("rows","4");

	var feedTR = createTiddlyElement(feedTable,"tr");
	var feedTD = createTiddlyElement(feedTR,"td");
    createTiddlyText(feedTD, "Enter Recipient Phone Number: ");

    var feedTD = createTiddlyElement(feedTR,"td");
	var txtPhoneNo = createTiddlyElement(feedTD,"input");
	txtPhoneNo.setAttribute("type","text");
	txtPhoneNo.setAttribute("name","txtPhoneNo");
	txtPhoneNo.setAttribute("id","txtPhoneNo");
	txtPhoneNo.setAttribute("value",sendee);

	var feedTR = createTiddlyElement(feedTable,"tr");
	var feedTD = createTiddlyElement(feedTR,"td");
	feedTD.setAttribute("colspan","2");
	feedTD.setAttribute("align","center");

	var butSend = createTiddlyElement(feedTD,"input");
	butSend.setAttribute("type","button");
	butSend.setAttribute("name","butSend");
	butSend.setAttribute("value", "Send Message");
	butSend.setAttribute("onclick","config.macros.mojo.sendSMS(this.parentNode.parentNode.previousSibling.firstChild.childNodes[1].firstChild.value);");
	var butClose = createTiddlyElement(feedTD,"input");
	butClose.setAttribute("type","button");
	butClose.setAttribute("name","butClose");
	butClose.setAttribute("value", "Close");
	butClose.setAttribute("onclick","Popup2.closeClick();");
};

//--
//-- Popup2 menu
//--

var Popup2 = {
	stack: [] // Array of objects with members root: and popup:
	};

Popup2.create = function(root,elem,theClass)
{
	Popup2.remove();
	var popup = createTiddlyElement(document.body,elem ? elem : "ol","popup",theClass ? theClass : "popup");
	Popup2.stack.push({root: root, popup: popup});
	return popup;
};

Popup2.closeClick = function(ev)
{
	var e = ev ? ev : window.event;
	Popup2.remove();
	/* if(e.eventPhase == undefined)
		Popup2.remove();
	else if(e.eventPhase == Event.BUBBLING_PHASE || e.eventPhase == Event.AT_TARGET)
		Popup2.remove();
	return true; */
	return true;
};

Popup2.show = function(unused1,unused2)
{
	var curr = Popup2.stack[Popup2.stack.length-1];
	this.place(curr.root,curr.popup);
	addClass(curr.root,"highlight");
	if(config.options.chkAnimate && anim && typeof Scroller == "function")
		anim.startAnimating(new Scroller(curr.popup));
	else
		window.scrollTo(0,ensureVisible(curr.popup));
};

Popup2.place = function(root,popup,offset)
{
	if(!offset) var offset = {x:0, y:0};
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
};

Popup2.remove = function()
{
	if(Popup2.stack.length > 0) {
		Popup2.removeFrom(0);
	}
};

Popup2.removeFrom = function(from)
{
	for(var t=Popup2.stack.length-1; t>=from; t--) {
		var p = Popup2.stack[t];
		removeClass(p.root,"highlight");
		removeNode(p.popup);
	}
	Popup2.stack = Popup2.stack.slice(0,from);
};
