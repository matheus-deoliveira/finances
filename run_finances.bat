@echo off
title Finances App
echo Inicializando Gerenciador Financeiro...

:: Iniciar Backend em segundo plano (minimizado)
start /min cmd /c "cd backend && mvnw spring-boot:run"

:: Iniciar Frontend em segundo plano (minimizado)
start /min cmd /c "cd frontend && npm run dev"

echo Aguardando inicializacao...
timeout /t 5 /nobreak > nul

:: Abrir o navegador no endereço do Frontend
start http://localhost:5173

echo Aplicacao Pronta! Voce pode fechar esta janela se desejar.
exit
