#!/usr/bin/env bash
pkill -f "server.mjs" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null
echo "✅ Servidor parado."
