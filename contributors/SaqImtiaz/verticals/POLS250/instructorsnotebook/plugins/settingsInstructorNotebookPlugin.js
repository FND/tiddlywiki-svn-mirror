config.defaultCustomFields['wikiformat'] = 'wikispaces';
config.defaultCustomFields['server.locked'] = 'true';

merge(config.commands.saveTiddler,{
	text: "enter",
	tooltip: "finish editing this page"});
	
setStylesheet("#mysidebar #sidebarOptions .bigbutton .button {padding:0.2em 0.3em; font-size:120%; font-weight:bold; border:1px solid #000; display:block; background-color:#0044BB; color:#fff; margin-bottom:0.2em;} #mysidebar #sidebarOptions .bigbutton br {display:none;}","savebuttonStyles");

config.macros.notes.defaultFields = {
	wikiformat : 'wikispaces'
};
