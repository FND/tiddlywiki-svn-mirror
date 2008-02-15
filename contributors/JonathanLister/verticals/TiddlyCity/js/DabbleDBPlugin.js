/***
|''Name:''|DabbleDBPlugin|
|''Description:''|Plugin to upload content to DabbleDB|
|''Author''|Jon Lister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Pseudo-code:
{{{
DabbleDB.getSchema:


DabbleDB.Upload:
}}}

***/

//{{{
if(!version.extensions.DabbleDBPlugin) {
version.extensions.DabbleDBPlugin = {installed:true};

function DabbleDB() {}


} //# end of 'install only once'
//}}}