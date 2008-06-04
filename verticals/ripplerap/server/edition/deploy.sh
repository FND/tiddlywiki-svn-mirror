#
#  deploy edition to riplerap.com
#
(
    cd ../../core
    cook
)
scp index.php ripmaster@ripplerap.com:/data/vhost/www.ripplerap.com/html/edition/index.php
scp ../../core/index.html ripmaster@ripplerap.com:/data/vhost/www.ripplerap.com/html/edition/ripplerap.html
