#!/bin/bash
rsync -v --delete -e ssh -avz TrailPlayer.html $SCRUMPTIOUS_TRAIL_SSH_DEST
