/***
|''Name:''|AdvancedEditTemplatePlugin based on ValueSwitcherPlugin|
|''Description:''|Gather values from a definition tiddler, and present the user with a UI for setting a value from those available options as an extende field |
|''Version:''|0.4|
|''Date:''|02 March 2009|
|''Source:''|http://www.jonrobson.me.uk|
|''Author:''|Jon Robson : based on the work by PhilHawksworth (phawksworth (at) gmail (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.3|

Allows the adding of multiple level drop down menus and checkboxes to the edit template.
***/

//{{{
// Ensure that this Plugin is only installed once.

// create macro object
(function($) { // set up alias

