<dtml-call "REQUEST.RESPONSE.setHeader('Content-Type', 'text/javascript')">
if(typeof zw == "undefined") var zw = {};
zw.loggedIn = <dtml-var "('Authenticated' in REQUEST.AUTHENTICATED_USER.getRoles()) and 'true' or 'false'">;
zw.anonEdit = <dtml-var "getattr(_, 'zw_anon_edit', None) and 'true' or 'false'">;
zw.ziddlyPath = '<dtml-var "REQUEST.URL">';
zw.isAdmin = <dtml-var "('Manager' in REQUEST.AUTHENTICATED_USER.getRoles()) and 'true' or 'false'">;
zw.latestTiddler = <dtml-var "REQUEST.PARENTS[0].ZiddlyWiki.actions.get_timestamp(root=REQUEST.PARENTS[0])">;
zw.username = '<dtml-var "REQUEST.AUTHENTICATED_USER.getUserName()">';
config.options.txtUserName = '<dtml-var "REQUEST.AUTHENTICATED_USER.getUserName()">';
version.extensions.ZiddlyWiki = '<dtml-var "REQUEST.PARENTS[0].ZiddlyWiki.version">';
zw.tiddlerList = {
<dtml-try>
<dtml-in expr="REQUEST.PARENTS[0].tiddlers.objectValues(['DTML Document', 'File'])" skip_unauthorized>
<dtml-try>
    <dtml-if "_.string.split(tags).index('deleted')"></dtml-if>
<dtml-except>
<dtml-try>
    "<dtml-var "title">": "<dtml-var "manage_change_history()[0]['key']">",
<dtml-except>
    "Unauthorized to list tiddler": 1,
</dtml-try>
</dtml-try>
</dtml-in>
<dtml-except>
"Unauthorized to list tiddlers": 1
</dtml-try>
};
