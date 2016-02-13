#!/bin/bash
#
# Updates version information and update manifest

GITDIR=$(pwd)/$(git rev-parse --show-cdup)

VERSION=$(jq -r < "${GITDIR}./package.json" .version)


INFO_FILE=${GITDIR}./cmd-shift-t.safariextension/Info.plist
plutil -convert json $INFO_FILE

JQFILTER=".CFBundleVersion = \"${VERSION}\""
JQFILTER="$JQFILTER | .CFBundleShortVersionString = \"${VERSION}\""
jq "$JQFILTER" < "$INFO_FILE" | sponge "$INFO_FILE"

plutil -convert xml1 "$INFO_FILE"


UPDATE_FILE=${GITDIR}./Update.plist
plutil -convert json $UPDATE_FILE

JQFILTER=".\"Extension Updates\"[0].CFBundleVersion = \"${VERSION}\""
JQFILTER="$JQFILTER | .\"Extension Updates\"[0].CFBundleShortVersionString = \"${VERSION}\""
JQFILTER="$JQFILTER | .\"Extension Updates\"[0].URL = \"http://camlittle.com/files/cmd-shift-t_${VERSION}.safariextz\""
jq "$JQFILTER" < "$UPDATE_FILE" | sponge "$UPDATE_FILE"

plutil -convert xml1 "$UPDATE_FILE"
