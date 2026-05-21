!include LogicLib.nsh
!include FileFunc.nsh
!include nsDialogs.nsh

!ifndef BUILD_UNINSTALLER
Var RegistrationEmail
Var RegistrationEmailInput

!macro customInit
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/EMAIL=" $RegistrationEmail
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
!macroend
