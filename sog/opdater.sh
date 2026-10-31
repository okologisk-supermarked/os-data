#!/bin/bash
# Natlig opdatering af søgeindekset. Kræver API-nøglen i ~/.dd/key
set -e
cd "$(dirname "$0")/.."
python3 sog/byg_indeks.py 26
python3 sog/byg_indeks.py 27
python3 - <<'P'
import json
for f in ['sog/indeks.json','sog/indeks_he.json']:
    d=json.load(open(f));assert d['meta']['n']>5000,'for få varer i '+f
P
git add sog/indeks.json sog/indeks_he.json kurv/kurv_he.json
git diff --cached --quiet && { echo "Ingen ændringer"; exit 0; }
git commit -qm "Natlig opdatering af søgeindeks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
SHA=$(git rev-parse HEAD)
python3 -c "import json,time;json.dump({'sha':'$SHA','t':int(time.time())},open('sog/version.json','w'))"
git add sog/version.json
git commit -qm "Version $SHA

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -q
echo "OK $SHA"
