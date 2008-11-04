/***
|''Name''|TiddlyTagMindMap|
|''Description''|Bring your tiddlers to life in a radial graph which displays all your tiddlywiki tiddlers and the relationships between them. (A bit like The Brain)|
|''Icon''|<...>|
|''Author''|Jon Robson|
|''Contributors''|Nicolas Garcia Belmonte|
|''Version''|1.3|
|''Date''|22 Oct 2008|
|''Status''|@@experimental@@;|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''Copyright''|<...>|
|''License''|<...>|
|''CoreVersion''|<...>|
|''Requires''|<...>|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|data visualisation, mindmap, The Brain, Mind Manager, FreeMind,tag relationships,graph|
!Description
Bring your TiddlyWiki to life!
!Notes
To install you will need to paste a line of text into your Theme {{{ <div id="tagmindmap"></div>}}} in the location where you would like to see the visualisation.

Currently we are unable to support this working in internet explorer.. we are working on it however.. sorry! :(
!Usage
{{{
The tagmindmap can be created from a macro call using <<tiddlytagmindmap //params//>>
alternatively paste <div id='tagmindmap'></div> into your page template.

The following macros may be useful however they can be included in the toolbar settings of the tiddlytagmindmap macro.
<<ToggleTagMindMap>> (toggle graph on/off)
<<LoadMindMap>> (load all nodes into mind map)
<<ZoomMindMapIn>> (zoom into the map (expand the structure as if it was a balloon))
<<ZoomMindMapOut>> (zoom out of the map (let air out of the structure as if it was a balloon))

There are a variety of configuration options in the backstage area under tweak. They all begin with TiddlyTagMindMapPlugin: 
}}}
!!Parameters
tiddlytagmindmap takes several (but all optional) parameters. Some examples can be seen below, note the order is irrelevant of these parameters.

!!!Height and Width
{{{<<tiddlytagmindmap height:100 width:100>>}}} will set a tiddlytagmindmap with height and width 100.

!!!The toolbar
A parameter toolbarSettings is a string of 1s. These signify the buttons. The first digit sets whether the bar should appear vertically or horizontally.
The following digits turn off or on the other available buttons.
!!!!The buttons
toggle, loadall,zoom+,zoom-,re-center (re-center after panning the map)

The default is 01111
{{{<<tiddlytagmindmap toolbarSettings:1101>>}}} would give you a vertical toolbar with toggle and load buttons but no zoom.

!!!The Start State
A parameter can be used to specify how the map looks on start up. 
Currently the options are empty OR all.
{{{<<tiddlytagmindmap startState:empty>>}}} loads a blank tag mind map however {{{<<tiddlytagmindmap startState:all>>}}} loads all nodes excluding those in the exclude List.
It defaults to displaying all defaultTiddlers in the map
!!Examples
See usage hopefully self explanatory.
!Configuration Options
<...>
!Revision History
Coming soon..
*Integration with TagClouds
*Ability to set meta-data on nodes (eg. colouring)
*Working version in IE
!To Do
<...>
!Code
***/
