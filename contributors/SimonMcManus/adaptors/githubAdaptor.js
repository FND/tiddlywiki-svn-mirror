/***
|''Name''|flickrAdaptor|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|0.1|

!Code

***/
//{{{
	
function githubAdaptor(){}
	
githubAdaptor.prototype = new AdaptorBase();
githubAdaptor.mimeType = 'application/json';
githubAdaptor.serverType = 'github';


githubAdaptor.prototype.getWorkspaceList = function(context,userParams,callback){
jQuery(document).append('<script src="http://github.com/simonmcmanus.json?callback=githubAdaptor.getWorkspaceListCallback"></script>');
};

githubAdaptor.getWorkspaceListCallback = function(data){
	for (var i=0; i < data.length; i++) {
			fields = {};
			fields["original_server.type"] = "github";
			fields["url"] = "";
			fields["user_img"] = "";
			created = new Date(data[i].created_at);
			fields["prettyDate"] = humane_date(created);
			
			
			var title = data[i].type+" "+data[i].repository.name+" at "+data[i].created_at;
			var items = data[i].payload.shas;
			if(items!=undefined){
				var html = [];

				html.push("<html><ul>");

				for(var j=0; j<items.length; j++)
				{
//					console.log(data[i].repository.url+"/commit/"+items[j][0]);
						html.push("<li><a href='"+data[i].repository.url+"/commit/"+items[j][0]+"' target='new_window'>"+items[j][3]+" "+items[j][2]+"</a><br/></li>");
				}

				html.push("</ul></html>");

				var text = html.join('');
			}else{
				var text = "";
			}
			var tiddler = new Tiddler(title);
			tiddler.set(title,text,"modifier",created,"",created,fields);
			store.addTiddler(tiddler);
			store.saveTiddler(title, title, text, "ccTiddly", created, "lifestream", fields);					
			window.refreshDisplay();
//		console.log(data[i].actor, data[i].type, data[i].repository.name, "at", data[i].created_at);
	//	console.log(data[i].payload.shas);


	}			
	
};
config.adaptors[githubAdaptor.serverType] =githubAdaptor;