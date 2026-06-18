#!/usr/bin/env bash
# Aether Online - Auto Start Script
# Run this to start the game server + public tunnel

GAME_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$GAME_DIR/server"

echo "╔══════════════════════════════════╗"
echo "║   AETHER ONLINE - INICIANDO...   ║"
echo "╚══════════════════════════════════╝"

# Kill old processes
pkill -f "server.mjs" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null
sleep 1

# Install server deps if needed
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "[1/3] Instalando dependências do servidor..."
  cd "$SERVER_DIR" && npm install
fi

# Build game if dist is missing or old
if [ ! -f "$GAME_DIR/dist/index.html" ]; then
  echo "[2/3] Buildando o jogo..."
  cd "$GAME_DIR" && npm run build
fi

# Start server
echo "[3/3] Iniciando servidor na porta 3001..."
cd "$SERVER_DIR"
nohup node server.mjs > /tmp/aether-server.log 2>&1 &
echo $! > /tmp/aether-server.pid
sleep 2

# Check server is up
if curl -s http://localhost:3001/api/status > /dev/null 2>&1; then
  echo "✅ Servidor rodando!"
else
  echo "❌ Servidor falhou. Log:"
  cat /tmp/aether-server.log
  exit 1
fi

# Start cloudflared tunnel
echo "🌐 Iniciando tunnel público (Cloudflare)..."
nohup cloudflared tunnel --url http://localhost:3001 > /tmp/aether-tunnel.log 2>&1 &
echo $! > /tmp/aether-tunnel.pid
sleep 8

# Extract URL
URL=$(grep -o 'https://[^[:space:]]*trycloudflare[^[:space:]]*' /tmp/aether-tunnel.log | head -1)

if [ -z "$URL" ]; then
  echo "⚠️  URL do tunnel não encontrada. Veja /tmp/aether-tunnel.log"
  echo "📌 Servidor local disponível em: http://localhost:3001"
else
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  🎮 AETHER ONLINE ESTÁ NO AR!                               ║"
  echo "║                                                              ║"
  echo "║  Link para amigos:                                           ║"
  echo "║  $URL"
  echo "║                                                              ║"
  echo "║  Para parar: ./stop-server.sh                               ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  # Save URL to file for easy access
  echo "$URL" > /tmp/aether-url.txt
fi
