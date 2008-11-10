<?php
$p = new Plugin('OpenID Plugin','0.1','simonmcmanus.com');
$p->addEvent("postSetLoginPerm", './plugins/OpenID/files/openid/common.php');
$data['tags'] = 'systemConfig';
$p->addTiddler('/Applications/xampp/xamppfiles/htdocs/plugins/OpenID/files/OpenIDPlugin.js', $data);
$data['tags'] = 'loginBox';
$p->addTiddler('/Applications/xampp/xamppfiles/htdocs/plugins/OpenID/files/OpenID.tiddler', $data);


?>