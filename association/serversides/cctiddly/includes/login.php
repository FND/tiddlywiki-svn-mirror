<?php


if ($_POST['logout'] || $_REQUEST['logout'])
{
	user_logout('You have logged out.');
	header("Location: ".str_replace("index.php", "", $_SERVER['PHP_SELF']));
}



///////////////////////////////CC: user variable defined in header and $user['verified'] can be used directly to check user validation
 // check to see if user is logged in or not and then assign permissions accordingly. 
//if ($user['verified'] = user_session_validate())
$user['verified'] = user_session_validate();

if ($user['verified'])
{
$workspace_permissions = $tiddlyCfg['default_user_perm'];
	
} else {
	$workspace_permissions = $tiddlyCfg['default_anonymous_perm'];
}

if ($workspace_permissions == "")
{
	$workspace_permissions = "DDDD";
}



//////////////
//  Can this use an existing function ?!?!?!

//  SET WORKSPACE CREATE PERMISSION FLAG
if (substr($workspace_permissions, 1, 1) == "U")
{
	$workspace_create = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_create = substr($workspace_permissions, 1, 1);
}
//echo $workspace_create;

//  SET WORKSPACE READ PERMISSION FLAG
if (substr($workspace_permissions, 0, 1) == "U")
{
	$workspace_read = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_read = substr($workspace_permissions, 0, 1);
}

//  SET WORKSPACE UDATE PERMISSION FLAG
if (substr($workspace_permissions, 2, 1) == "U")
{
	$workspace_udate = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_udate = substr($workspace_permissions, 2, 1);
}


//  SET WORKSPACE DELETE PERMISSION FLAG
if (substr($workspace_permissions, 2, 1) == "U")
{
	$workspace_delete = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_delete = substr($workspace_permissions, 2, 1);
}

//
////////////////////////////////////////////

$workspace_settings_count= count($workspace_settings);
//echo $user['verified'];
//echo $workspace_permissions;

// display open id bits if it is enabled. 
if ($tiddlyCfg['pref']['openid_enabled'] ==1)
{
		require_once "includes/openid/common.php";
		
		session_start();

		function run() {
		    $consumer = getConsumer();

		    // Complete the authentication process using the server's
		    // response.
		    $return_to = getReturnTo();
		    $response = $consumer->complete($return_to);

		    // Check the response status.
		    if ($response->status == Auth_OpenID_CANCEL) {
		        // This means the authentication was cancelled.
		        $msg = 'Verification cancelled.';
		    } else if ($response->status == Auth_OpenID_FAILURE) {
		        // Authentication failed; display the error message.
		        $msg = "OpenID authentication failed: " . $response->message;
		    } else if ($response->status == Auth_OpenID_SUCCESS) {
		        // This means the authentication succeeded; extract the
		        // identity URL and Simple Registration data (if it was
		        // returned).
		        $openid = $response->getDisplayIdentifier();
		        $esc_identity = htmlspecialchars($openid, ENT_QUOTES);

		        $success = sprintf('You have successfully verified ' .
		                           '<a href="%s">%s</a> as your identity.',
		                           $esc_identity, $esc_identity);


		        if ($response->endpoint->canonicalID) {
		            $success .= '  (XRI CanonicalID: '.$response->endpoint->canonicalID.') ';
		        }

		        $sreg_resp = Auth_OpenID_SRegResponse::fromSuccessResponse($response);

		        $sreg = $sreg_resp->contents();

		        if (@$sreg['email']) {
		            $success .= "  You also returned '".$sreg['email']."' as your email.";
		        }

		        if (@$sreg['nickname']) {
		            $success .= "  Your nickname is '".$sreg['nickname']."'.";
		        }

		        if (@$sreg['fullname']) {
		            $success .= "  Your fullname is '".$sreg['fullname']."'.";
		        }


			$pape_resp = Auth_OpenID_PAPE_Response::fromSuccessResponse($response);

			if ($pape_resp) {
			  if ($pape_resp->auth_policies) {
			    $success .= "<p>The following PAPE policies affected the authentication:</p><ul>";

			    foreach ($pape_resp->auth_policies as $uri) {
			      $success .= "<li><tt>$uri</tt></li>";
			    }

			    $success .= "</ul>";
			  } else {
			    $success .= "<p>No PAPE policies affected the authentication.</p>";
			  }

			  if ($pape_resp->auth_age) {
			    $success .= "<p>The authentication age returned by the " .
			      "server is: <tt>".$pape_resp->auth_age."</tt></p>";
			  }


			  if ($pape_resp->nist_auth_level) {
			    	$success .= "<p>The NIST auth level returned by the " .
			  			"server is: <tt>".$pape_resp->nist_auth_level."</tt></p>";
			  }
			} else {
			  $success .= "<p>No PAPE response was sent by the provider.</p>";
			}
		               	user_set_session(urldecode(urldecode($esc_identity)), 'openID');

						$scheme = 'http';
		    			if (isset($_SERVER['HTTPS']) and $_SERVER['HTTPS'] == 'on') {
		       	 			$scheme .= 's';
		    			}


				      header("location:".$scheme."://".$_SERVER['SERVER_NAME'].dirname(dirname(dirname($_SERVER['SCRIPT_NAME']))));                    
		    }
		    //require_once('index.php');
		}
		run();
}





?>