#!/usr/bin/env bash
#
# Upload a file as a Paperclip artifact attached to the current issue.
# Designed for diary entries and posts so they can be viewed/edited in threads.
#
# Required environment:
#   PAPERCLIP_API_URL   (e.g. http://10.0.0.100:3100)
#   PAPERCLIP_API_KEY   (board API key)
#   PAPERCLIP_RUN_ID    (current run id)
#   PAPERCLIP_COMPANY_ID
#   PAPERCLIP_TASK_ID   (issue id)
#
# Usage:
#   scripts/upload-paperclip-artifact.sh content/diary/2026-06-13-my-day.md \
#     --title "Day 13: My Day (draft)"

set -euo pipefail

FILE_PATH=""
ISSUE_ID="${PAPERCLIP_TASK_ID:-}"
COMPANY_ID="${PAPERCLIP_COMPANY_ID:-}"
TITLE=""
STATUS="ready_for_review"
IS_PRIMARY="true"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --issue-id) ISSUE_ID="${2:-}"; shift 2 ;;
    --company-id) COMPANY_ID="${2:-}"; shift 2 ;;
    --title) TITLE="${2:-}"; shift 2 ;;
    --status) STATUS="${2:-}"; shift 2 ;;
    --no-primary) IS_PRIMARY="false"; shift ;;
    --help|-h)
      sed -n '2,15p' "$0"
      exit 0
      ;;
    *)
      if [[ -n "$FILE_PATH" ]]; then
        echo "Unexpected argument: $1" >&2
        exit 1
      fi
      FILE_PATH="$1"
      shift
      ;;
  esac
done

if [[ -z "$FILE_PATH" ]]; then
  echo "Missing file path." >&2
  exit 1
fi
if [[ ! -f "$FILE_PATH" ]]; then
  echo "File not found: $FILE_PATH" >&2
  exit 1
fi
if [[ -z "${PAPERCLIP_API_URL:-}" || -z "${PAPERCLIP_API_KEY:-}" || -z "${PAPERCLIP_RUN_ID:-}" ]]; then
  echo "Missing PAPERCLIP_API_URL, PAPERCLIP_API_KEY, or PAPERCLIP_RUN_ID." >&2
  exit 1
fi
if [[ -z "$ISSUE_ID" || -z "$COMPANY_ID" ]]; then
  echo "Missing issue or company id. Set PAPERCLIP_TASK_ID/PAPERCLIP_COMPANY_ID or pass --issue-id/--company-id." >&2
  exit 1
fi

API_BASE="${PAPERCLIP_API_URL%/}/api"

# Detect content type
LOWER="$(printf '%s' "$FILE_PATH" | tr '[:upper:]' '[:lower:]')"
CONTENT_TYPE="text/markdown"
case "$LOWER" in
  *.md|*.markdown) CONTENT_TYPE="text/markdown" ;;
  *.txt) CONTENT_TYPE="text/plain" ;;
  *.html|*.htm) CONTENT_TYPE="text/html" ;;
  *.json) CONTENT_TYPE="application/json" ;;
  *.pdf) CONTENT_TYPE="application/pdf" ;;
esac

if [[ -z "$TITLE" ]]; then
  TITLE="$(basename "$FILE_PATH")"
fi

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# 1. Upload attachment
ATTACHMENT_FILE="$TMPDIR/attachment.json"
HTTP_CODE="$(curl -sS -X POST -w '%{http_code}' -o "$ATTACHMENT_FILE" \
  "$API_BASE/companies/$COMPANY_ID/issues/$ISSUE_ID/attachments" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  -F "file=@$FILE_PATH;type=$CONTENT_TYPE")"

if [[ "$HTTP_CODE" -lt 200 || "$HTTP_CODE" -ge 300 ]]; then
  echo "Attachment upload failed: HTTP $HTTP_CODE" >&2
  cat "$ATTACHMENT_FILE" >&2
  exit 1
fi

ATTACHMENT_ID="$(jq -r '.id // empty' "$ATTACHMENT_FILE")"
CONTENT_PATH="$(jq -r '.contentPath // empty' "$ATTACHMENT_FILE")"
DOWNLOAD_PATH="$(jq -r '.downloadPath // empty' "$ATTACHMENT_FILE")"
BYTE_SIZE="$(jq -r '.byteSize // 0' "$ATTACHMENT_FILE")"
ORIGINAL_FILENAME="$(jq -r '.originalFilename // empty' "$ATTACHMENT_FILE")"

if [[ -z "$ATTACHMENT_ID" || -z "$CONTENT_PATH" ]]; then
  echo "Attachment upload response missing id or contentPath." >&2
  cat "$ATTACHMENT_FILE" >&2
  exit 1
fi

# 2. Create artifact work product
WP_FILE="$TMPDIR/work-product.json"
WP_BODY="$(jq -n \
  --arg title "$TITLE" \
  --arg status "$STATUS" \
  --arg runId "$PAPERCLIP_RUN_ID" \
  --arg attachmentId "$ATTACHMENT_ID" \
  --arg contentType "$CONTENT_TYPE" \
  --argjson byteSize "$BYTE_SIZE" \
  --arg contentPath "$CONTENT_PATH" \
  --arg openPath "$CONTENT_PATH" \
  --arg downloadPath "$DOWNLOAD_PATH" \
  --arg originalFilename "${ORIGINAL_FILENAME:-}" \
  --argjson isPrimary "$IS_PRIMARY" \
  '{
    type: "artifact",
    provider: "paperclip",
    title: $title,
    status: $status,
    reviewState: "none",
    isPrimary: $isPrimary,
    healthStatus: "unknown",
    createdByRunId: $runId,
    metadata: {
      attachmentId: $attachmentId,
      contentType: $contentType,
      byteSize: $byteSize,
      contentPath: $contentPath,
      openPath: $openPath,
      downloadPath: $downloadPath,
      originalFilename: (if $originalFilename == "" then null else $originalFilename end)
    }
  }')"

HTTP_CODE="$(curl -sS -X POST -w '%{http_code}' -o "$WP_FILE" \
  "$API_BASE/issues/$ISSUE_ID/work-products" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  -H "Content-Type: application/json" \
  --data-binary "$WP_BODY")"

if [[ "$HTTP_CODE" -lt 200 || "$HTTP_CODE" -ge 300 ]]; then
  echo "Artifact work-product creation failed: HTTP $HTTP_CODE" >&2
  cat "$WP_FILE" >&2
  exit 1
fi

WP_ID="$(jq -r '.id // empty' "$WP_FILE")"

echo "Uploaded artifact: $TITLE"
echo "  Attachment: $CONTENT_PATH"
echo "  Download:   $DOWNLOAD_PATH"
echo "  Work product ID: $WP_ID"
