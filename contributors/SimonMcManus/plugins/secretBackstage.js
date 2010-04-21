/***
|''Name''|secretBackstage|
|''Authors''|Simon McManus|
|''Version''|0.2|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/SimonMcManus/plugins/secretBackstage.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|

!Description

Provides a link to the backstage. 

!Usage
{{{
<<secretBackstage>>
}}}


!History 
0.1 - initial release.
0.2 - removed shift and alt key detection as it did not work in IE. 

!Code
***/

//{{{
	
config.macros.secretBackstage = {
	linkText:"****"
};
config.macros.secretBackstage.handler = function(place,macroName,params)
{
	createTiddlyButton(place,config.macros.secretBackstage.linkText,null,function(e) {
		backstage.show();
		return false;
	}, 'secretBackstage');
};

//}}}