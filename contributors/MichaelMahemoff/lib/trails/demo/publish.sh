#!/bin/bash
export dist=standalone-dist
./standalone.sh
tar zcvf trail.tgz $dist/trail
rm -fr $dist/podcasting
mv $dist/trail $dist/podcasting
rsync -v --delete -e ssh -avz $dist/podcasting $SCRUMPTIOUS_TRAIL_SSH_DEST
scp trail.tgz $SCRUMPTIOUS_TRAIL_SSH_DEST
