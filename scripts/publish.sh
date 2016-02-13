#!/bin/bash
#

VERSION=$(jq -r < "${GITDIR}./package.json" .version)
rsync --no-R --no-implied-dirs cmd-shift-t.safariextz "${PUBLISH_URI}./cmd-shift-t_${VERSION}.safariextz"
