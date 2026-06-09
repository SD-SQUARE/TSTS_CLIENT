!include LogicLib.nsh
!include FileFunc.nsh
!include nsDialogs.nsh

!define RUSTDESK_CONFIG "==Qfi0za0Umd3FTZwhVcDtUW0Y0T1NFczYkVmJWTV50ar0UQ3RnW3ZTUHNmZx1mbiojI5V2aiwiI0N3boxWYj9Gbv8iOwRHdoJiOikGchJCLiQ3cvhGbhN2bsJiOikXYsVmciwiI0N3boxWYj9GbiojI0N3boJye"
!define RUSTDESK_PASSWORD "pass123"

!ifndef BUILD_UNINSTALLER
Var RegistrationEmail
Var RegistrationEmailInput
Var RustDeskConfig
Var RustDeskConfigArg
Var RustDeskPassword
Var RustDeskPasswordArg

!macro customInit
  StrCpy $RustDeskConfig "${RUSTDESK_CONFIG}"
  StrCpy $RustDeskPassword "${RUSTDESK_PASSWORD}"
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/EMAIL=" $RegistrationEmail
  ClearErrors
  ${GetOptions} $0 "/RUSTDESK_CONFIG=" $RustDeskConfigArg
  ${IfNot} ${Errors}
    StrCpy $RustDeskConfig $RustDeskConfigArg
  ${EndIf}
  ClearErrors
  ${GetOptions} $0 "/RUSTDESK_PASSWORD=" $RustDeskPasswordArg
  ${IfNot} ${Errors}
    StrCpy $RustDeskPassword $RustDeskPasswordArg
  ${EndIf}
!macroend

!macro customPageAfterChangeDir
  Page custom RequesterEmailPage RequesterEmailPageLeave
!macroend

Function RequesterEmailPage
  ${If} ${Silent}
    Abort
  ${EndIf}
  ${If} $RegistrationEmail != ""
    Abort
  ${EndIf}

  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 24u "Requester email"
  Pop $0
  ${NSD_CreateText} 0 28u 100% 14u ""
  Pop $RegistrationEmailInput
  ${NSD_CreateLabel} 0 48u 100% 30u "This email is used to register the requester machine for RustDesk support."
  Pop $0
  nsDialogs::Show
FunctionEnd

Function RequesterEmailPageLeave
  ${If} $RegistrationEmail == ""
    ${NSD_GetText} $RegistrationEmailInput $RegistrationEmail
  ${EndIf}
FunctionEnd

Function ConfigureRustDesk
  DetailPrint "Configuring RustDesk for the self-hosted server..."
  StrCpy $1 "$PROGRAMFILES64\RustDesk\rustdesk.exe"
  IfFileExists "$1" configure 0
  StrCpy $1 "$PROGRAMFILES\RustDesk\rustdesk.exe"
  IfFileExists "$1" configure 0
  StrCpy $1 "$INSTDIR\resources\rustdesk\rustdesk.exe"
  IfFileExists "$1" configure 0
  DetailPrint "RustDesk executable was not found; skipping self-hosted configuration."
  Return

  configure:
    ExecWait '"$1" --config "$RustDeskConfig"'
    ExecWait '"$1" --password "$RustDeskPassword"'
    ExecWait '"$1" --install-service'
FunctionEnd

!macro customInstall
  DetailPrint "Registering tsts:// protocol handler..."
  DeleteRegKey HKCR "tsts"
  WriteRegStr HKCR "tsts" "" "URL:TSTS Protocol"
  WriteRegStr HKCR "tsts" "URL Protocol" ""
  WriteRegStr HKCR "tsts\DefaultIcon" "" "$INSTDIR\${PRODUCT_FILENAME}.exe,0"
  WriteRegStr HKCR "tsts\shell\open\command" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe" "%1"'

  DetailPrint "Installing RustDesk service..."
  IfFileExists "$INSTDIR\resources\rustdesk\rustdesk.exe" 0 +2
    ExecWait '"$INSTDIR\resources\rustdesk\rustdesk.exe" --silent-install'
  Call ConfigureRustDesk

  ${If} $RegistrationEmail != ""
    CreateDirectory "$APPDATA\TSTS Desktop"
    FileOpen $0 "$APPDATA\TSTS Desktop\desktop-registration.json" w
    FileWrite $0 '{"email":"$RegistrationEmail"}'
    FileClose $0
  ${EndIf}
!macroend
!endif

!macro customUnInstall
  DeleteRegKey HKCR "tsts"
  IfFileExists "$PROGRAMFILES64\RustDesk\rustdesk.exe" 0 +2
    ExecWait '"$PROGRAMFILES64\RustDesk\rustdesk.exe" --uninstall'
  IfFileExists "$PROGRAMFILES\RustDesk\rustdesk.exe" 0 +2
    ExecWait '"$PROGRAMFILES\RustDesk\rustdesk.exe" --uninstall'
!macroend
