/***
This is a simple patch to TW that gives the first tiddler a class of ~IEFirstChild since IE 6 can't use the psuedo class 'first-child' for CSS selection. That is necessary for proper page-break printing.

The closeTiddler part is a little trickier because it has to factor in DOM changes due to animation.

''Version 1.1''
***/

//{{{
Story.prototype.closeTiddlerIEFirstChild = Story.prototype.closeTiddler;
Story.prototype.closeTiddler = function(title,animate,slowly){
 var storyArea = document.getElementById(this.idPrefix + title).parentNode;
 if ((this.idPrefix + title) == storyArea.firstChild.id){
 removeClass(storyArea.firstChild,"IEFirstChild");
 if (storyArea.firstChild.nextSibling) addClass(storyArea.firstChild.nextSibling,"IEFirstChild");
 }
 story.closeTiddlerIEFirstChild(title,animate,slowly);
 if (storyArea.firstChild) addClass(storyArea.firstChild,"IEFirstChild");
}

Story.prototype.displayTiddlerIEFirstChild = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly){
 var storyArea = document.getElementById(this.container);
 if (storyArea.firstChild) removeClass(storyArea.firstChild,"IEFirstChild");
 story.displayTiddlerIEFirstChild(srcElement,title,template,animate,slowly);
 addClass(storyArea.firstChild,"IEFirstChild");
}
//}}}