#!/bin/sh

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo $SCRIPT_DIR

# Change to the script directory and run the commands
cd "$SCRIPT_DIR" && \
cd ../backend && \
lake exe print-schema > ../frontend/src/lib/transfer/project.jtd.json && \
jtd-codegen ../frontend/src/lib/transfer/project.jtd.json --typescript-out ../frontend/src/lib/transfer && \
cd ../frontend && npx prettier . --write
