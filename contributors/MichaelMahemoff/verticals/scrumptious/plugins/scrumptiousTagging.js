(function($) {

  config.macros.scrumptiousTagTitle = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $("<div class='tagTitle'/>").html(tiddler.title.substr(5)).appendTo(place);
    }
  }

  config.macros.scrumptiousTagging = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var tagName = tiddler.title;
      if (tagName.substr(0,5)!="user_") return;
      tagName = tagName.substr(5);
      var $tagging = $("<div/>").appendTo(place);
      showTiddlersInCategory("bookmark", "user_"+tagName, "bookmarks", $tagging);
      showTiddlersInCategory("trail", "user_"+tagName, "trails", $tagging);
    }
  };

  function showTiddlersInCategory(categoryTag, userTag, pluralLabel, $tagging) {
    console.log("-----", userTag,store.getTaggedTiddlers(userTag));
    var tiddlersInCategory = _.filter(store.getTaggedTiddlers(userTag), function(tiddler) {
      return tiddler.isTagged(categoryTag);
    });
    console.log(tiddlersInCategory);
    if (!tiddlersInCategory.length) return;
    $tagging.append("<div class='taggingIntro'><span class='tag'>" + userTag.substr(5) + "</span> <span class='tagCategory'>" + pluralLabel + "</span></div>");
    var $tagGroup = $("<div class='tagGroup' />").appendTo($tagging);
    $.each(tiddlersInCategory, function(i,tiddler) {
      $link = $("<span class='"+categoryTag+"Link' />").appendTo($tagGroup);
      createTiddlyLink($link.get(0), tiddler.title, true);
    });
  }


  var _chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
  Story.prototype.chooseTemplateForTiddler = function(title,template) {
    //console.log("choose", arguments);
    if (title.substr(0,5)=="user_") return "userTagViewTemplate";
    //console.log("returning");
    return _chooseTemplateForTiddler.apply(this, arguments);
  }

})(jQuery);
