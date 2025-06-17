; Custom NSIS installer script for Royal Multi Gamers Launcher
; This ensures all dependencies are properly installed

!macro customInstall
  ; Create application data directory
  CreateDirectory "$APPDATA\Royal Multi Gamers Launcher"
  
  ; Set permissions for the application directory
  AccessControl::GrantOnFile "$INSTDIR" "(BU)" "GenericRead"
  AccessControl::GrantOnFile "$INSTDIR" "(BU)" "GenericExecute"
  
  ; Register file associations if needed
  WriteRegStr HKCR ".gal" "" "RoyalMultiGamersLauncher"
  WriteRegStr HKCR "RoyalMultiGamersLauncher" "" "Royal Multi Gamers Launcher File"
  WriteRegStr HKCR "RoyalMultiGamersLauncher\shell\open\command" "" '"$INSTDIR\Royal Multi Gamers Launcher.exe" "%1"'
!macroend

!macro customUnInstall
  ; Clean up registry entries
  DeleteRegKey HKCR ".gal"
  DeleteRegKey HKCR "RoyalMultiGamersLauncher"
  
  ; Remove application data directory
  RMDir /r "$APPDATA\Royal Multi Gamers Launcher"
!macroend
