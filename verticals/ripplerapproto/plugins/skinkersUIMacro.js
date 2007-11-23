config.macros.skinkersUI = {};

config.macros.skinkersUI.handler = function(place,sendee) {
	var feedSelector = createTiddlyElement(place,"div",null,"feedSelector");
	var feedTable = createTiddlyElement(createTiddlyElement(feedSelector,"table"),"tbody");

	var feedTR = createTiddlyElement(feedTable,"tr");
	var feedTD = createTiddlyElement(feedTR,"td");
    createTiddlyText(feedTD, "Title: ");

    var feedTD = createTiddlyElement(feedTR,"td");
	var txtPhoneNo = createTiddlyElement(feedTD,"input");
	txtPhoneNo.setAttribute("type","text");
	txtPhoneNo.setAttribute("name","txtPhoneNo");
	txtPhoneNo.setAttribute("id","txtPhoneNo");
	txtPhoneNo.setAttribute("value","We're going to RippleRap");
	
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
	feedTD.setAttribute("colspan","2");
	feedTD.setAttribute("align","center");

	var butSend = createTiddlyElement(feedTD,"input");
	butSend.setAttribute("type","button");
	butSend.setAttribute("name","butSend");
	butSend.setAttribute("value", "Send Message");
	butSend.setAttribute("onclick","config.macros.skinkersAlert.alert(this.parentNode.parentNode.previousSibling.previousSibling.childNodes[1].firstChild.value,this.parentNode.parentNode.previousSibling.childNodes[1].firstChild.value);");
	// DEBUG: butSend.setAttribute("onclick","console.log(this.parentNode.parentNode.previousSibling.previousSibling.childNodes[1].firstChild.value);console.log(this.parentNode.parentNode.previousSibling.childNodes[1].firstChild.value);");
	// butSend.setAttribute("onclick","config.macros.mojo.sendSMS(this.parentNode.parentNode.previousSibling.childNodes[1].firstChild.value,this.parentNode.parentNode.previousSibling.previousSibling.childNodes[1].firstChild.value);");
};