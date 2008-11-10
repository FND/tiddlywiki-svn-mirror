<?php
$p = new Plugin('OpenID Plugin','0.1','simonmcmanus.com');
$p->addEvent("postSetLoginPerm", './plugins/OpenID/files/openid/common.php');



$data['tags'] = 'systemConfig';
$p->addTiddler($data, '/Applications/xampp/xamppfiles/htdocs/plugins/OpenID/files/OpenIDPlugin.js');


$data1['tags'] = 'loginBox';
$p->addTiddler($data1, '/Applications/xampp/xamppfiles/htdocs/plugins/OpenID/files/OpenID.tiddler');


?>