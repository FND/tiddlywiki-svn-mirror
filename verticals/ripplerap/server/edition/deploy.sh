#
#  deploy edition to riplerap.com
#
(
    cd ../../editions/Confabb
    cook
)
scp index.php ripmaster@ripplerap.com:/data/vhost/www.ripplerap.com/html/edition/index.php
scp ../../editions/Confabb/index.html ripmaster@ripplerap.com:/data/vhost/www.ripplerap.com/html/edition/ripplerap.html
