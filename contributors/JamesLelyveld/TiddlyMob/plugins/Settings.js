//{{{
config.options.chkHttpReadOnly = false;
config.options.txtRssTag = 'iTW';
config.options.chkGenerateAnRssFeed = false;
config.options. txtUploadBackupDir = "backup";
config.options. txtUploadLogMaxLine = 3;

showBackstage = false;

merge(config.views.wikified.tag,{
 labelNoTags: "",
 labelTags: ""});

//}}}
