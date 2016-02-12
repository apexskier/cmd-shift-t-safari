#!/bin/bash

GITDIR=$(pwd)/$(git rev-parse --show-cdup)

INFO_FILE=$GITDIR/cmd-shift-t.safariextension/Info
UPDATE_FILE=$GITDIR/Update.plist

BUNDLE_ID=$(defaults read "$INFO_FILE" CFBundleIdentifier)
VERSION=$(defaults read "$INFO_FILE" CFBundleVersion)
SHORT_VERSION=$(defaults read "$INFO_FILE" CFBundleShortVersionString)
DEV_ID=$(defaults read "$INFO_FILE" DeveloperIdentifier)

ARG="{ \"CFBundleIdentifier\" = \"${BUNDLE_ID}\"; \"CFBundleVersion\" = \"${VERSION}\"; \"CFBundleShortVersionString\" = \"${SHORT_VERSION}\"; \"Developer Identifier\" = \"${DEV_ID}\"; \"URL\" = \"http://camlittle.com/files/cmd-shift-t_${VERSION}.safariextz\"; }"
defaults write "$UPDATE_FILE" "Extension Updates" -array "$ARG"

plutil -convert xml1 "$UPDATE_FILE"

