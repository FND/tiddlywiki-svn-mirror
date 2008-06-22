#
#  deploy edition to riplerap.com
#
(
    cd ../../editions/Confabb
    cook
)
scp ../../editions/Confabb/index.html ripmaster@ripplerap.com:/data/vhost/www.ripplerap.com/html/edition/staging-ripplerap.html
