/***
|''Name''|activeDocumentPlugin|
|''Description''|outputs the current active document|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

outputs the current active document

!Usage
{{{

<<activeDocumentPlugin>>

}}}

!Code
***/

//{{{

config.macros.activeDocument = {
	'noActiveDocument':'No Active Document'
};
config.macros.activeDocument.handler = function() {
	if(window.activeDocument)
		createTiddlyText(place, window.activeDocument);
	else
		createTiddlyText(place, config.macros.activeDocument.noActiveDocument);
}

//}}}