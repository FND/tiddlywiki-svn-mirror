/***
|''Name''|TracAdaptorPlugin|
|''Description''|Trac adaptor|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#TracAdaptorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|XMLRPCPlugin|
!Revision History
!!v0.1 (2008-10-12)
* initial release
!To Do
* move parsing into XML-RPC library
!Code
***/
//{{{
if(!version.extensions.TracAdaptor) {
version.extensions.TracAdaptor = { installed: true };

if(!config.extensions) { config.extensions = {}; }

config.extensions.TracAdaptor = {
	parseTicketList: function(xml) {
		var ticketNodes = xml.getElementsByTagName("int");
		var tickets = [];
		for(var i = 0; i < ticketNodes.length; i++) {
			var value = ticketNodes[i].textContent || ticketNodes[i].text; // XXX: use .childNodes[0].nodeValue?
			tickets.push(parseInt(value, 10));
		}
		return tickets;
	},

	parseTicket: function(xml) {
		var tiddler = new Tiddler();
		var getValue = config.extensions.XMLRPC.getNodeValue; // shortcut
		// basic fields
		var fields = xml.getElementsByTagName("int");
		tiddler.fields.ticketid = getValue(fields[0], "int");
		tiddler.title = "#" + tiddler.fields.ticketid;
		tiddler.created = getValue(fields[1], "int"); // TODO: needs date conversion
		tiddler.modified = getValue(fields[2], "int"); // TODO: needs date conversion
		// attributes -- TODO: comments!?
		fields = xml.getElementsByTagName("member");
		for(var i = 0; i < fields.length; i++) {
			var name = getValue(fields[i].getElementsByTagName("name")[0]);
			value = getValue(fields[i].getElementsByTagName("string")[0]); // XXX: always string?
			switch(name) {
				case "summary":
					tiddler.title += " " + value; // prefix is ticket ID
					break;
				case "reporter":
					tiddler.modifier = value;
					break;
				case "description":
					tiddler.text = value; // TODO: needs markup conversion
					break;
				default:
					tiddler.fields[name] = value;
					break;
			}
		}
		store.saveTiddler(tiddler.title, tiddler.title, tiddler.text,
			tiddler.modifier, tiddler.modified, tiddler.tags,
			tiddler.fields, false, tiddler.created); // XXX: move into adaptor
		return tiddler;
	}
};

} //# end of "install only once"
//}}}
