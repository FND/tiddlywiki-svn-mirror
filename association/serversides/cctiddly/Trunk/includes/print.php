<?php
//////////////////////////////////////////////////////// description ////////////////////////////////////////////////////////
	/**
		@file
		@brief print functions that printout code into tiddly wiki to change its action. 
	*/
	
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
	$r = "<script type='text/javascript' >".file_get_contents($tw)."</script>";
	//include language file
	if( strcmp($tiddlyCfg['twLanguage'],"en") != 0 )
	{
		// Updated to include the TiddlyWiki file on the server 	
		$r .= "<script type='text/javascript' >".file_get_contents("./plugins/".$tiddlyCfg['twLanguage'].".js")."</script>";  
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
	//in cct online mode
	if( !$standalone )
	{
		debug("Workspace name is".$tiddlyCfg['workspace_name'], "config");
		$_SERVER['QUERY_STRING'] = preg_replace("!workspace=([^&]*&|.*$)!","",$_SERVER['QUERY_STRING']);  //remove workspace from query_string
		?>
		//<![CDATA[
		var serverside={
			url:"<?php echo getURL();?>",		//server url, for use in local TW or TW hosted elsewhere
			workspace:"<?php echo $tiddlyCfg['workspace_name'];?>",
			queryString:"<?php echo queryString();?>",
			debug:<?php print $tiddlyCfg['developing'] ?>,		//debug mode, display alert box for each action
			passwordTime:0,		//defines how long password variable store in cookie. 0 = indefinite
			messageDuration:5000,				//displayMessage autoclose duration (in milliseconds), 0=leave open

			lingo:{		//message for different language
				uploadStoreArea:"<?php print $ccT_msg['notice']['uploadStoreArea'] ?>",
				rss:"<?php print $ccT_msg['notice']['uploadRSS'] ?>",
				timeOut:"<?php print $ccT_msg['notice']['timeOut'] ?>",
				error:"<?php print $ccT_msg['notice']['error'] ?>",
				click4Details:"<?php print $ccT_msg['notice']['click4Details'] ?>",
				returnedTextTitle:"<?php print $ccT_msg['notice']['returnedTextTitle'] ?>",
				anonymous:"<?php print $ccT_msg['loginpanel']['anoymous'] ?>",
				login:{
					login:"<?php print $ccT_msg['loginpanel']['login'] ?>",
					loginFailed:"<?php print $ccT_msg['loginpanel']['loginFailed'] ?>",
					loginPrompt:"<?php print $ccT_msg['loginpanel']['loginPrompt'] ?>",
					logout:"<?php print $ccT_msg['loginpanel']['logout'] ?>",
					logoutPrompt:"<?php print $ccT_msg['loginpanel']['logoutPrompt'] ?>"
				},
				revision:{
					text:"<?php print $ccT_msg['word']['revision'] ?>",
					tooltip:"<?php print $ccT_msg['misc']['revision_tooltip'] ?>",
					popupNone:"<?php print $ccT_msg['warning']['no_revision'] ?>",
					error:"<?php print $ccT_msg['error']['revision_error'] ?>",
					notExist:"<?php print $ccT_msg['error']['revision_not_found'] ?>"
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


		window.cct_tweak = function(){
			//add new option to options panel
				config.shadowTiddlers.OptionsPanel = "[[Help]]<br />[[Manage Users]]<br />[[Upload]]<br />[[Download|"+window.url+"/handle/standalone.php?workspace=<?php echo $tiddlyCfg['workspace_name']; ?>]]";
			config.shadowTiddlers.SideBarOptions =  "<<search>>" + config.shadowTiddlers.SideBarOptions.replace('<<search>>', '')+"<<slider 'chkLoginStatus' 'LoginStatus' '  Login Status »' 'Login to make changes'>>" ;

		<?php
			}//exist in standalone mode
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

	$usr = $user['verified']?$user['username']:$ccT_msg['loginpanel']['anoymous'];
	if( !$standalone)	
	{
		echo "};";
	}
	print "//]]>\n";
	print "</script>\n";
	if( !$standalone)		//online version only
	{
		print "<script type='text/javascript' >\n".file_get_contents('serverside.js')."</script>\n";
	}
	return '';
}
?>