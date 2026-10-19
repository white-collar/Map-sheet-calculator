#!/bin/sh
# Runs all checks against ../index.html. Needs node and python3.
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
PAGE="$DIR/../index.html"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "== Exact reference comparison (120,000 points per seed)"
for seed in 1 2 3; do
  (cd "$TMP" && python3 -I "$DIR/ref.py" $seed && node "$DIR/harness.js" "$PAGE" < in.txt > got.txt)
  python3 -I - "$TMP" <<'PY'
import sys
d = sys.argv[1]
exp = open(d + '/exp.txt').read().split('\n'); got = open(d + '/got.txt').read().split('\n')
bad = [k for k in range(len(exp)) if exp[k] != got[k]]
print(len(exp) - 1, 'points,', len(bad), 'mismatches')
sys.exit(1 if bad else 0)
PY
done

echo "== Property, edge, known-sheet and parsing checks"
node "$DIR/props.js" "$PAGE"

echo "== Joined sheets and published examples"
node "$DIR/joined.js" "$PAGE"
