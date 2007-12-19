<?php
	if( isset($_POST['cctuser']) && isset($_POST['cctpass']) )
	{
		include_once("includes/user.php");
		include_once("includes/function.php");
		cookie_set('txtUserName',formatParametersPOST($_POST['cctuser']));
		cookie_set('pasSecretCode',user_encodePassword(formatParametersPOST($_POST['cctpass'])));
		header("Location: ".$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']);		//redirect to itself to refresh
	}
	include_once("includes/header.php");
?>
<html>
<head>
<title><?php print $ccT_msg['import']['import_title'] ?></title>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head><body>
<h2><?php print $ccT_msg['import']['import_title'] ?></h2>

<?php
	//////////////////////////////////////////print login box if not logged in or not in the right group////////////////////////////////
	$user = user_create();
	$ugroup = array_merge($user['group'],$tiddlyCfg['privilege_misc']['upload']);
	$ugroupsize = sizeof($ugroup);
	$ugroup = array_flip(array_flip($ugroup));
	if( sizeof($ugroup) == $ugroupsize )		//if not logged on, display login screen
	{
?>
<form method="post" action="<?php print $_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']?>">
<?php print $ccT_msg['loginpanel']['username']?><input type="text" name="cctuser"><br>
<?php print $ccT_msg['loginpanel']['password']?><input type="password" name="cctpass"><br>
<input type="submit" value="<?php print $ccT_msg['loginpanel']['login'] ?>" name="ok">
</form>
<?php
		exit("</body></html>");
	}
?>

<?php
	//////////////////////////////////////////print textarea if in the right group////////////////////////////////
	if( !isset($_POST['bulkSubmit']) && !isset($_POST['importSubmit']) )
	{
?>
<form method="post" action="<?php print $_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']?>">
<?php print $ccT_msg['import']['bulktiddler'] ?><br>
<textarea name="bulktiddlers" cols="100" rows="15">
</textarea><br>
<input type="submit" value="submit" name="bulkSubmit">
</form>
<?php
		exit("</body></html>");
	}
?>


<?php
	//////////////////////////////////////////list tiddlers////////////////////////////////

	if( isset($_POST['bulkSubmit']) )		//if submit from bulk tiddlers
	{
		$bulk = formatParametersPOST($_POST['bulktiddlers']);
		$tids = tiddler_htmlToArray($bulk);
?>
<form method="post" action="<?php print $_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']?>">
<?php print $ccT_msg['import']['overwrite'] ?>?<input type="checkbox" name="overwrite">
<table border="1">
<?php
	//<tr><th>import</th><th>title</th><th>modified</th><th>modifier</th><th>created</th><th>tags</th><th>body</th></tr>
?>
<tr><th><?php print $ccT_msg['import']['import'] ?></th>
<th><?php print $ccT_msg['import']['title'] ?></th>
<th><?php print $ccT_msg['import']['modified'] ?></th>
<th><?php print $ccT_msg['import']['modifier'] ?></th>
<th><?php print $ccT_msg['import']['created'] ?></th>
<th><?php print $ccT_msg['import']['tags'] ?></th></tr>
<?php
		$i=1;
		foreach( $tids as $t )
		{
			print '<tr>';
			print '<td><input type="checkbox" name="c'.$i.'" value="on" CHECKED></td>';
			print '<td><input type="text" value="'.$t['title'].'" name="title'.$i.'"></td>';
			print '<td><input size="12" type="text" value="'.$t['modified'].'" name="modified'.$i.'"></td>';
			print '<td><input type="text" value="'.$t['modifier'].'" name="modifier'.$i.'"></td>';
			print '<td><input size="12"  type="text" value="'.$t['created'].'" name="created'.$i.'"></td>';
			print '<td><input type="text" value="'.$t['tags'].'" name="tags'.$i.'"></td>';
			/*print '<td><textarea cols="40" rows="5" name="body'.$i.'">'.htmlspecialchars($t['body']).'</textarea></td>';*/
			print '</tr>';
			$i++;
		}
		
?>
</table>
<textarea rows="10" cols="80" name="bulk"><?php print htmlspecialchars($bulk)?></textarea><br>
<input type="submit" value="import" name="importSubmit">
</form>
<?php
		exit("</body></html>");
	}
?>

<?php
	//////////////////////////////////////////import tiddlers////////////////////////////////
	//

	if( isset($_POST['importSubmit']) )		//if submit from bulk tiddlers
	{
		$overwrite = (isset($_POST['overwrite']) && $_POST['overwrite']=='on')?1:0;
		
		$bulk = formatParametersPOST($_POST['bulk']);
		$result = tiddler_htmlToArray($bulk);
		print("<table border=\"1\"><tr><th>".$ccT_msg['import']['title']."</th>
			<th>".$ccT_msg['import']['action']."</th>
			<th>".$ccT_msg['import']['result']."</th>
			<th>".$ccT_msg['import']['error']."</th></tr>");
		
		//convert HTML to array form and insert into DB
		//WARNING: everything will be overwritten so beware
		foreach( $result as $r )
		{
			$tiddler = tiddler_selectTitle(tiddler_create($r['title']));
			
			$ntiddler = tiddler_create($r['title'], $r['body'],$r['modifier'],$r['modified'],$r['tags'],"","",$r['created']);
			
			print("<tr><td>".$ntiddler['title']."</td>");
			if( sizeof($tiddler) == 0 )		//insert tiddler if not found
			{
				print("<td>".$ccT_msg['import']['insert']."</td>");
				$ntiddler['revision'] = 1;
				$ntiddler['creator'] = $ntiddler['modifier'];		//since creator is not given, assume it is same as modifier
				if( tiddler_insert($ntiddler) === FALSE )
				{
					print("<td>".$ccT_msg['import']['failed']."</td>");
					print("<td>".db_error()."</td>");
				}else{
					print("<td>".$ccT_msg['import']['success']."</td>");
					print("<td>&nbsp;</td>");
				}
			}else{							//update tiddler if found
				if( $overwrite )
				{
					print("<td>".$ccT_msg['import']['update']."</td>");
					$ntiddler['creator'] = $tiddler['creator'];
					$ntiddler['created'] = $tiddler['created'];
					$ntiddler['revision'] = $tiddler['revision']+1;
					if( tiddler_update($tiddler, $ntiddler) === FALSE )
					{
						print("<td>".$ccT_msg['import']['failed']."</td>");
						print("<td>".db_error()."</td>");
					}else{
						print("<td>".$ccT_msg['import']['success']."</td>");
						print("<td>&nbsp;</td>");
					}
				}else{
					print("<td>".$ccT_msg['import']['update']."</td>");
					print("<td>".$ccT_msg['import']['skipped']."</td>");
					print("<td>&nbsp;</td>");
				}
			}
			print "</tr>";
		}
		print("</table>");

		exit("</body></html>");
	}
?>

