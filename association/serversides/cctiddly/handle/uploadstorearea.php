<?php
	$cct_base = "../";
	include_once($cct_base."includes/header.php");
	
	
	//return result/message
	/*function returnResult($str)
	{
		global $ccT_msg;
		db_close();
		
		switch($str) {
			case "006":
				global $error;
				global $upload;
				exit("\n".$ccT_msg['notice']['uploadStoreArea_complete'].$upload.'; '.$ccT_msg['word']['error'].': '.$error);
				break;
			case "020":
				//logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
				exit("\n".$ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
				break;
			default:
				logerror($ccT_msg['warning']['save_error']);
				exit("\n".$ccT_msg['warning']['save_error']);
		}
	}*/
	
//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
	//remove slashes
	$body = formatParameters($_POST['upload']);

//////////////////////////////////////////////////////preliminary data check and action//////////////////////////////////////////////////////////////
	
	//get user and privilege and set variables
	/*if( strlen($username)==0 && strlen($password)==0 )
	{
		$user = user_create();		//get username password from cookie
	}else{
		$user = user_create($username,"",0,"",$password,1);
	}*/
	
	//check authorization
	if( !tiddler_privilegeMiscCheck($user, "upload") )
	{
		//returnResult("020");
		sendHeader(401,$ccT_msg['warning']['not_authorized'],"",1);
	}

//////////////////////////////////////////////////////////uploadStorearea//////////////////////////////////////////////////////////////
	
	
	//$db_var['settings']['handleError'] = 0;		//supress log error and do error handling here
	//$db_var['settings']['defaultStop'] = 0;		//do not stop script if error occurs
//exit("<table border='1'><tr><td>2</td></tr></table>\n2");
	//make table for upload result
	
	$output = "<table border='1'><tr><th>title</th><th>action</th><th>result</th><th>error</th></tr>\n";
	
	//convert HTML to array form and insert into DB
	//WARNING: everything will be overwritten so beware
	$error = 0;		//error counter
	$upload = 0;	//upload counter
	$result = tiddler_htmlToArray($body);
	
	foreach( $result as $r )
	{
		//$tiddler = tiddler_selectTitle(tiddler_create($r['title']));
		$tiddler = db_tiddlers_mainSelectTitle($r['title']);
		
		$ntiddler = $r;
		//$ntiddler = tiddler_create($r['title'], $r['body'],$r['modifier'],$r['modified'],$r['tags'],"","",$r['created']);
		$output .= "<tr><td>".$ntiddler['title']."</td>";
		if( $tiddler === FALSE )		//insert tiddler if not found
		{
			$output .= "<td>insert</td>";
			$ntiddler['revision'] = 1;
			$ntiddler['creator'] = $ntiddler['modifier'];		//since creator is not given, assume it is same as modifier
			if( tiddler_insert($ntiddler,0) === FALSE )
			{
				$output .= "<td>failed</td>";
				$output .= "<td>".db_error()."</td></tr>";
				$error++;
			}else{
				$output .= "<td>success</td>";
				$output .= "<td>&nbsp;</td></tr>";
				$upload++;
			}
		}else{							//update tiddler if found
			$output .= "<td>update</td>";
			$ntiddler['creator'] = $tiddler['creator'];
			$ntiddler['created'] = $tiddler['created'];
			$ntiddler['revision'] = $tiddler['revision']+1;
			if( tiddler_update($tiddler['id'], $ntiddler,0) === FALSE )
			{
				$output .= "<td>failed</td>";
				$output .= "<td>".db_error()."</td></tr>";
				$error++;
			}else{
				$output .= "<td>success</td>";
				$output .= "<td>&nbsp;</td></tr>";
				$upload++;
			}
		}
		$output .= "\n";
	}
	$output .= "</table>";

	sendHeader(200
		,$ccT_msg['notice']['uploadStoreArea_complete'].$upload.'; '.$ccT_msg['word']['error'].': '.$error
		,$output,1);
	
//exit("\n".$ccT_msg['notice']['uploadStoreArea_complete'].$upload.'; '.$ccT_msg['word']['error'].': '.$error);	
	//returnResult("006");
?>
