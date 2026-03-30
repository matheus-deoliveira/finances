@echo off
echo Encerrando Gerenciador Financeiro...
taskkill /f /im java.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo Tudo pronto! O sistema foi desligado.
timeout /t 2
exit
