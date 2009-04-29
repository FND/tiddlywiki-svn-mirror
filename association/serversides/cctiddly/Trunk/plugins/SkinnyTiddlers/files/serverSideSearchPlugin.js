config.macros.search.onKeyPress = function(e)
{
	displayMessage(this.value);
	params = {};
	params.search = this.value;
	var resp = doHttp("POST"," handle/search.php", "?instance=" + encodeURIComponent(workspace)+"&search="+encodeURIComponent(this.value),null,null,null,searchCallback);
}

function searchCallback(status,params,responseText,xhr)
{
	var title='SearchReport';
	var body="\n";
	body+="The JSON string returned from the server was : "+responseText;

	// create/update the tiddler
	var tiddler=store.getTiddler(title); if (!tiddler) tiddler=new Tiddler();	
	tiddler.set (title,body,config.options.txtUserName,(new Date()),"excludeLists excludeSearch temporary");
	store.addTiddler(tiddler); story.closeTiddler(title);

	// use alternate "search again" label in <<search>> macro
	var oldprompt=config.macros.search.label;
	config.macros.search.label="search again";

	// render/refresh tiddler
	story.displayTiddler(null,title,1);
	store.notify(title,true);

	// restore standard search label
	config.macros.search.label=oldprompt;
	var json = eval('(' + responseText + ')');

	// Loop through the objects returned by JSON
	for(_obj in json)
	{
		story.displayTiddler(null,json[_obj],1);
	}
}
