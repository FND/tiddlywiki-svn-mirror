#!/bin/sh -ex
# as root
# copy in the data file to /var/lib/mysql/avox as avox.txt
# then in /var/lib/mysql/avox run
# mysqlimport -u avox -r --fields-terminated-by='~' avox avox.txt

# to make this work we need a way of calculating the value of the
# extract

DATABASE=avox
DATAUSER=avox
DATAFILE=avox.txt
DATADIR=/var/lib/mysql/avox
EXTRACTDIR=/home/avox/wikidata/avoxjson-s/dataextracts

# calculate extract
# XXX not done!!!
EXTRACTFILE=${1:?"filename required"}

cd $DATADIR
cp $EXTRACTDIR/$EXTRACTFILE $DATAFILE

mysqlimport -u $DATAUSER -r --fields-terminated-by='~' $DATABASE $DATAFILE

rm $DATAFILE
