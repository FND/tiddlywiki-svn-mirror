if(typeof zw == "undefined") var zw = {};
zw.loggedIn = <dtml-var "('Authenticated' in REQUEST.AUTHENTICATED_USER.getRoles()) and 'true' or 'false'">;
zw.anonEdit = <dtml-var "getattr(_, 'zw_anon_edit', None) and 'true' or 'false'">;
zw.isAdmin = <dtml-var "('Manager' in REQUEST.AUTHENTICATED_USER.getRoles()) and 'true' or 'false'">;
zw.latestTiddler = <dtml-var "REQUEST.PARENTS[0].ZiddlyWiki.actions.get_timestamp(root=REQUEST.PARENTS[0])">;
zw.username = '<dtml-var "REQUEST.AUTHENTICATED_USER.getUserName()">';
config.options.txtUserName = '<dtml-var "REQUEST.AUTHENTICATED_USER.getUserName()">';
version.extensions.ZiddlyWiki = '<dtml-var "REQUEST.PARENTS[0].ZiddlyWiki.version">';
zw.tiddlerList = {
<dtml-try><dtml-in expr="REQUEST.PARENTS[0].tiddlers.objectValues(['DTML Document', 'File'])" skip_unauthorized prefix="tiddler"><dtml-call "REQUEST.set('break',0)"><dtml-try><dtml-if "_.string.split(tiddler_item.tags).index('deleted')"><dtml-call "REQUEST.set('break',1)"></dtml-if><dtml-except><dtml-try><dtml-unless "REQUEST['break']"><dtml-in "tiddler_item.manage_change_history()" prefix="hist"><dtml-unless "REQUEST['break']"><dtml-unless "hasattr(tiddler_item.HistoricalRevisions[hist_item['key']],'ignore_revision')">
"<dtml-var "tiddler_item.title" html_quote>": "<dtml-var "hist_item['key']">",
<dtml-call "REQUEST.set('break',1)"></dtml-unless></dtml-unless></dtml-in></dtml-unless><dtml-except>"Unauthorized to list tiddler": "<dtml-var "tiddler_item.title">",</dtml-try></dtml-try></dtml-in><dtml-except>"Unauthorized to list tiddlers": 1</dtml-try>
};
