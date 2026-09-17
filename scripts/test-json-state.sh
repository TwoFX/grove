#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

cd "$repo_dir/frontend"
node scripts/test-save.mjs "$test_dir"

cd "$repo_dir/test-project"
lake build Grove
test_lean_path="$test_dir:$(lake env printenv LEAN_PATH)"
for source in "$test_dir"/Test/Generated/*.lean "$test_dir"/Test/Generated.lean "$test_dir"/Empty.lean; do
  lake env env LEAN_PATH="$test_lean_path" lean --root="$test_dir" -o "${source%.lean}.olean" "$source"
done
# Run from a different directory to test the generated modules' sibling JSON paths.
lake env env LEAN_PATH="$test_lean_path" bash -c 'cd "$1" && lean --run "$2" "$1"' \
  bash "$test_dir" "$repo_dir/test-project/JsonStateTests.lean"
