/***
|''Name:''|RecentPlugin|
|''Source:''|  |
|''Author:''|Tim Morgan (modified by Bram Chen)|
|''Desc:''|Shows DefaultTiddlers + most recently modified tiddlers as default when any TiddlyWiki or adaptation is first loaded.|
|  |copy this tiddler's contents to a new tiddler on your site and tag it "systemConfig".|
''Syntax:'' {{{}}}

''Revision history:''
* v0.1.0 (Mar 13, 2006) modified by Bram Chen.
***/
// //''Code section:''
//{{{
var num = 15;
var ignore_tags = ['systemConfig', 'systemTiddlers'];
var CPlingo = config.CommentPlugin.CPlingo;
function in_array(item, arr){for(var i=0;i<arr.length;i++)if(item==arr[i])return true};
function get_parent(tiddler){while(tiddler && in_array(CPlingo.comments, tiddler.tags)) tiddler=store.fetchTiddler(tiddler.tags[0]);return tiddler};
function unique_list(list){var l=[];for(i=0;i<list.length;i++)if(!in_array(list[i], l))l.push(list[i]);return l};
function get_recent_tiddlers(){
  var tiddlers = store.getTiddlers('modified');
  var names = store.getTiddlerText("DefaultTiddlers").readBracketedList();
  var ignore_tiddlers = [];
  for(var i=0; i<ignore_tags.length; i++)
    ignore_tiddlers=ignore_tiddlers.concat(store.getTaggedTiddlers(ignore_tags[i]));
  for(var i=tiddlers.length-1; i>=0; i--) {
    if(in_array(CPlingo.comments, tiddlers[i].tags)) {
      var t = get_parent(tiddlers[i]);
      if(t)names.push(t.title)
    }
    else if(!in_array(tiddlers[i], ignore_tiddlers))
      names.push(tiddlers[i].title);
  }
  return unique_list(names).slice(0, num);
}
var names = get_recent_tiddlers();
_restart = restart
restart = function() {
  if(window.location.hash) _restart();
  else story.displayTiddlers(null,names);
}
//}}}