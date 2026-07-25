@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Central InkVortex API - Selecao de Motor v9.0
set "INKVORTEX_ROOT=%~dp0"
if not exist "%INKVORTEX_ROOT%fonts" mkdir "%INKVORTEX_ROOT%fonts" >nul 2>nul
if not exist "%INKVORTEX_ROOT%palco" mkdir "%INKVORTEX_ROOT%palco" >nul 2>nul
if not exist "%INKVORTEX_ROOT%galeria" mkdir "%INKVORTEX_ROOT%galeria" >nul 2>nul
if not exist "%INKVORTEX_ROOT%gpt" mkdir "%INKVORTEX_ROOT%gpt" >nul 2>nul
if not exist "%INKVORTEX_ROOT%gemini" mkdir "%INKVORTEX_ROOT%gemini" >nul 2>nul
if not exist "%INKVORTEX_ROOT%flow" mkdir "%INKVORTEX_ROOT%flow" >nul 2>nul
if not exist "%INKVORTEX_ROOT%logo-inkvortex" mkdir "%INKVORTEX_ROOT%logo-inkvortex" >nul 2>nul
for %%D in (4x5 9x16 video capa) do (
  if exist "%INKVORTEX_ROOT%%%D" rmdir /s /q "%INKVORTEX_ROOT%%%D" >nul 2>nul
)
for %%F in ("%INKVORTEX_ROOT%SCRIPT-MESTRE-INKVORTEX-v*.txt") do (
  if exist "%%~fF" if /I not "%%~nxF"=="SCRIPT-MESTRE-INKVORTEX-v9.0.txt" del /q "%%~fF" >nul 2>nul
)
cd /d "%INKVORTEX_ROOT%api-server"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nao foi encontrado neste computador.
  echo Instale o Node.js LTS em https://nodejs.org e rode este arquivo novamente.
  echo.
  pause
  exit /b 1
)

call :read_env
echo.
echo Verificando instancia local InkVortex...
node "%INKVORTEX_ROOT%api-server\inkvortex-runtime.js" stop-old --port 8787 --version 9.0
if errorlevel 1 (
  echo.
  echo A Central nao foi iniciada para proteger a porta local.
  pause
  exit /b 1
)

echo.
echo ===================================================
echo     CENTRAL INKVORTEX V9 - MOTOR MISTRAL AI
echo ===================================================
echo Iniciando boot do sistema...

set "ACTIVE_PROVIDER=mistral"
if "!CURRENT_MISTRAL_MODEL!"=="" set "CURRENT_MISTRAL_MODEL=mistral-large-latest"
goto finalize

:finalize
call :write_env
echo.
echo Iniciando servidor InkVortex 9.0...
node "%INKVORTEX_ROOT%api-server\server.js"
if errorlevel 1 (
  echo.
  echo O servidor parou inesperadamente.
  pause
  exit /b 1
)
echo.
exit /b 0

:read_env
set "CURRENT_GEMINI_KEY="
set "CURRENT_GEMINI_MODEL="
set "CURRENT_MISTRAL_KEY="
set "CURRENT_MISTRAL_KEY_2="
set "CURRENT_MISTRAL_MODEL="
set "MISTRAL_MODEL_CREATIVE_VALUE="
set "MISTRAL_MODEL_REASONING_VALUE="
set "MISTRAL_MODEL_FAST_VALUE="
set "MISTRAL_MODEL_THEMES_VALUE="
set "MISTRAL_MODEL_SCENES45_VALUE="
set "MISTRAL_MODEL_SCENES916_VALUE="
set "MISTRAL_MODEL_CAPTION_VALUE="
set "MISTRAL_API_URL_VALUE="
if exist ".env" (
  for /f "tokens=1,* delims==" %%A in (.env) do (
    if /I "%%A"=="GEMINI_API_KEY" set "CURRENT_GEMINI_KEY=%%B"
    if /I "%%A"=="GEMINI_MODEL" set "CURRENT_GEMINI_MODEL=%%B"
    if /I "%%A"=="MISTRAL_API_KEY" set "CURRENT_MISTRAL_KEY=%%B"
    if /I "%%A"=="MISTRAL_API_KEY_2" set "CURRENT_MISTRAL_KEY_2=%%B"
    if /I "%%A"=="MISTRAL_MODEL" set "CURRENT_MISTRAL_MODEL=%%B"
    if /I "%%A"=="MISTRAL_MODEL_CREATIVE" set "MISTRAL_MODEL_CREATIVE_VALUE=%%B"
    if /I "%%A"=="MISTRAL_MODEL_REASONING" set "MISTRAL_MODEL_REASONING_VALUE=%%B"
    if /I "%%A"=="MISTRAL_MODEL_FAST" set "MISTRAL_MODEL_FAST_VALUE=%%B"
    if /I "%%A"=="MISTRAL_MODEL_THEMES" set "MISTRAL_MODEL_THEMES_VALUE=%%B"
    if /I "%%A"=="MISTRAL_MODEL_SCENES45" set "MISTRAL_MODEL_SCENES45_VALUE=%%B"
    if /I "%%A"=="MISTRAL_MODEL_SCENES916" set "MISTRAL_MODEL_SCENES916_VALUE=%%B"
    if /I "%%A"=="MISTRAL_MODEL_CAPTION" set "MISTRAL_MODEL_CAPTION_VALUE=%%B"
    if /I "%%A"=="MISTRAL_API_URL" set "MISTRAL_API_URL_VALUE=%%B"
  )
)
exit /b 0

:write_env
> ".env" echo AI_PROVIDER=!ACTIVE_PROVIDER!
>> ".env" echo GEMINI_API_KEY=!CURRENT_GEMINI_KEY!
>> ".env" echo GEMINI_MODEL=!CURRENT_GEMINI_MODEL!
if not "!CURRENT_MISTRAL_KEY!"=="" >> ".env" echo MISTRAL_API_KEY=!CURRENT_MISTRAL_KEY!
if not "!CURRENT_MISTRAL_KEY_2!"=="" >> ".env" echo MISTRAL_API_KEY_2=!CURRENT_MISTRAL_KEY_2!
if not "!CURRENT_MISTRAL_MODEL!"=="" >> ".env" echo MISTRAL_MODEL=!CURRENT_MISTRAL_MODEL!
if not "!MISTRAL_MODEL_CREATIVE_VALUE!"=="" >> ".env" echo MISTRAL_MODEL_CREATIVE=!MISTRAL_MODEL_CREATIVE_VALUE!
if not "!MISTRAL_MODEL_REASONING_VALUE!"=="" >> ".env" echo MISTRAL_MODEL_REASONING=!MISTRAL_MODEL_REASONING_VALUE!
if not "!MISTRAL_MODEL_FAST_VALUE!"=="" >> ".env" echo MISTRAL_MODEL_FAST=!MISTRAL_MODEL_FAST_VALUE!
if not "!MISTRAL_MODEL_THEMES_VALUE!"=="" >> ".env" echo MISTRAL_MODEL_THEMES=!MISTRAL_MODEL_THEMES_VALUE!
if not "!MISTRAL_MODEL_SCENES45_VALUE!"=="" >> ".env" echo MISTRAL_MODEL_SCENES45=!MISTRAL_MODEL_SCENES45_VALUE!
if not "!MISTRAL_MODEL_SCENES916_VALUE!"=="" >> ".env" echo MISTRAL_MODEL_SCENES916=!MISTRAL_MODEL_SCENES916_VALUE!
if not "!MISTRAL_MODEL_CAPTION_VALUE!"=="" >> ".env" echo MISTRAL_MODEL_CAPTION=!MISTRAL_MODEL_CAPTION_VALUE!
if not "!MISTRAL_API_URL_VALUE!"=="" >> ".env" echo MISTRAL_API_URL=!MISTRAL_API_URL_VALUE!
>> ".env" echo PORT=8787
>> ".env" echo OPEN_BROWSER=1
>> ".env" echo GEMINI_MAX_OUTPUT_TOKENS=65536
>> ".env" echo MISTRAL_MAX_OUTPUT_TOKENS=65536
exit /b 0
