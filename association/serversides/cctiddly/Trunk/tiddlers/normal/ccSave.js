/***
|''Name''|ccSave|
|''Description''|Currently only being used to stop the upgrade option |
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|1.0.1|
|''Date''|12/05/2008|

!Code

***/
//{{{

// GENERAL ccTiddly Bits 

config.backstageTasks.remove("upgrade");
config.backstageTasks.remove("save");

//}}}