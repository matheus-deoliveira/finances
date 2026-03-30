Set WshShell = CreateObject("WScript.Shell")

' Função para verificar se a porta do servidor está ativa
Function IsServerRunning(url)
    On Error Resume Next
    Set xmlHttp = CreateObject("MSXML2.ServerXMLHTTP")
    xmlHttp.Open "GET", url, False
    xmlHttp.Send
    If Err.Number = 0 Then
        IsServerRunning = (xmlHttp.Status = 200)
    Else
        IsServerRunning = False
    End If
    On Error GoTo 0
End Function

' Verifica se o backend já está rodando
If Not IsServerRunning("http://localhost:8080/api/transactions") Then
    ' Se NÃO estiver rodando, inicia tudo
    WshShell.Run "cmd /c cd backend && mvnw.cmd spring-boot:run", 0, false
    WshShell.Run "cmd /c cd frontend && npm run dev", 0, false
    
    ' Aguarda o banco de dados estar pronto
    ready = false
    Do While ready = false
        WScript.Sleep 1000
        If IsServerRunning("http://localhost:8080/api/transactions") Then
            ready = true
        End If
    Loop
End If

' Se já estiver rodando ou acabou de ligar, apenas abre o navegador
WshShell.Run "http://localhost:5173"
