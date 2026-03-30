Set WshShell = CreateObject("WScript.Shell")

' Inicia o Backend de forma invisível
WshShell.Run "cmd /c cd backend && mvnw.cmd spring-boot:run", 0, false

' Inicia o Frontend de forma invisível
WshShell.Run "cmd /c cd frontend && npm run dev", 0, false

' Loop para aguardar o backend estar pronto (Health Check)
ready = false
Do While ready = false
    On Error Resume Next
    Set xmlHttp = CreateObject("MSXML2.ServerXMLHTTP")
    xmlHttp.Open "GET", "http://localhost:8080/api/transactions", False
    xmlHttp.Send
    If xmlHttp.Status = 200 Then
        ready = true
    End If
    WScript.Sleep 1000 ' Espera 1 segundo antes de tentar de novo
Loop

' Abre o navegador apenas quando o banco responder
WshShell.Run "http://localhost:5173"
