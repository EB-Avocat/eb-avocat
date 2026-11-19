#!/usr/bin/env bash
# Creates the "Site redesign" epic and its child issues from the markdown drafts
# next to this script. Run it AFTER the plan-redesign PR is merged to main: the links
# and screenshots in the issue bodies point at files on the main branch.
# Run from the repo root:
#   bash .orchestrator/features/plan-redesign/issues/create-issues.sh
#
# Re-runnable: an issue whose exact title already exists is not created again, but its
# number is still looked up so links and the epic task list stay complete.
set -euo pipefail

# Where the audit, spec and PNGs live once merged; replaces @@REPO@@ in the drafts.
REPO_URL="${REPO_URL:-https://github.com/EB-Avocat/eb-avocat/blob/main/.orchestrator/features/plan-redesign}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/create-issues.XXXXXX")"
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
body() { awk 'c>=2{print;next} $0=="---"{c++}' "$1" | sed "s|@@REPO@@|$REPO_URL|g"; }

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
# Plain variables (NUM_<nn>, FILE_<nn>, CREATED_<nn>) instead of associative arrays:
# macOS ships bash 3.2, which has no `declare -A`.
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
    printf -v "CREATED_$nn" '%s' 1
    echo "$nn created: #$n  $title"
  fi
  printf -v "NUM_$nn" '%s' "$n"
  printf -v "FILE_$nn" '%s' "$f"
  ORDER+=("$nn")
done

# --- rewrite draft numbers ({{NN}}) in the bodies --------------------------------
# Done for issues created in this run and for existing ones that still hold a
# placeholder (a previous run that failed between create and edit).
for nn in "${ORDER[@]}"; do
  created="CREATED_$nn"; num="NUM_$nn"; file="FILE_$nn"
  if [ -z "${!created:-}" ]; then
    gh issue view "${!num}" --json body --jq .body | grep -q '{{[0-9][0-9]}}' || continue
  fi
  bf="$TMP/$nn.final"
  { printf 'Part of #%s\n\n' "$EPIC"; body "${!file}"; } >"$bf"
  for k in "${ORDER[@]}"; do
    knum="NUM_$k"
    sed -i.bak "s/{{$k}}/#${!knum}/g" "$bf"
  done
  rm -f "$bf.bak"
  gh issue edit "${!num}" --body-file "$bf" >/dev/null
done

# --- epic task list -------------------------------------------------------
# Keep the boxes already ticked on the epic: a re-run must not reset progress.
current="$(gh issue view "$EPIC" --json body --jq .body)"
ef="$TMP/epic.final"
{
  body "$EPIC_FILE"
  printf '\n## Child issues\n\n'
  for nn in "${ORDER[@]}"; do
    num="NUM_$nn"
    mark=" "
    printf '%s\n' "$current" | grep -qE "^- \[[xX]\] #${!num}\$" && mark="x"
    printf -- '- [%s] #%s\n' "$mark" "${!num}"
  done
} >"$ef"
gh issue edit "$EPIC" --body-file "$ef" >/dev/null
echo "epic #$EPIC updated with ${#ORDER[@]} children"
