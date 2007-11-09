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
		
		//insert record into db
		$r = db_query("INSERT INTO ".$table." (`".implode("`,`",$key)."`) VALUES ('".implode("','",$data)."')");
		return $r;
	}

	//!	@fn bool db_record_delete($table,$data)
	//!	@brief delete record in db
	//!	@param $table table name required
	//!	@param $data data array, only use first (or defined position) as id  to identify record
	//!	@param $keyPosition where in the array is the key, normally position '0'
	//ASSUMPTION: first record is id/key and used to identify record. Can be changed with $keyPosition.
	function db_record_delete($table,$data,$keyPosition=0)
	{
		//move array pointer to id
		$i=0;
		while( $i<$keyPosition )
		{
			next($data);
			$i++;
		}
		
		return db_query("DELETE FROM ".$table." WHERE `".db_format4SQL(key($data))."` = '".db_format4SQL(current($data))."'");
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
			$sql .= "`".db_format4SQL($k)."`='".db_format4SQL($v)."' and ";
		}
		$sql= $sql_start.substr($sql,0,(strlen($sql)-4));		//remove last "and"
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
		
		$result = db_query("SELECT * FROM ".$table);
		
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
		
		//make query
		
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
	
	//!	@fn array db_fetch_assoc($result)
	//!	@brief return first row of a query result as an array (associative  indices)
	//!	@param $result result returned from sql query
	function db_fetch_assoc($result)
	{
		if ($result)
		{
			return mysql_fetch_assoc($result);
		}
		return FALSE;
	}
	
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