Dim WinSriptHost
Set WinScriptHost = CreateObject("WScript.Shell")
WinScriptHost.Run Chr(34) & "start.bat" & chr(34), 0
Set WinScriptHost = Nothing