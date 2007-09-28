{{{

//  Overide displayTiddler function to also Google Analytics urchin.

var TiddlyLock = {};
TiddlyLock.displayTiddler = story.displayTiddler;
story.displayTiddler = function(srcElement,titles,template,unused1,unused2,animate,unused3)
{
	if(urchinTracker && urchinTracker != 'undefined') urchinTracker('/' + titles);
	TiddlyLock.displayTiddler.apply(this,arguments);
}

}}}