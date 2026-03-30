@echo off
title Finances App
echo Inicializando Gerenciador Financeiro...

:: Iniciar Backend em segundo plano
start /min cmd /c "cd backend && mvnw spring-boot:run"

:: Iniciar Frontend em segundo plano
start /min cmd /c "cd frontend && npm run dev"

echo Aguardando o banco de dados carregar...
:wait_loop
timeout /t 1 > nul
curl -s http://localhost:8080/api/transactions > nul
if %errorlevel% neq 0 (
    echo Servidor ainda carregando...
    goto wait_loop
)

echo Banco de dados pronto! Abrindo Finances...
start http://localhost:5173
exit
