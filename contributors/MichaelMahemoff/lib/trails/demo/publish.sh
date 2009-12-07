#!/bin/bash
export dist=standalone-dist
./standalone.sh
tar zcvf trail.tgz $dist/trail
rm -fr $dist/podcasting
mv $dist/trail $dist/podcasting
rsync --delete -e "ssh -p $SCRUMPTIOUS_SSH_PORT" -avz $dist/podcasting $SCRUMPTIOUS_TRAIL_SSH_DEST
scp -P $SCRUMPTIOUS_SSH_PORT trail.tgz $SCRUMPTIOUS_TRAIL_SSH_DEST
