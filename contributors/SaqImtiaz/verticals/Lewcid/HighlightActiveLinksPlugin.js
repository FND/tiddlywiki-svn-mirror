Story.prototype.refreshTiddler_activelink = Story.prototype.refreshTiddler;
Story.prototype.refreshTiddler = function (title,template,force)
{
      var theTiddler = Story.prototype.refreshTiddler_activelink.apply(this,arguments);
      if (!theTiddler)
          return theTiddler
    var menu = document.getElementById("topMenu");
    var links = menu.getElementsByTagName("a");
      for (var i=0; i<links.length; i++)
          {
          if (!links[i].getAttribute("tiddlyLink"))
              return;
          if (document.getElementById(this.idPrefix+(links[i].getAttribute("tiddlylink"))))
              addClass(links[i],"activebutton");
          else
              removeClass(links[i],"activebutton");
          }
      return theTiddler;
}