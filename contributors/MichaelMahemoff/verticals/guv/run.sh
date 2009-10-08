#!/bin/bash
# This is for everyday developing and debugging
./makedist.sh
./makesampledata.sh
cd dist
./server.sh
