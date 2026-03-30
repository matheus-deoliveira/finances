#!/bin/bash
# Script para macOS/Linux
echo "Inicializando Gerenciador Financeiro..."

# Caminho absoluto da raiz do projeto
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Iniciar Backend e Frontend em background
cd "$PROJECT_ROOT/backend" && ./mvnw spring-boot:run > /dev/null 2>&1 &
cd "$PROJECT_ROOT/frontend" && npm run dev > /dev/null 2>&1 &

# Aguarda 5 segundos para garantir que o Vite subiu
sleep 5

# Abre o navegador padrão
open http://localhost:5173

echo "Aplicacao iniciada com sucesso!"
exit 0
