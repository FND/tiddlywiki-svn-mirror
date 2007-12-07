#!/bin/sh
#
#   Package the RippleRap server code as a ZIP file
#

cd ..

zipfile="package/ripplerap.zip"
rm -f $zipfile

(
    find . -name \.DS_Store | xargs rm -f
    find . \( -name .svn \) \
        -prune -not  \( -name .svn \) \
        -o -type f | egrep -v "(\.war|\.pyc)$" |
        egrep -v ".pem$|.pfx$|.cer$|^./package|^./test|model.xml$"
    echo ./notes
    echo ./users
) | zip -@ $zipfile
