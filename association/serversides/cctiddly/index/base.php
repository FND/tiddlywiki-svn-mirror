<?php
	$scheme = 'http';
	if (isset($_SERVER['HTTPS']) and $_SERVER['HTTPS'] == 'on') {
$scheme .= 's';
}
?>
<base href='<?php echo $scheme;?>http://<?php echo $_SERVER['SERVER_NAME'];?><?php echo $tiddlyCfg['pref']['base_folder'];?>/' />