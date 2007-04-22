/***
|''Name:''|UploadPluginLingoFR|
|''Description:''|French Translation|
|''Version:''|4.0.2|
|''Date:''|Apr 21, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#UploadPluginLingoFR|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0|
|''Requires:''|UploadPlugin|
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
	backupSaved: "backup enegistré sur le web",
	backupFailed: "Echec de l'enregistrement du backup sur le web",
	rssSaved: "Flux RSS a été téléchargé",
	rssFailed: "Echec du téléchargement du flux RSS",
	emptySaved: "Fichier de base 'empty.html' téléchargé",
	emptyFailed: "Echec du téléchargement du fichier de base 'empty.html'",
	mainSaved: "Fichier principal TiddlyWiki téléchargé",
	mainFailed: "Echec du téléchargement du fichier principal TiddlyWiki. Vos modifications n'ont pas été téléchargées",
	//specific upload
	loadOriginalHttpPostError: "Le fichier d'origine n'a pas pu être accédé",
	aboutToSaveOnHttpPost: "Préparation du téléchargement du TiddlyWiki vers %0 ...",
	storePhpNotFound: "Le script de téléchargement '%0' n'a pas pu être trouvé."
};

merge(config.optionsDesc,{
	txtUploadStoreUrl: "Url du script du Service de Téléchargement (defaut : store.php)",
	txtUploadFilename: "Nom du fichier à télécharger vers le web (defaut : in index.html)",
	txtUploadDir: "Repertoire relatif où télécharger le fichier (defaut : . (répertoire du Service de Téléchargement))",
	txtUploadBackupDir: "Repertoire relatif où sauvegarder le fichier précédent. Si vide il n'y aura pas de sauvegarde. (defaut : '' (néant))",
	txtUploadUserName: "Nom d'utilisateur pour le Téléchargement",
	pasUploadPassword: "Mot de passe pour le Téléchargement",
	chkUploadLog: "Enregistre une trace dans UploadLog (defaut: true)",
	txtUploadLogMaxLine: "Nomnre maximum de lignes dans UploadLog (defaut: 10)"
});

//}}}