<?php
/*
 *  provides a 'download' link for index.html
 *  - filename is the current directory name
 */

$filename = basename(getcwd());
$filepath = 'index.html';

header('Content-type: text/html;charset=UTF-8');
header('Content-Disposition: attachment; filename="'.$filename.'.html"');
header("Content-Length: ".filesize($filepath));
readfile($filepath);

exit(0);

?>
