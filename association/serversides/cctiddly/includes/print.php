<?php
//////////////////////////////////////////////////////// description ////////////////////////////////////////////////////////
	/**
		@file
		@brief print functions that printout code into tiddly wiki to change its action. 
	*/
	if( !isset($tiddlyCfg) )
	{
		exit($ccT_msg['error']['config_not_found']);
	}
//////////////////////////////////////////////////////////////include TW function/////////////////////////////////////////////////////////////
	//!	@fn cct_print_includes($standalone)
	//!	@brief print all includes javascript, usually external ones
	//!	@param $standalone check if it is a standalone version
	function cct_print_includes($standalone)
	{
		global $tiddlyCfg;
		$tw = $tiddlyCfg['tiddlywiki_type'];
		
		if( $standalone )
		{
			//get tiddlywiki.js content and output it
			$fhandle = fopen($tw,'r');
			if( $fhandle===FALSE )
			{
				logerror($ccT_msg['error']['js_file_open'],1
					,$ccT_msg['error']['js_file_open'].$ccT_msg['msg']['file']." $tw.js");
			}
			if( ($tmp=fread($fhandle,filesize($tw)))===FALSE )
			{
				logerror($ccT_msg['error']['js_file_read'],1
					,$ccT_msg['error']['js_file_read'].$ccT_msg['msg']['file']." $tw.js");
			}
			
			if( strcmp($tiddlyCfg['twLanguage'],"en") != 0 )
			{
				$fhandle = fopen("./plugins/".$tiddlyCfg['twLanguage'].".js",'r');
				if( $fhandle===FALSE )
				{
					logerror($ccT_msg['error']['js_file_open'],1
						,$ccT_msg['error']['js_file_open'].$ccT_msg['msg']['file']." $tw.js");
				}
				if( ($tmp.=fread($fhandle,filesize($tw)))===FALSE )
				{
					logerror($ccT_msg['error']['js_file_read'],1
						,$ccT_msg['error']['js_file_read'].$ccT_msg['msg']['file']." $tw.js");
				}
			}
			
			return "<script type=\"text/javascript\">\n".$tmp."\n</script>";
		}
		//include tw
		$r = '<script type="text/javascript" src="'.$tw.'"></script>';
		
		//include language file
		if( strcmp($tiddlyCfg['twLanguage'],"en") != 0 )
		{
			$r .= "\n".'<script type="text/javascript" src="./plugins/'.$tiddlyCfg['twLanguage'].'.js"></script>';
		}
		return $r."\n";
	}

//////////////////////////////////////////////////////////////ccT plugins/////////////////////////////////////////////////////////////
	
	//!	@fn cct_print_divConfig($standalone)
	//!	@brief print plugins required for ccT
	//!	@param $standalone check if it is a standalone version
	function cct_print_plugins($standalone)
	{
		global $tiddlyCfg;
		global $ccT_msg;
		global $user;
		//compulsory
		print "\n<script type=\"text/javascript\">\n";
		
		//find server name and root path
	//	$url = $_SERVER['PHP_SELF'];

		//in cct online mode
		if( !$standalone )
		{
			debug("workspace name IS : ".$tiddlyCfg['workspace_name']);
			debug("print ".$tiddlyCfg['workspace_name']);
			
			//remove workspace from query_string
			$_SERVER['QUERY_STRING'] = preg_replace("!workspace=([^&]*&|.*$)!","",$_SERVER['QUERY_STRING']);
?>
//<![CDATA[
//cctPlugin

var serverside={
	url: "<?php echo ($_SERVER['HTTPS']?"https://":"http://").$_SERVER['SERVER_NAME'].str_replace('/index.php', '',  $_SERVER['SCRIPT_NAME']);?>",		//server url, for use in local TW or TW hosted elsewhere
	workspace:"<?php echo $tiddlyCfg['workspace_name'];?>",
	queryString:"<?php echo queryString();?>",
	handle:{		//path of file for handling request, can be used to put in GET variable
		rss: "/handle/rss.php?<?php print queryString()?>",
		uploadStoreArea: "/handle/uploadstorearea.php?<?php print queryString()?>",		//for uploading the whole storearea
		saveTiddler: "/handle/save.php?<?php print queryString()?>",
		removeTiddler: "/handle/delete.php?<?php print queryString()?>",
		revisionList: "/handle/revisionlist.php?<?php print queryString()?>",
		revisionDisplay: "/handle/revisiondisplay.php?<?php print queryString()?>",
		createWorkspace: "/handle/createworkspace.php?<?php print queryString()?>",
		login: "/msghandle.php?<?php print queryString()?>"
	},
	handle_msg:{		//message sent to server for action, used for posting message to server. null = not used
		rss: "action=rss",
		uploadStoreArea: "",
		saveTiddler: "",
		removeTiddler: "",
		createWorkspace: "",
		login: null
	},
	debug: <?php print $tiddlyCfg['developing'] ?>,		//debug mode, display alert box for each action
	passwordTime: 0,		//defines how long password variable store in cookie. 0 = indefinite
	messageDuration: 5000,				//displayMessage autoclose duration (in milliseconds), 0=leave open
	lingo:{		//message for different language
		uploadStoreArea: "<?php print $ccT_msg['notice']['uploadStoreArea'] ?>",
		rss: "<?php print $ccT_msg['notice']['uploadRSS'] ?>",
		timeOut: "<?php print $ccT_msg['notice']['timeOut'] ?>",
		error: "<?php print $ccT_msg['notice']['error'] ?>",
		click4Details: "<?php print $ccT_msg['notice']['click4Details'] ?>",
		returnedTextTitle: "<?php print $ccT_msg['notice']['returnedTextTitle'] ?>",
		anonymous: "<?php print $ccT_msg['loginpanel']['anoymous'] ?>",
		login:{
			login: "<?php print $ccT_msg['loginpanel']['login'] ?>",
			loginFailed: "<?php print $ccT_msg['loginpanel']['loginFailed'] ?>",
			loginPrompt: "<?php print $ccT_msg['loginpanel']['loginPrompt'] ?>",
			logout: "<?php print $ccT_msg['loginpanel']['logout'] ?>",
			logoutPrompt: "<?php print $ccT_msg['loginpanel']['logoutPrompt'] ?>"
		},
		revision:{
			text: "<?php print $ccT_msg['word']['revision'] ?>",
			tooltip: "<?php print $ccT_msg['misc']['revision_tooltip'] ?>",
			popupNone: "<?php print $ccT_msg['warning']['no_revision'] ?>",
			error: "<?php print $ccT_msg['error']['revision_error'] ?>",
			notExist: "<?php print $ccT_msg['error']['revision_not_found'] ?>"
		}
	},
	loggedIn:<?php echo  $usr_val?user_session_validate():0;?>,
	status:{		//require translation later
		200: "OK",
		201: "Created",
		204: "Empty",
		207: "MultiStatus",
		401: "Unauthorized",
		403: "Forbidden",
		404: "Not found",
		405: "Method not allowed"
	},
	fn:{}		//server-side function
};

cctPlugin = {
	lingo:{
		autoUpload:"<?php print $ccT_msg['optionPanel']['autoUpload'] ?>",
		WSinUse:"<?php print $ccT_msg['ccCreateWorkspace']['WSinUse'] ?>"
	}
};

window.cct_tweak = function(){

	//add new option to options panel
	// OLD config.shadowTiddlers.OptionsPanel = "<<ssUploadStoreArea>>\n<<ssUploadRSS>>\n<<option chkAutoSave>> "+cctPlugin.lingo.autoUpload+"\n<<option chkRegExpSearch>>"+config.shadowTiddlers.OptionsPanel.substring(config.shadowTiddlers.OptionsPanel.search(/<<option chkRegExpSearch>>/)+26);
	config.shadowTiddlers.OptionsPanel = config.shadowTiddlers.OptionsPanel.substring(config.shadowTiddlers.OptionsPanel.search(/<<option chkRegExpSearch>>/)+39);
 //config.shadowTiddlers.OptionsPanel = "[[ccEditWorkspace]]";
	
	
	//change SideBarOption panel to add login panel
		config.shadowTiddlers.SideBarOptions = "<<ccLoginStatus>>"+ config.shadowTiddlers.SideBarOptions;

	
		config.shadowTiddlers.ViewTemplate = config.shadowTiddlers.ViewTemplate.replace(/references jump/,'references revisions jump');
	//change saveChange label to upload



<?php
		}
		//exist in standalone mode
?>

	//force [[link|url]] to open in [- = current window, + = new window]
	window.createExternalLink_cct = window.createExternalLink;
	window.createExternalLink = function (place,url)
	{
		//save previous config
		var tmp = config.options.chkOpenInNewWindow;
		
		//change chkOpenInNewWindow
		if( url.substring(0,1) == "\-" ){
			config.options.chkOpenInNewWindow = false;
			url = url.substring(1,url.length);
		}else{
			if( url.substring(0,1) == "\+" ){
				config.options.chkOpenInNewWindow = true;
				url = url.substring(1,url.length);
			}
		}
			
		var theLink = window.createExternalLink_cct(place,url);
		
		//restore chkOpenInNewWindow
		config.options.chkOpenInNewWindow = tmp;
		return(theLink);
	}
	
	// time (in minutes, from now) for password to stay in cookie [0= default i.e. year 2038]
	//config.macros.option.passwordTime = <?php print $tiddlyCfg['session_expire'];?>;
	
	
	
	
<?php
	///////////////////////////////CC: user variable defined in header and $user['verified'] can be used directly to check user validation
	//$usr = user_getUsername();
	//$usr_val = user_session_validate();
	//$usr = $usr_val?$usr:$ccT_msg['loginpanel']['anoymous'];
	$usr = $user['verified']?$user['username']:$ccT_msg['loginpanel']['anoymous'];
?>
	
};

<?php
		print "//]]>\n";
		print "</script>\n";

		if( !$standalone )		//online version only
		{
			//print '<script type="text/javascript" src="cctplugins.js"></script>'."\n";
			print '<script type="text/javascript" src="serverside.js"></script>'."\n";
		}
		return '';
	}
?>
