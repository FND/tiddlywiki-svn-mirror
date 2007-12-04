<?php

//////////////////////////////////////////////////////// description ////////////////////////////////////////////////////////
	/**
		@file
		
		@brief This file provides PHP functions related to tiddler (it mimic a class but didn't put as a class to speed things up abit).
		
		@author: CoolCold
		@email: cctiddly.coolcold@dfgh.net
	*/
	
	/*
		license:
			This is licensed under GPL v2
			http://www.gnu.org/licenses/gpl.txt

	*/
	/**
		requirement:
			db.*.php
	*/
	
//////////////////////////////////////////////////////// parameter check ////////////////////////////////////////////////////////

//////////////////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////////////////

	//!	@fn array tiddler_create($title, $body="", $modifier="", $modified="", $tags="", $id="", $creator="", $created="", $fields="", $version=1)
	//!	@brief create tiddler array with validation
	//!	@param $title title of tiddler
	//!	@param $body body of tiddler
	//!	@param $modifier modifier of tiddler
	//!	@param $modified modified date of tiddler
	//!	@param $tags tags string of tiddler
	//!	@param $id id of tiddler, 0 = unknown or new
	//!	@param $creator creator of tiddler
	//!	@param $created created date of tiddler
	//!	@param $fields field variable
	//!	@param $version version of tiddler, 1 = new
	function tiddler_create($title, $body="", $modifier="", $modified="", $tags="", $id="", $creator="", $created="", $fields="", $version=1)
	{
		debug('tiddler_create');
		global $tiddlyCfg;
		$tiddler = array();
	 	$tiddler['id'] = preg_replace("![^0-9]!","",$id);		//if empty, leave it as empty. otherwise make it as int
		//$tiddler['title'] = tiddler_bodyEncode($title);
 		$tiddler['title'] = $title;
		//$tiddler['body'] = tiddler_bodyEncode($body);
	 	$tiddler['body'] = $body;
		$tiddler['modifier'] = $modifier;
	 	$tiddler['modified'] = preg_replace("![^0-9]!","",$modified);
	 	$tiddler['creator'] = $creator;
		 $tiddler['created'] = preg_replace("![^0-9]!","",$created);
			$tiddler['tags'] = $tags;
 		$tiddler['fields'] = $fields;
 		$tiddler['instance_name'] = $tiddlyCfg['pref']['instance_name'];
 		$tiddler['version'] = preg_replace("![^0-9]!","",$version);
		return $tiddler;
	}
	
	//!	@fn array tiddler_backup_create($un)
	//!	@brief create backup tiddler array format using tiddler array
	//!	@param $tiddler_create tiddler array, created and verified using function tiddler_create
	//!	@param $oid oid of tiddler for used in versioning only
	//function tiddler_backup_create($title, $body="", $modifier="", $modified="", $tags="", $id="", $creator="", $created="", $version=1, $oid="")
	function tiddler_backup_create($tiddler_create, $oid="")
	{
		$tiddler = array();
		$tiddler['id'] = preg_replace("![^0-9]!","",$tiddler_create['id']);		//if empty, leave it as empty. otherwise make it as int
		$tiddler['oid'] = preg_replace("![^0-9]!","",$oid);
		$tiddler['title'] = $tiddler_create['title'];
		$tiddler['body'] = $tiddler_create['body'];
		$tiddler['modifier'] = $tiddler_create['modifier'];
		$tiddler['modified'] = preg_replace("![^0-9]!","",$tiddler_create['modified']);
		//$tiddler['creator'] = $creator;
		//$tiddler['created'] = (int)$created;
		$tiddler['tags'] = $tiddler_create['tags'];
		$tiddler['fields'] = $tiddler_create['fields'];
		$tiddler['version'] = preg_replace("![^0-9]!","",$tiddler_create['version']);
		
		return $tiddler;
	}
	///////////////////////////////////////////////////////////////encoding and formatting//////////////////////////////////////////////////
	//!	@fn tiddler_outputDIV($tiddler)
	//!	@brief output tiddler in div form for TW
	//!	@param $tiddler tiddler array
	function tiddler_outputDIV($tiddler)
	{
?>
<div tiddler="<?php print $tiddler["title"] ?>" modifier="<?php print $tiddler["modifier"] ?>" modified="<?php print $tiddler["modified"] ?>" created="<?php print $tiddler["created"] ?>" tags="<?php print $tiddler["tags"] ?>" temp.ccTversion="<?php print $tiddler["version"] ?>" <?php print $tiddler["fields"] ?>><?php print $tiddler["body"] ?></div>
<?php
		return;
	}

	//!	@fn array tiddler_breakTag($tagStr)
	//!	@brief break tag into array
	//!	@param $tagStr string of tags
	function tiddler_breakTag($tagStr)
	{
		$array = array();
		
		//obtain and remove [[tags]]
		$r=0;
		$e=0;		//ending tag position
		while( ($r=strpos( $tagStr, "[[", 0))!==FALSE && ($e=strpos( $tagStr, "]]", $r))!==FALSE ) //$e > $r so will use $r to find $e
		{
			$tag = substr($tagStr, $r+2, $e-$r-2);
			$array[] = $tag;
			$tagStr = str_replace('[['.$tag.']]'," ",$tagStr);
		}
		
		//obtain regular tags separate by space
		//put in all tags into $array
		$array = array_merge($array,explode(" ",$tagStr));
		
		//strip empty string and trim tags
		$return = array();
		foreach($array as $t)
		{
			if(strlen($t)>0)
			{
				$return[] = trim($t);
			}
		}
		
		return $return;
	}
	
	//!	@fn array tiddler_htmlToArray($html)
	//!	@brief convert html codes into tiddler array to use with upload
	//!	@param $html html code of storeArea, assume already strip slashes
	function tiddler_htmlToArray($html)
	{
		$tiddlers=preg_grep("!<div.+tiddler=!",explode("\n",$html));		//only ones with "<div tiddler=" is accepted
		$result = array();
		foreach($tiddlers as $tid)		//for each line of tiddler
		{
			$t = $tid;
			//first take body out
			$r['body'] = trim(preg_replace("!(<div[^>]*>|</div>)!","",$t));
			$t = preg_replace("!(<div |>.*</div>)!","",$t);		//take away body and begining <div tag
		
			//define useful regex
			$reg_remove = "!([^=]*=\"|\")!";		//reg ex for removing something=" and "
			
			//take out the rest of the info
			$reg = "!tiddler=\"[^\"]*\"!";
			preg_match($reg, $t, $tmp);				//obtain string from tiddler
			$t = preg_replace($reg, "", $t);		//remove data from div string
			$r['title'] = trim(preg_replace($reg_remove,"",$tmp[0]));		//remove unwanted string and add to array
			
			$reg = "!modifier=\"[^\"]*\"!";
			preg_match($reg, $t, $tmp);				//obtain string from tiddler
			$t = preg_replace($reg, "", $t);		//remove data from div string
			$r['modifier'] = trim(preg_replace($reg_remove,"",$tmp[0]));		//remove unwanted string and add to array
			
			$reg = "!modified=\"[^\"]*\"!";
			preg_match($reg, $t, $tmp);				//obtain string from tiddler
			$t = preg_replace($reg, "", $t);		//remove data from div string
			$r['modified'] = trim(preg_replace($reg_remove,"",$tmp[0]));		//remove unwanted string and add to array

			$reg = "!created=\"[^\"]*\"!";
			preg_match($reg, $t, $tmp);				//obtain string from tiddler
			$t = preg_replace($reg, "", $t);		//remove data from div string
			$r['created'] = trim(preg_replace($reg_remove,"",$tmp[0]));		//remove unwanted string and add to array
			
			$reg = "!tags=\"[^\"]*\"!";
			preg_match($reg, $t, $tmp);				//obtain string from tiddler
			$t = preg_replace($reg, "", $t);		//remove data from div string
			$r['tags'] = trim(preg_replace($reg_remove,"",$tmp[0]));		//remove unwanted string and add to array

			//remove "temp." fields as they are temporary
			$t = preg_replace("!temp[.][^\"]*=\"[^\"]*\"!", "", $t);
			$t = str_replace("  ", " ", $t);		//remove double-space
			
			//trim and put everything into fields
			$r['fields'] = trim($t);
			
			//$r = tiddler_create($r['title'], $r['body'], $r['modifier'], $r['modified'], $r['tags'], "", "", $r['created'], $r['fields'])
			
			//add to result array
			$result[] = $r;
		}
		return $result;
	}
	
	//!	@fn array tiddler_bodyEncode($body)
	//!	@brief encode string into TW div form
	//!	@param $body body string to be converted
	function tiddler_bodyEncode($body)
	{
		$body = str_replace('\\',"\\s",$body);		//replace'\' with '\s'
		$body = str_replace("\n","\\n",$body);		//replace newline with '\n'
		$body = str_replace("\r","",$body);		//return character is not required
		$body = htmlspecialchars($body);		//replace <, >, &, " with their html code

		return $body;
	}
	
	//!	@fn array tiddler_bodyDecode($body)
	//!	@brief convert TW div form to display form
	//!	@param $body body string to be converted
	function tiddler_bodyDecode($body)
	{
		//$body = htmlspecialchars_decode($body);		//replace <, >, &, " with their html code, htmlspecialchars_decode only available in PHP5
		$body = str_replace("&quot;","\"",$body);
		$body = str_replace("&#039;","'",$body);
		$body = str_replace("&lt;","<",$body);
		$body = str_replace("&gt;",">",$body);
		$body = str_replace("&amp;","&",$body);
		$body = str_replace("\\n","\n",$body);		//replace newline with '\n'
		$body = str_replace('\\s',"\\",$body);		//replace'\' with '\s'
		//$body = str_replace("\r","",$body);		//return character is not required

		return $body;
	}
	///////////////////////////////////////////////////////////////privilege function//////////////////////////////////////////////////
	//!	@fn bool tiddler_markupCheck($userArr, $title)
	//!	@brief check if user got permission to change title, only do markup check. [TRUE = ok, FALSE = no permission to change markup]
	//!	@param $userArr user array
	//!	@param $title title of tiddler
	function tiddler_markupCheck($userArr, $title)
	{
		//global $tiddlyCfg;
		//debugV($userArr);
		if( strcmp($title,"MarkupPostBody")==0 || strcmp($title,"MarkupPostHead")==0 || strcmp($title,"MarkupPreBody")==0 || strcmp($title,"MarkupPreHead")==0 )
		{
			/*$ugroup = array_merge($userArr['group'],$tiddlyCfg['privilege_misc']['markup']);		//append one array to another
			$ugroupsize = sizeof($ugroup);		//get initial size
			$ugroup = array_flip(array_flip($ugroup));		//flip^2 to remove duplicate
			if( sizeof($ugroup) == $ugroupsize )		//check group size. return FALSE if not in markup group
			{
				return FALSE;
			}*/
			return tiddler_privilegeMiscCheck($userArr, "markup");
		}
		return TRUE;
	}
	
	//!	@fn bool tiddler_privilegeMiscCheck($userArr, $type)
	//!	@brief check user  permission to $type defined by $tiddlyCfg['privilege_misc']. [TRUE = ok, FALSE = no permission]
	//!	@param $userArr user array
	//!	@param $type type of privilege to check
	function tiddler_privilegeMiscCheck($userArr, $type)
	{
		global $tiddlyCfg;
		
		$ugroup = array_merge($userArr['group'],$tiddlyCfg['privilege_misc'][$type]);		//append one array to another
		$ugroupsize = sizeof($ugroup);		//get initial size
		$ugroup = array_flip(array_flip($ugroup));		//flip^2 to remove duplicate
		if( sizeof($ugroup) == $ugroupsize )		//check group size. return FALSE if not in markup group
		{
			return FALSE;
		}
		return TRUE;
	}
	///////////////////////////////////////////////////////////////DB access//////////////////////////////////////////////////
	//!	@fn bool tiddler_insert($tiddler, $backup=-1)
	//!	@brief save tiddler to DB
	//!	@param $tiddler tiddler array
	//!	@param $backup save backup, [-1 means using value in config]
	function tiddler_insert($tiddler, $backup=-1)
	{
		global $tiddlyCfg;
		
		//insert record
		$result = db_record_insert($tiddlyCfg['table']['name'], $tiddler);
		print db_error();
		if( $result===FALSE )
		{
			return FALSE;
		}
		
		//insert backup if required
		if( $backup==1 || ($backup==-1 && $tiddlyCfg['pref']['version']==1) )
		{
			//set inserted record id as oid
			$tiddler = tiddler_backup_create($tiddler, db_insert_id($result));
			$result = db_record_insert($tiddlyCfg['table']['backup'], $tiddler);
		}
		
		return TRUE;
	}
	
	//!	@fn bool tiddler_delete($tiddler)
	//!	@brief delete tiddler from DB
	//!	@param $tiddler tiddler array, use id for delete
	function tiddler_delete($tiddler)
	{
		global $tiddlyCfg;
		
		//insert record, will stop at db_query function if error occurs
		return db_record_delete($tiddlyCfg['table']['name'], $tiddler);
	}
	
	//!	@fn bool tiddler_update($oldtiddler, $tiddler, $backup=-1)
	//!	@brief update tiddler in DB
	//!	@param $oldtiddler old tiddler array, only to hold the id for updating
	//!	@param $tiddler tiddler array
	//!	@param $backup save backup, [-1 means using value in config]
	function tiddler_update($oldtiddler, $tiddler, $backup=-1)
	{
		global $tiddlyCfg;
		
		//insert record, will stop at db_query function if error occurs
		$result = db_record_update($tiddlyCfg['table']['name'], $oldtiddler, $tiddler);
		
		if( $result===FALSE )
		{
			return FALSE;
		}

		//insert backup if required
		if( $backup==1 || ($backup==-1 && $tiddlyCfg['pref']['version']==1) )
		{
			//set inserted record id as oid
			$tiddler = tiddler_backup_create($tiddler, $oldtiddler['id']);
			$result = db_record_insert($tiddlyCfg['table']['backup'], $tiddler);
		}
		
		return TRUE;
	}

	//!	@fn array tiddler_selectTitle($tiddler)
	//!	@brief get tiddler with title $title (case sensitive)
	//!	@param $tiddler tiddler array, can also be title
	function tiddler_selectTitle($tiddler)
	{
		global $tiddlyCfg;
		if( !is_array($tiddler) )
		{
			$tiddler = tiddler_create($tiddler);
		}
		
		$tiddlers = db_record_select($tiddlyCfg['table']['name'],$tiddler,1);
		
		//grab record and check if title are the same
		//this is required since mysql is not binary safe unless deliberately configured in table
		//result would be empty string if not found, array if found
		foreach($tiddlers as $t)
		{
			if( strcmp($t['title'],$tiddler['title'])==0 )
			{
				//$tmp[] = $t;
				return $t;
			}
		}
		return array();		//only return 1 title
	}
	
	//!	@fn array tiddler_selectAll()
	//!	@brief get all tiddler and return as array
	function tiddler_selectAll()
	{
		global $tiddlyCfg;
		return db_record_selectAll($tiddlyCfg['table']['name']);
	}
	
	//!	@fn array tiddler_selectBackupID($id)
	//!	@brief get all tiddler in backup table with id = $id
	//!	@param $id id of tiddler
	function tiddler_selectBackupID($id)
	{
		global $tiddlyCfg;
		
		return db_record_select($tiddlyCfg['table']['backup'],tiddler_backup_create(array(),$id),1);
	}

?>