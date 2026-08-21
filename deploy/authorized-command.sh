#!/usr/bin/env bash
# 仅由 GitHub Actions 部署密钥调用，禁止获得服务器 shell。
set -Eeuo pipefail

original_command="${SSH_ORIGINAL_COMMAND:-}"
if [[ "$original_command" =~ ^(deploy|rollback)[[:space:]]+([0-9a-f]{40})$ ]]; then
  # sudoers 仅允许这个 root 管理、参数会被脚本再次校验的命令。
  exec sudo --non-interactive /opt/rain-blog-deploy/server-deploy.sh "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
fi

echo "This SSH key may only deploy or roll back an exact Git commit." >&2
exit 126
