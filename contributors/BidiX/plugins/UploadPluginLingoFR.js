/***
|''Name:''|UploadPluginLingoFR|
|''Description:''|French Translation|
|''Version:''|4.0.0|
|''Date:''|Mar 2, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#UploadPluginLingoFR|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0 (Changeset 1583)|
|''Require:''|[[UploadPlugin V4.0.0|http://tiddlywiki.bidix.info/#PasswordOptionPlugin]]<br>[[UploadService|http://tiddlywiki.bidix.info/#UploadPlugin]]|
***/
//{{{
config.macros.upload.label = {
	promptOption: "Sauvegarde et télécharge ce TiddlyWiki avec les UploadOptions",
	promptParamMacro: "Sauvegarde et télécharge ce TiddlyWiki vers %0",
	saveLabel: "sauvegarde sur le web", 
	saveToDisk: "sauvegarde sur le disque",
	uploadLabel: "Télécharge vers le web"	
};

config.macros.upload.messages = {
	noStoreUrl: "Pas de 'store URL' dans les paramètres ou dans les options",
	usernameOrPasswordMissing: "nom d'utilisateur ou mot de passe absent"
};

bidix.upload.messages = {
	//from saving
	invalidFileError: "Le fichier '%0' d'origine ne semble pas être un TiddlyWiki valide",
	backupSaved: "backup téléchargé vers le web",
	backupFailed: "Echec du téléchargement enregistrement du backup",
	rssSaved: "Flux RSS a été téléchargé",
	rssFailed: "Echec du téléchargement du flux RSS",
	emptySaved: "Fichier de base 'empty.html' téléchargé",
	emptyFailed: "Echec du téléchargement du fichier de base 'empty.html'",
	mainSaved: "Fichier principal TiddlyWiki téléchargé",
	mainFailed: "Echec du téléchargement du fchier principal TiddlyWiki. Vos modifications n'ont pas été téléchargées",
	//specific upload
	loadOriginalHttpPostError: "Le fichier d'origine n'a pas pu être accédé",
	aboutToSaveOnHttpPost: "Préparation du téléchargement du TiddlyWiki vers  %0 ...",
	storePhpNotFound: "Le script de téléchargement '%0' n'a pas pu être trouvé."
};
//}}}