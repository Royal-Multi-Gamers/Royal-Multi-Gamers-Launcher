!macro NSIS_HOOK_PREINSTALL
  DetailPrint "Recherche d'une version Microsoft Store existante..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Get-AppxPackage -Name \"RoyalMultiGamers.RoyalMultiGamersLauncher\" | Remove-AppxPackage -ErrorAction SilentlyContinue"'
  Pop $0
!macroend
