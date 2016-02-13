#!/bin/bash
#

if [ -z "$PUBLISH_URI" ]; then
    echo "PUBLISH_URI env must be set"
    exit 1
fi

VERSION=$(jq -r < "${GITDIR}./package.json" .version)
rsync --no-R --no-implied-dirs cmd-shift-t.safariextz "${PUBLISH_URI}./cmd-shift-t_${VERSION}.safariextz"
