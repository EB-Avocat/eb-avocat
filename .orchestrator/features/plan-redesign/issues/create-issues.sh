#!/usr/bin/env bash
# Creates the "Site redesign" epic and its child issues from the markdown drafts
# next to this script. Run from the repo root:
#   bash .orchestrator/features/plan-redesign/issues/create-issues.sh
#
# Re-runnable: an issue whose exact title already exists is not created again, but its
# number is still looked up so links and the epic task list stay complete.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

command -v gh >/dev/null || { echo "gh is not installed" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is not installed" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Not logged in: run 'gh auth login'" >&2; exit 1; }

# --- labels ---------------------------------------------------------------
declare -a LABELS=(
  "redesign|Site redesign|5319e7"
  "design|Design work|c5def5"
  "content|Content and copy|fbca04"
  "frontend|Frontend implementation|0e8a16"
  "a11y|Accessibility|1d76db"
  "seo|SEO|d93f0b"
  "backoffice|Back-office|bfd4f2"
)
for entry in "${LABELS[@]}"; do
  IFS='|' read -r name desc color <<<"$entry"
  gh label create "$name" --description "$desc" --color "$color" --force >/dev/null
done

# --- helpers --------------------------------------------------------------
# front-matter value: fm <file> <key>
fm() { awk -v k="$2" 'NR==1&&$0!="---"{exit} NR>1&&$0=="---"{exit} index($0,k": ")==1{sub(k": ","");print;exit}' "$1"; }
# body without the front matter
body() { awk 'c>=2{print;next} $0=="---"{c++}' "$1"; }

# number of the issue with this exact title, or empty
find_issue() {
  gh issue list --state all --limit 200 --search "\"$1\" in:title" --json number,title \
    | jq -r --arg t "$1" '[.[] | select(.title == $t)][0].number // empty'
}

create_issue() { # file number-of-epic(or empty) -> prints the issue number
  local file="$1" epic="$2" title labels bf url
  title="$(fm "$file" title)"
  labels="$(fm "$file" labels | tr -d ' ')"
  bf="$TMP/$(basename "$file").body"
  { [ -n "$epic" ] && printf 'Part of #%s\n\n' "$epic"; body "$file"; } >"$bf"
  url="$(gh issue create --title "$title" --label "$labels" --body-file "$bf")"
  echo "${url##*/}"
}

# --- epic -----------------------------------------------------------------
EPIC_FILE="$DIR/00-epic.md"
EPIC_TITLE="$(fm "$EPIC_FILE" title)"
EPIC="$(find_issue "$EPIC_TITLE")"
if [ -n "$EPIC" ]; then
  echo "epic exists: #$EPIC"
else
  EPIC="$(create_issue "$EPIC_FILE" "")"
  echo "epic created: #$EPIC"
fi

# --- children -------------------------------------------------------------
declare -A NUM=()      # draft number -> real issue number
declare -A FILE=()     # draft number -> file
declare -A CREATED=()  # draft number -> 1 when created in this run
ORDER=()
for f in "$DIR"/[0-9][0-9]-*.md; do
  nn="$(basename "$f" | cut -c1-2)"
  [ "$nn" = "00" ] && continue
  title="$(fm "$f" title)"
  n="$(find_issue "$title")"
  if [ -n "$n" ]; then
    echo "$nn exists: #$n  $title"
  else
    n="$(create_issue "$f" "$EPIC")"
    CREATED[$nn]=1
    echo "$nn created: #$n  $title"
  fi
  NUM[$nn]="$n"; FILE[$nn]="$f"; ORDER+=("$nn")
done

# --- rewrite draft numbers ({{NN}}) in the bodies created in this run -----------
for nn in "${ORDER[@]}"; do
  [ -n "${CREATED[$nn]:-}" ] || continue
  bf="$TMP/$nn.final"
  { printf 'Part of #%s\n\n' "$EPIC"; body "${FILE[$nn]}"; } >"$bf"
  for k in "${ORDER[@]}"; do
    sed -i.bak "s/{{$k}}/#${NUM[$k]}/g" "$bf"
  done
  rm -f "$bf.bak"
  gh issue edit "${NUM[$nn]}" --body-file "$bf" >/dev/null
done

# --- epic task list -------------------------------------------------------
ef="$TMP/epic.final"
{
  body "$EPIC_FILE"
  printf '\n## Child issues\n\n'
  for nn in "${ORDER[@]}"; do
    printf -- '- [ ] #%s\n' "${NUM[$nn]}"
  done
} >"$ef"
gh issue edit "$EPIC" --body-file "$ef" >/dev/null
echo "epic #$EPIC updated with ${#ORDER[@]} children"
