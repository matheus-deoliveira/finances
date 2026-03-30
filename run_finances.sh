#!/bin/bash
echo "Inicializando Gerenciador Financeiro..."

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Iniciar processos
cd "$PROJECT_ROOT/backend" && ./mvnw spring-boot:run > /dev/null 2>&1 &
cd "$PROJECT_ROOT/frontend" && npm run dev > /dev/null 2>&1 &

echo "Aguardando o banco de dados..."
until $(curl --output /dev/null --silent --head --fail http://localhost:8080/api/transactions); do
    printf '.'
    sleep 1
done

echo -e "\nBanco pronto! Abrindo aplicativo..."
open http://localhost:5173
exit 0
