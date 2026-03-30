Set WshShell = CreateObject("WScript.Shell")

' Inicia o Backend de forma invisível
WshShell.Run "cmd /c cd backend && mvnw.cmd spring-boot:run", 0, false

' Inicia o Frontend de forma invisível
WshShell.Run "cmd /c cd frontend && npm run dev", 0, false

' Aguarda 5 segundos para o servidor subir
WScript.Sleep 5000

' Abre o navegador no endereço do app
WshShell.Run "http://localhost:5173"
