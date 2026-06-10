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
Var EmailValidationResult
Var EmailValidationIndex
Var EmailValidationLength
Var EmailValidationChar
Var EmailAtCount
Var EmailDotAfterAt
Var EmailLastIndex
Var RustDeskExePath

!macro customInit
  StrCpy $RustDeskConfig "${RUSTDESK_CONFIG}"
  StrCpy $RustDeskPassword "${RUSTDESK_PASSWORD}"
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/EMAIL=" $RegistrationEmail
  ${If} $RegistrationEmail != ""
    Call EnsureValidRegistrationEmail
  ${EndIf}
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
  Page custom UserEmailPage UserEmailPageLeave
!macroend

Function UserEmailPage
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

  ${NSD_CreateLabel} 0 0 100% 24u "User email (required)"
  Pop $0
  ${NSD_CreateText} 0 28u 100% 14u ""
  Pop $RegistrationEmailInput
  ${NSD_CreateLabel} 0 48u 100% 30u "This email is validated and used to register the user machine for RustDesk support."
  Pop $0
  nsDialogs::Show
FunctionEnd

Function UserEmailPageLeave
  ${If} $RegistrationEmail == ""
    ${NSD_GetText} $RegistrationEmailInput $RegistrationEmail
  ${EndIf}
  Call EnsureValidRegistrationEmail
FunctionEnd

Function ValidateRegistrationEmail
  StrCpy $EmailValidationResult "0"
  StrLen $EmailValidationLength $RegistrationEmail
  ${If} $EmailValidationLength < 5
    Return
  ${EndIf}

  StrCpy $EmailValidationIndex 0
  StrCpy $EmailAtCount 0
  StrCpy $EmailDotAfterAt 0

  email_validation_loop:
    ${If} $EmailValidationIndex >= $EmailValidationLength
      Goto email_validation_done
    ${EndIf}

    StrCpy $EmailValidationChar $RegistrationEmail 1 $EmailValidationIndex
    ${If} $EmailValidationChar == " "
      Return
    ${EndIf}

    ${If} $EmailValidationChar == "@"
      IntOp $EmailAtCount $EmailAtCount + 1
      ${If} $EmailValidationIndex == 0
        Return
      ${EndIf}
      IntOp $EmailLastIndex $EmailValidationLength - 1
      ${If} $EmailValidationIndex >= $EmailLastIndex
        Return
      ${EndIf}
    ${ElseIf} $EmailValidationChar == "."
      ${If} $EmailAtCount > 0
        IntOp $EmailLastIndex $EmailValidationLength - 1
        ${If} $EmailValidationIndex >= $EmailLastIndex
          Return
        ${EndIf}
        StrCpy $EmailDotAfterAt 1
      ${EndIf}
    ${EndIf}

    IntOp $EmailValidationIndex $EmailValidationIndex + 1
    Goto email_validation_loop

  email_validation_done:
    ${If} $EmailAtCount == 1
    ${AndIf} $EmailDotAfterAt == 1
      StrCpy $EmailValidationResult "1"
    ${EndIf}
FunctionEnd

Function EnsureValidRegistrationEmail
  Call ValidateRegistrationEmail
  ${If} $EmailValidationResult != "1"
    ${If} ${Silent}
      DetailPrint "Invalid user email. Use /EMAIL=user@example.com."
    ${Else}
      MessageBox MB_ICONEXCLAMATION|MB_OK "Enter a valid user email address."
    ${EndIf}
    Abort
  ${EndIf}
FunctionEnd

Function ResolveRustDeskPath
  StrCpy $RustDeskExePath ""
  StrCpy $1 "$PROGRAMFILES64\RustDesk\rustdesk.exe"
  IfFileExists "$1" 0 +3
    StrCpy $RustDeskExePath "$1"
    Return
  StrCpy $1 "$PROGRAMFILES\RustDesk\rustdesk.exe"
  IfFileExists "$1" 0 +3
    StrCpy $RustDeskExePath "$1"
    Return
  StrCpy $1 "$LOCALAPPDATA\rustdesk\rustdesk.exe"
  IfFileExists "$1" 0 +3
    StrCpy $RustDeskExePath "$1"
    Return
  StrCpy $1 "$INSTDIR\resources\rustdesk\rustdesk.exe"
  IfFileExists "$1" 0 +3
    StrCpy $RustDeskExePath "$1"
    Return
FunctionEnd

Function InstallBundledRustDesk
  DetailPrint "Installing bundled RustDesk client..."
  IfFileExists "$INSTDIR\resources\rustdesk\rustdesk.exe" 0 done
    CreateDirectory "$LOCALAPPDATA\rustdesk"
    CopyFiles /SILENT "$INSTDIR\resources\rustdesk\*.*" "$LOCALAPPDATA\rustdesk\"
    ExecWait '"$INSTDIR\resources\rustdesk\rustdesk.exe" --silent-install'
  done:
FunctionEnd

Function RegisterRustDeskProtocol
  Call ResolveRustDeskPath
  ${If} $RustDeskExePath == ""
    DetailPrint "RustDesk executable was not found; skipping rustdesk:// protocol registration."
    Return
  ${EndIf}

  DetailPrint "Registering rustdesk:// protocol handler..."
  DeleteRegKey HKCR "rustdesk"
  WriteRegStr HKCR "rustdesk" "" "URL:RustDesk Protocol"
  WriteRegStr HKCR "rustdesk" "URL Protocol" ""
  WriteRegStr HKCR "rustdesk\DefaultIcon" "" "$RustDeskExePath,0"
  WriteRegStr HKCR "rustdesk\shell\open\command" "" '"$RustDeskExePath" "%1"'
FunctionEnd

Function ConfigureRustDesk
  DetailPrint "Configuring RustDesk for the self-hosted server..."
  Call ResolveRustDeskPath
  ${If} $RustDeskExePath != ""
    Goto configure
  ${EndIf}
  DetailPrint "RustDesk executable was not found; skipping self-hosted configuration."
  Return

  configure:
    ExecWait '"$RustDeskExePath" --config "$RustDeskConfig"'
    ExecWait '"$RustDeskExePath" --password "$RustDeskPassword"'
    ExecWait '"$RustDeskExePath" --install-service'
FunctionEnd

!macro customInstall
  Call EnsureValidRegistrationEmail

  DetailPrint "Registering tsts:// protocol handler..."
  DeleteRegKey HKCR "tsts"
  WriteRegStr HKCR "tsts" "" "URL:TSTS Protocol"
  WriteRegStr HKCR "tsts" "URL Protocol" ""
  WriteRegStr HKCR "tsts\DefaultIcon" "" "$INSTDIR\${PRODUCT_FILENAME}.exe,0"
  WriteRegStr HKCR "tsts\shell\open\command" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe" "%1"'

  Call InstallBundledRustDesk
  Call ConfigureRustDesk
  Call RegisterRustDeskProtocol

  CreateDirectory "$APPDATA\TSTS Desktop"
  FileOpen $0 "$APPDATA\TSTS Desktop\desktop-registration.json" w
  FileWrite $0 '{"email":"$RegistrationEmail"}'
  FileClose $0
!macroend
!endif

!macro customUnInstall
  DeleteRegKey HKCR "tsts"
  DeleteRegKey HKCR "rustdesk"
  IfFileExists "$PROGRAMFILES64\RustDesk\rustdesk.exe" 0 +2
    ExecWait '"$PROGRAMFILES64\RustDesk\rustdesk.exe" --uninstall'
  IfFileExists "$PROGRAMFILES\RustDesk\rustdesk.exe" 0 +2
    ExecWait '"$PROGRAMFILES\RustDesk\rustdesk.exe" --uninstall'
!macroend
