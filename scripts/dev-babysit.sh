#!/usr/bin/env bash
# Dev-server babysitter — Task 9-e incident recovery.
# While the host ossfs mount is wedged, zombie `next dev` processes hold ports
# 3000/3001 and cannot be killed (D-state). When the sandbox thaws, those
# zombies die and this loop starts a fresh dev server on 3000 automatically.
# Safe to run alongside the platform supervisor: it only acts when nothing
# is listening on 3000 AND no `next dev` process exists.

cd /home/z/my-project || exit 1

while true; do
  sleep 30
  # Thaw test: stat() on the hung mount returns instantly once recovered
  if timeout 5 ls upload >/dev/null 2>&1; then
    port_busy=$(ss -tln 2>/dev/null | grep -c ':3000 ')
    dev_procs=$(pgrep -fc "next dev" 2>/dev/null || echo 0)
    if [ "$port_busy" = "0" ] && [ "$dev_procs" = "0" ]; then
      echo "[babysitter] thaw detected — starting dev server $(date)" >> dev.log
      nohup bun run dev >> dev.log 2>&1 &
    fi
  fi
done
