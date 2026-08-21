#!/usr/bin/env bash
# 由 root 安装到 /opt/rain-blog-deploy/server-deploy.sh。
# 只接受 GitHub Actions 传来的精确 commit SHA；不执行任意远程命令。
set -Eeuo pipefail

umask 027

readonly APP_NAME="rain-blog"
readonly REPO_URL="https://github.com/rain-lei/rain-lei.git"
readonly RELEASE_ROOT="/opt/rain-blog-releases"
readonly STATE_DIR="/opt/rain-blog-deploy/state"
readonly LOCK_FILE="/opt/rain-blog-deploy/deploy.lock"
readonly HEALTH_URL="http://127.0.0.1:8080/"

operation="${1:-deploy}"
commit_sha="${2:-}"
if [[ "$operation" != "deploy" && "$operation" != "rollback" ]]; then
  echo "Expected operation deploy or rollback." >&2
  exit 2
fi
if [[ ! "$commit_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Expected a 40-character lowercase Git commit SHA." >&2
  exit 2
fi

mkdir -p "$RELEASE_ROOT" "$STATE_DIR"
exec 9>"$LOCK_FILE"
if ! flock -w 300 9; then
  echo "Another deployment is still running." >&2
  exit 4
fi

short_sha="${commit_sha:0:12}"
release_dir="$RELEASE_ROOT/$commit_sha"
image_tag="$APP_NAME:$short_sha"
previous_sha="$(cat "$STATE_DIR/current-sha" 2>/dev/null || true)"

if docker inspect "$APP_NAME" >/dev/null 2>&1; then
  current_image="$(docker inspect -f '{{.Config.Image}}' "$APP_NAME")"
  if [[ "$current_image" == "$image_tag" ]] && curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null; then
    printf '%s\n' "$commit_sha" > "$STATE_DIR/current-sha"
    echo "Commit $short_sha is already healthy in production."
    exit 0
  fi
fi

mkdir -p "$release_dir"
if [[ ! -d "$release_dir/.git" ]]; then
  git -C "$release_dir" init -q
  git -C "$release_dir" remote add origin "$REPO_URL"
fi

fetched=0
for attempt in 1 2 3; do
  if GIT_TERMINAL_PROMPT=0 git -C "$release_dir" fetch --quiet --depth=1 origin "$commit_sha"; then
    fetched=1
    break
  fi
  echo "Git fetch attempt $attempt failed; retrying..." >&2
  sleep $((attempt * 5))
done
if [[ "$fetched" -ne 1 ]]; then
  echo "Unable to fetch commit $commit_sha." >&2
  exit 5
fi

git -C "$release_dir" checkout --quiet --detach --force FETCH_HEAD
actual_sha="$(git -C "$release_dir" rev-parse HEAD)"
if [[ "$actual_sha" != "$commit_sha" ]]; then
  echo "Fetched commit $actual_sha does not match requested commit $commit_sha." >&2
  exit 6
fi

docker build --pull=false -t "$image_tag" "$release_dir"

backup_name=""
if docker inspect "$APP_NAME" >/dev/null 2>&1; then
  backup_name="$APP_NAME-prev-$(date +%s)"
  if ! docker stop --time 20 "$APP_NAME" >/dev/null; then
    echo "Unable to stop the current container; production was not changed." >&2
    exit 7
  fi
  if ! docker rename "$APP_NAME" "$backup_name"; then
    docker start "$APP_NAME" >/dev/null 2>&1 || true
    echo "Unable to preserve the current container; it was restarted." >&2
    exit 8
  fi
fi

rollback_on_error() {
  local exit_code=$?
  trap - ERR
  echo "Deployment failed; restoring the previous container." >&2
  docker logs --tail 100 "$APP_NAME" >&2 2>/dev/null || true
  docker rm -f "$APP_NAME" >/dev/null 2>&1 || true
  if [[ -n "$backup_name" ]] && docker inspect "$backup_name" >/dev/null 2>&1; then
    docker rename "$backup_name" "$APP_NAME"
    docker start "$APP_NAME" >/dev/null
  fi
  printf '%s\n' "$commit_sha" > "$STATE_DIR/last-failed-sha"
  exit "$exit_code"
}
trap rollback_on_error ERR

# 静态容器内部 Nginx 使用 80；宿主机端口保持 8080，兼容已有反向代理配置。
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p 127.0.0.1:8080:80 \
  "$image_tag" >/dev/null

healthy=0
for attempt in $(seq 1 30); do
  if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null; then
    healthy=1
    break
  fi
  sleep 2
done
if [[ "$healthy" -ne 1 ]]; then
  false
fi

trap - ERR
docker tag "$image_tag" "$APP_NAME:latest"
printf '%s\n' "$commit_sha" > "$STATE_DIR/current-sha"
rm -f "$STATE_DIR/last-failed-sha"

if [[ "$previous_sha" =~ ^[0-9a-f]{40}$ && "$previous_sha" != "$commit_sha" ]]; then
  printf '%s %s\n' "$(date -u +%FT%TZ)" "$previous_sha" >> "$STATE_DIR/history"
  tail -n 30 "$STATE_DIR/history" > "$STATE_DIR/history.tmp"
  mv "$STATE_DIR/history.tmp" "$STATE_DIR/history"
fi

# 健康检查已完成，旧容器不再需要占用容器名；对应镜像和 SHA 发布目录仍保留，可回滚。
if [[ -n "$backup_name" ]]; then
  docker rm "$backup_name" >/dev/null
fi

echo "${operation^}ed commit $short_sha successfully."
echo "Current: $(cat "$STATE_DIR/current-sha")"
echo "Rollback: run the GitHub workflow manually with operation=rollback and an earlier commit SHA."
docker ps --filter "name=^$APP_NAME$" --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
