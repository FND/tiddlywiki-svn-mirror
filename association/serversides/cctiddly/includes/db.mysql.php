<?php

/**
	@file
	@brief generic sql functions using MYSQL
	
	@author: CoolCold
	@email: cctiddly.coolcold@dfgh.net
	
	license:
		This is licensed under GPL v2
		http://www.gnu.org/licenses/gpl.txt


	
	@warnings
		N/A
*/
///////////////////////////////////////////////////////initialize///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////required functions///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////required variables///////////////////////////////////////////////////////////
$db_var['host'] = $tiddlyCfg['db']['host'];
//$db_var['port'] = "3306";
$db_var['username'] = $tiddlyCfg['db']['login'];
$db_var['password'] = $tiddlyCfg['db']['pass'];
$db_var['db'] = $tiddlyCfg['db']['name'];

//define if script should stop when error occurs
//	0 = continue even when error occurs
//	1 = stop when error occurs
$db_var['settings']['defaultStop'] = 1;
//define what should happen if db_logerror is called
//	0 = do nothing
//	1 = output and log error
$db_var['settings']['handleError'] = 1;

//define how data is passed into these functions
//	0 = assume magic_quote OFF and always add slashes to values
//	1 = assume magic_quote ON and never add slashes
//	2 = detect magic_quote and act accordingly
$db_var['settings']['magic_quote'] = 0;		

$db_var['error']['connect'] = $ccT_msg['db']['connect'];
$db_var['error']['selectDB'] = $ccT_msg['db']['select'];
$db_var['error']['queryErr'] = $ccT_msg['word']['query_failed'];
$db_var['error']['error'] = $ccT_msg['msg']['error'];
$db_var['error']['query'] = $ccT_msg['msg']['query'];


/*$db_var['error']['connect'] = "Error connecting to db";
$db_var['error']['selectDB'] = "Error selecting db";
$db_var['error']['queryErr'] = "query error";
$db_var['error']['error'] = " error: ";
$db_var['error']['query'] = " query: ";*/
///////////////////////////////////////////////////////new core - connection fns///////////////////////////////////////////////////////////
	//-----------------------------------------------------------------------DB connect functions--------------------------------------------------------------------------//
	//!	@fn resource db_connect($cont)
	//!	@brief make connection to database and select database
	//!	@param $cont do not stop script if TRUE
	function db_connect_new($cont=FALSE)
	{
		global $db_var;
		global $tiddlyCfg;
		global $ccT_msg;
		
		//connect to db
		$link = mysql_connect(
			$db_var['host'].((isset($db_var['port'])&&strlen($db_var['port'])>0)?":".$db_var['port']:"")
			,$db_var['username']
			,$db_var['password']
			,TRUE)
			or die($ccT_msg['db']['db_connect_err'].$ccT_msg['db']['word_error'].mysql_error());
		
		//use database
		//if $cont is set, return FALSE instead of exit script. This is used for installation
		if($cont) {
			if( mysql_select_db($db_var['db'],$link)===FALSE ) {
				return FALSE;
			}
		}else{
			mysql_select_db($db_var['db'],$link)
				or die($ccT_msg['db']['db_connect_selectdb'].$ccT_msg['db']['word_error'].mysql_error());
		}
		
		//set to utf-8 communication
		if( $tiddlyCfg['pref']['utf8'] == 1 )
		{
			mysql_query("SET NAMES 'utf8'")
				or die($ccT_msg['db']['db_connect_utf8'].$ccT_msg['db']['word_error'].mysql_error());
		}
		
		return TRUE;
	}
	
	//!	@fn bool db_close($SQLH)
	//!	@brief close db
	//!	@param $SQLH SQL handle
	function db_close($SQLH=FALSE)
	{
		if( $SQLH===FALSE )
		{
			mysql_close();
		}else{
			mysql_close($SQLH);
		}
		return TRUE;
	}

///////////////////////////////////////////////////////install functions///////////////////////////////////////////////////////////
	//!	@fn bool db_install_db()
	//!	@brief install db
	function db_install_db()
	{
		global $db_var; 
		global $ccT_msg; 
		mysql_query("CREATE DATABASE `".$db_var['db']."`")
			or die($ccT_msg['db']['db_install_createDB'].$ccT_msg['db']['word_error'].mysql_error());
		return TRUE;
	}

	//!	@fn bool db_install_mainT()
	//!	@brief install main table
	function db_install_mainT()
	{
		global $ccT_msg;
		global $tiddlyCfg;
		
		$query = "CREATE TABLE ".$tiddlyCfg['table']['main']." (
			`id` int(11) NOT NULL auto_increment,
			`title` varchar(255) NOT NULL default '',
			`body` text NOT NULL,
			`fields` text NOT NULL,
			`modified` varchar(128) NOT NULL default '',
			`created` varchar(128) NOT NULL default '',
			`modifier` varchar(255) NOT NULL default '',
			`creator` varchar(255) NOT NULL default '',
			`version` int(11) NOT NULL default '0',
			`tags` varchar(255) NOT NULL default '',
			`instance_name` int(3) NOT NULL default '0',
			PRIMARY KEY (id)
			)
			TYPE=MyISAM";
		if( $tiddlyCfg['pref']['utf8']==1 )
		{
			$query .= "
				CHARACTER SET utf8
				COLLATE utf8_unicode_ci";
		}
		
		if( mysql_query("DESCRIBE ".$tiddlyCfg['table']['main'])===FALSE ) {
			mysql_query( $query	)
				or die($ccT_msg['db']['word_error'].mysql_error());
			return TRUE;
		}else{//table existed
			return FALSE;
		}
	}

	//!	@fn bool db_install_backupT()
	//!	@brief install backup table
	function db_install_backupT()
	{
		global $ccT_msg;
		global $tiddlyCfg;
		
		
		$query = "CREATE TABLE ".$tiddlyCfg['table']['backup']." (
			`id` int(11) NOT NULL auto_increment,
			`title` varchar(255) NOT NULL default '',
			`body` text NOT NULL,
			`fields` text NOT NULL,
			`modified` varchar(128) NOT NULL default '',
			`modifier` varchar(255) NOT NULL default '',
			`version` int(11) NOT NULL default '0',
			`tags` varchar(255) NOT NULL default '',
			`oid` INT(11) NOT NULL,
			`instance_name` int(3) NOT NULL default '0',
			PRIMARY KEY (id)
			)
			TYPE=MyISAM";
		if( $tiddlyCfg['pref']['utf8']==1 ) {
			$query .= "
				CHARACTER SET utf8
				COLLATE utf8_unicode_ci";
		}

		if( mysql_query("DESCRIBE ".$tiddlyCfg['table']['backup'])===FALSE ) {
			mysql_query( $query	)
				or die($ccT_msg['db']['word_error'].mysql_error());
			return TRUE;
		}else{//table existed
			return FALSE;
		}
	}
	
///////////////////////////////////////////////////////record functions///////////////////////////////////////////////////////////
	//!	@fn array db_fetch_assoc($result)
	//!	@brief return first row of a query result(associative  indices) or data of array from current pointer
	//!	@param $result result returned from sql query
	function db_fetch_assoc(&$result)
	{
		if( is_array($result) ) {
			if( sizeof($result) == 0 ) {
				return FALSE;
			}
			
			//$tmp = reset($tmp);					//reset point to first element
			$tmp = current($result);		//return result from current element
			unset($result[key($result)]);
			return $tmp;
		}else{
			return mysql_fetch_assoc($result);
		}
		return FALSE;
	}

///////////////////////////////////////////////////////record select functions///////////////////////////////////////////////////////////
	//!	@fn array db_tiddlers_mainSelectAll()
	//!	@brief select all tiddlers from db
	//!	@param $table table name required
	//!	@param $instance instance of db
	//function db_tiddlers_mainSelectAll($table,$instance)
	function db_tiddlers_mainSelectAll()
	{
		//$data = formatArray4SQL($data);			//require to check data???
		global $tiddlyCfg;
		global $ccT_msg;
		//$tiddlyCfg['table']['main'],$tiddlyCfg['pref']['instance_name']
		$result = mysql_query("SELECT * FROM ".$tiddlyCfg['table']['main']." WHERE instance_name='".$tiddlyCfg['pref']['instance_name']."'")
			or die($ccT_msg['db']['word_error'].mysql_error());

			return $result;
	}

	//!	@fn array db_tiddlers_selectTitle($title,$instance)
	//!	@brief select tiddler with particular title
	//!	@param $table table name
	//!	@param $title title of tiddler
	//!	@param $instance instance of db
	function db_tiddlers_mainSelectTitle($title)
	{
		//$data = formatArray4SQL($data);			//require to check data???
		global $tiddlyCfg;
		global $ccT_msg;
		$q = "SELECT * FROM `".$tiddlyCfg['table']['main']
			."` WHERE instance_name='".$tiddlyCfg['pref']['instance_name']
			."' AND title='".db_format4SQL($title)."'";
		$result = mysql_query($q)
			or die($ccT_msg['db']['word_error'].mysql_error());
		
		//grab record and check if title are the same
		//this is required since mysql is not binary safe unless deliberately configured in table
		//result would be empty string if not found, array if found
		while( $t = mysql_fetch_assoc($result) )
		{
			if( strcmp($t['title'],$title)==0 )
			{
				//$tmp[] = $t;
				return $t;
			}
		}

		return FALSE;
	}
	
	function db_tiddlers_backupSelectOid($oid)
	{
		//$data = formatArray4SQL($data);			//require to check data???
		global $tiddlyCfg;
		global $ccT_msg;
		$q = "SELECT * FROM `".$tiddlyCfg['table']['backup']
			."` WHERE `tiddler_id`='".db_format4SQL($oid)."'"
			." ORDER BY `revision` DESC";
		$result = mysql_query($q)
			or die($ccT_msg['db']['word_error'].mysql_error());
		
		//grab record and check if title are the same
		//this is required since mysql is not binary safe unless deliberately configured in table
		//result would be empty string if not found, array if found
		$r = array();
		while( $t = mysql_fetch_assoc($result) )
		{
			$r[] = $t;
		}

		return $r;
	}
///////////////////////////////////////////////////////record manupulate///////////////////////////////////////////////////////////

	function db_tiddlers_mainInsert($tiddler,$stop=1)
	{
		//$data = formatArray4SQL($data);			//require to check data???
		global $tiddlyCfg;
		global $ccT_msg;
		/*
		//get keys of array
		$key=array_keys($tiddler);
		
		//format using db_format4SQL
		$i=0;
		$size=sizeof($key);
		while($i<$size)
		{
			$tiddler[$key[$i]]=(string)db_format4SQL($tiddler[$key[$i]]);
			$i++;
		}*/
		
		while( (list($k,$v) = each($tiddler)) )
		{
			$q .= "`".db_format4SQL($k)."`='".db_format4SQL($v)."',";
			if( strcmp($k,"id")!=0 ) {
				$key[] = $k;
				$val[$k] = (string)db_format4SQL($v);
			}
		}

		
		$q = "INSERT INTO ".$tiddlyCfg['table']['main']
				."(`".implode("`,`",$key)."`,`instance_name`)"
				." VALUES ('".implode("','",$val)."','".$tiddlyCfg['pref']['instance_name']."')";
		
		if( $stop==1 ) {
			$result = mysql_query($q)
				or die($ccT_msg['db']['word_error'].mysql_error().$ccT_msg['db']['word_query'].$q);
		}else{
			$result = mysql_query($q);
		}
		
		return $result;
	}

	//!	@fn array db_tiddlers_insert($table,$instance)
	//!	@brief insert tiddlers
	//!	@param $table table name required
	//!	@param $instance instance of db
	function db_tiddlers_backupInsert($tiddler,$stop=1)
	{
		global $tiddlyCfg;
		global $ccT_msg;
		
		while( (list($k,$v) = each($tiddler)) )
		{
			$q .= "`".db_format4SQL($k)."`='".db_format4SQL($v)."',";
			if( strcmp($k,"id")!=0 ) {
				$key[] = $k;
				$val[$k] = (string)db_format4SQL($v);
			}
		}

		/*
		//get keys of array
		$key=array_keys($tiddler);
		
		//format using db_format4SQL
		$i=0;
		$size=sizeof($key);
		while($i<$size)
		{
			$tiddler[$key[$i]]=(string)db_format4SQL($tiddler[$key[$i]]);
			$i++;
		}*/
		
		$q = "INSERT INTO ".$tiddlyCfg['table']['backup']
				."(`".implode("`,`",$key)."`)"
				." VALUES ('".implode("','",$val)."')";
		
		if( $stop==1 ) {
			$result = mysql_query($q)
				or die($ccT_msg['db']['word_error'].mysql_error().$ccT_msg['db']['word_query'].$q);
		}else{
			$result = mysql_query($q);
		}
		
		return $result;
	}
	
	
	//!	@fn array db_tiddlers_insert($table,$instance)
	//!	@brief insert tiddlers
	//!	@param $table table name required
	//!	@param $instance instance of db
	function db_tiddlers_mainUpdate($oid,$tiddler,$stop=1)
	{
		global $tiddlyCfg;
		global $ccT_msg;

		//remove primary key (first element in array)
		array_shift($tiddler);
		
		//make query
		$q = "UPDATE ".$tiddlyCfg['table']['main']." SET ";
		while( (list($k,$v) = each($tiddler)) )
		{
			$q .= "`".db_format4SQL($k)."`='".db_format4SQL($v)."',";
		}
		$q = substr($q,0,(strlen($q)-1));		//remove last ","
		$q .= " WHERE `id` = '".$oid."'";
		
		//send query
		if( $stop==1 ) {
			$result = mysql_query($q)
				or die($ccT_msg['db']['word_error'].mysql_error().$ccT_msg['db']['word_query'].$q);
		}else{
			$result = mysql_query($q);
		}
		
		return db_affected_rows();

	}
	//!	@fn array db_tiddlers_insert($table,$instance)
	//!	@brief insert tiddlers
	//!	@param $table table name required
	//!	@param $instance instance of db
	function db_tiddlers_mainDelete($id)
	{
		global $tiddlyCfg;
		global $ccT_msg;

		$q = "DELETE FROM ".$tiddlyCfg['table']['main']." WHERE `id` = '".$id."'";
		//send query
		$result = mysql_query($q)
			or die($ccT_msg['db']['word_error'].mysql_error().$ccT_msg['db']['word_query'].$q);
		return $result;
	}
///////////////////////////////////////////////////////record functions///////////////////////////////////////////////////////////
/**
	Record functions are intermediate functions to interact with DB in array forms.
	It does not do error checking, error checking is done in DB functions or outside here
**/
	
	//-----------------------------------------------------------------------record functions--------------------------------------------------------------------------//
	//!	@fn bool db_record_insert($table,$data)
	//!	@brief insert record into db
	//!	@param $table table name required
	//!	@param $data data array
	//WARNING: did not check field length, thus truncated by mysql if too long
	//ASSUMPTION: first record is id and thus not add to db if empty (using auto_increment)
	function db_record_insert($table,$data)
	{
		//$data = formatArray4SQL($data);
		global $tiddlyCfg;		
		
		//if first element is empty, remove it since its the primary key and using auto_increment
		if( strlen(current($data))==0 )
		{
			//remove primary key (first element in array)
			array_shift($data);
		}
		
		//get keys of array
		$key=array_keys($data);
		
		//format using db_format4SQL
		$i=0;
		$size=sizeof($key);
		while($i<$size)
		{
			$data[$key[$i]]=(string)db_format4SQL($data[$key[$i]]);
			$i++;
		}
			$r = db_query("INSERT INTO ".$table." (`".implode("`,`",$key)."`) VALUES ('".implode("','",$data)."')");
		
		return $r;
		
	}

	//!	@fn bool db_record_delete($table,$data)
	//!	@brief delete record in db
	//!	@param $table table name required
	//!	@param $data data array, only use first (or defined position) as id  to identify record
	//!	@param $keyPosition where in the array is the key, normally position '0'
	//ASSUMPTION: first record is id/key and used to identify record. Can be changed with $keyPosition.
	function db_record_delete($table,$data,$keyPosition=0, $operator='=')
	{
		//move array pointer to id
		$i=0;
		while( $i<$keyPosition )
		{
			next($data);
			$i++;
		}
		return db_query("DELETE FROM ".$table." WHERE `".db_format4SQL(key($data))."` ".$operator." '".db_format4SQL(current($data))."'");
	}
	
	//!	@fn resource db_record_update($table,$data)
	//!	@brief update record in db
	//!	@param $table table name required
	//!	@param $odata old data array, mainly to use the first element (primary key) to look for record to update
	//!	@param $ndata new data array to update record
	function db_record_update($table,$odata,$ndata)
	{
		//if first element of new data is empty, remove it since its the primary key and wont usualy need updating
		if( strlen(current($ndata))==0 )
		{
			//remove primary key (first element in array)
			array_shift($ndata);
		}
		//make query
		$sql="UPDATE ".$table." SET ";
		while( (list($k,$v) = each($ndata)) )
		{
			$sql .= "`".db_format4SQL($k)."`='".db_format4SQL($v)."',";
		}
		$sql=substr($sql,0,(strlen($sql)-1));		//remove last ","
		$sql .= " WHERE `".db_format4SQL(key($odata))."` = '".db_format4SQL(current($odata))."'";
		db_query($sql);
		return db_affected_rows();
	}
	

	//!	@fn array db_record_select($table,$data)
	//!	@brief select record from db
	//!	@param $table table name required
	//!	@param $data data array, only use first (or defined position) as id  to identify record
	//!	@param $keyPosition the $keyPosition th number of element in array to search for, $keyPosition=0 means search with id
	function db_record_select($table,$data,$keyPosition=0)
	{
		//$data = formatArray4SQL($data);			//require to check data???
		
		$i=0;
		while( $i<$keyPosition )
		{
			next($data);
			$i++;
		}

	//	$sql = "SELECT * FROM ".$table." WHERE `".db_format4SQL(key($data))."`='".db_format4SQL(current($data))."'";
	//	$result = db_query($sql);	
	// CHANGED BY SIMONMCMANUS TO ALLOW MULTIPLE WHERE CLAUSES TO BE PASSED
	
		$sql_start = "SELECT * FROM ".$table." WHERE ";
	
		while( (list($k,$v) = each($data)) )
		{
		$sql = '';
			if ($v != '')  // make sure we dont search on emtpy values
				$sql .= "`".db_format4SQL($k)."`='".db_format4SQL($v)."' and ";
		}
		$sql= $sql_start.substr($sql,0,(strlen($sql)-4));		//remove last "and"
if($sql == $sql_start)
{
	$sql = str_replace("WHERE", "", $sql);
}
		$result = db_query($sql);

	// END OF SIMONMCMANUS /////
	
			if( $result === FALSE )
		{
			return FALSE;
		}
		
		//grab all result from resource to form array
		$return=array();
		while( ($tmp=db_fetch_assoc($result))!==FALSE )
		{
			$return[]=$tmp;
		}
		return $return;
	}
	
	//!	@fn array db_record_select($table,$data)
	//!	@brief select record from db
	//!	@param $table table name required
	function db_record_selectAll($table)
	{
		//$data = formatArray4SQL($data);			//require to check data???
		
		
		global $tiddlyCfg;
			//insert record into db
		if ($table = $tiddlyCfg['table']['main'])
		{
			$result = db_query("SELECT * FROM ".$table." where instance_name='".$tiddlyCfg['pref']['instance_name']."'");
		}
		else
		{	$result = db_query("SELECT * FROM ".$table);
		}
		if( $result === FALSE )
		{
			return FALSE;
		}
		$data=array();
		while( ($tmp=db_fetch_assoc($result)) )
		{
			$data[]=$tmp;
		}

		return $data;
	}

///////////////////////////////////////////////////////misc functions///////////////////////////////////////////////////////////
/**
	misc functions for use in here
**/
	//!	@fn bool db_logerror( $display_error, $stop_script=0, $record_error="" )
	//!	@brief log error in this function
	//!	@param $display_error displayed error
	//!	@param $stop_script exit script if 1 is passed
	//!	@param $record_error error that goes in log, use display error if different
	function db_logerror( $display_error, $stop_script=0, $record_error="" )
	{
		global $db_var;
		if( $db_var['settings']['handleError'] )	{
			logerror( $display_error, $stop_script, $record_error );
		}
		return TRUE;
	}

	//!	@fn bool db_format4SQL($str)
	//!	@brief format string for SQL (add slashes accordingly)
	//!	@param $str string to format
	//definition of magic_quote config
	//	0 = assume magic_quote OFF and always add slashes to values
	//	1 = assume magic_quote ON and never add slashes
	//	2 = detect magic_quote and act accordingly
	function db_format4SQL($str)
	{
		global $db_var;
		
		if( !is_string($str) )
		{
			return $str;
		}
		
		//if set to not add slashes (1) or set to detect with magic_quote on (2), return string
		if( $db_var['settings']['magic_quote']==1 || ($db_var['settings']['magic_quote']==2 && get_magic_quotes_gpc()) )
		{
			return $str;
		}
		return addslashes($str);
	}

///////////////////////////////////////////////////////db functions///////////////////////////////////////////////////////////
/**
	Core DB functions which includes connect, close connection, make query and fetch data from returned query
	Also does error checking and display of errors
**/
	
	//-----------------------------------------------------------------------DB connect functions--------------------------------------------------------------------------//
	//!	@fn resource db_connect($db)
	//!	@brief make connection to database
	//!	@param $db database variable array, consisted of [host, port, user, pass, db_name]
	function db_connect()
	{
		global $db_var;
		global $tiddlyCfg;
		//create connection to db
		$link = db_connectDB();
		if( $link===FALSE )
		{
			db_logerror($db_var['error']['connect'],$db_var['settings']['defaultStop'],$db_var['error']['connect']."(".$db_var['error']['error'].mysql_error().")");
			return FALSE;
		}
		
		//use database
		$r = db_selectDB($db_var['db'],$link);
		if( $r===FALSE )
		{
			db_logerror($db_var['error']['selectDB'],$db_var['settings']['defaultStop'],$db_var['error']['selectDB']."(".$db_var['error']['error'].mysql_error().")");
			return FALSE;
		}
		
		//set to utf-8 communication
		if( $tiddlyCfg['pref']['utf8'] == 1 )
		{
			if( db_query("SET NAMES 'utf8'")===FALSE )
			{
				db_logerror($db_var['error']['queryErr'],$db_var['settings']['defaultStop']
					,$db_var['error']['queryErr']."(".$db_var['error']['query']."SET NAMES 'utf8'".$db_var['error']['error'].mysql_error().")");
				return FALSE;
			}
		}
		
		return $link;
	}
	
	//!	@fn resource db_connectDB()
	//!	@brief connect to DB
	function db_connectDB()
	{
		global $db_var;
		return mysql_connect($db_var['host'].((isset($db_var['port'])&&strlen($db_var['port'])>0)?":".$db_var['port']:""),$db_var['username'],$db_var['password'],TRUE);
	}

	
	//!	@fn resource db_selectDB($db,$link="")
	//!	@brief select DB
	//!	@param $db database name
	//!	@param $link sql connection resource
	function db_selectDB($db,$link="")
	{
		if( is_string($link) && strlen($link)==0 )
		{
			return mysql_select_db($db);
		}
		return mysql_select_db($db,$link);
	}
	
	//-----------------------------------------------------------------------DB core functions--------------------------------------------------------------------------//
	//!	make query to db with statement $sql
	//!	$sql = query statement
	function db_createDB($db)
	{
		return db_query("CREATE DATABASE `".$db."`");
	}
	
	//!	make query to db with statement $sql
	//!	$sql = query statement
	function db_query($sql)
	{
		global $db_var;
		global $tiddlyCfg;
		//make query
		if($tiddlyCfg['mysql_debug'])
			debug($sql);
			
		//print $sql;
		$SQLR=mysql_query($sql);
		
		if( $SQLR===FALSE )
		{
			db_logerror( $db_var['error']['queryErr'], $db_var['settings']['defaultStop'],
				$db_var['error']['queryErr']."(".$db_var['error']['query'].$sql.$db_var['error']['error'].mysql_error().")");
			return FALSE;
		}
		
		return $SQLR;					//return data in array
	}
	
	//!	@fn object db_fetch_object($result)
	//!	@brief return first row of a query result as an object
	//!	@param $result result returned from sql query
	function db_fetch_object($result)
	{
		if ($result)
		{
			return mysql_fetch_object($result);
		}
		return FALSE;
	}
	
	//!	@fn array db_fetch_row($result)
	//!	@brief return first row of a query result as an array (number indices)
	//!	@param $result result returned from sql query
	/*function db_fetch_row($result)
	{
		if ($result)
		{
			return mysql_fetch_row($result);
		}
		return FALSE;
	}*/
	
	
	//!	@fn array db_fetch_array($result)
	//!	@brief return first row of a query result as an array (number and assoc indices)
	//!	@param $result result returned from sql query
	/*function db_fetch_array($result)
	{
		if ($result)
		{
			return mysql_fetch_array($result);
		}
		return FALSE;
	}*/
	
	//!	@fn int db_num_rows($result)
	//!	@brief number of rows in returned results
	//!	@param $result result returned from sql query
	function db_num_rows($result)
	{
		if ($result)
		{
			return mysql_num_rows($result);
		}
		return FALSE;
	}
	
	//!	@fn int db_affected_rows($result)
	//!	@brief number of rows affected
	//!	@param $result result returned from sql query
	function db_affected_rows()
	{
		return mysql_affected_rows();
	}
	
	//!	@fn int db_affected_rows($result)
	//!	@brief number of rows affected
	//!	@param $result result returned from sql query
	function db_insert_id()
	{
		return mysql_insert_id();
	}
	
	//!	@fn int db_affected_rows($result)
	//!	@brief number of rows affected
	//!	@param $result result returned from sql query
	function db_error()
	{
		return mysql_error();
	}
	
	
?>