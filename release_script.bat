@echo off

REM Create releases directory if it doesn't exist
mkdir releases

REM Remove existing zip file if it exists
if exist releases\eventide-speech-mannerisms.zip (
    del releases\eventide-speech-mannerisms.zip
)

REM Compile files excluding src, node_modules, package.json, and .ignore
REM Assuming compilation involves copying files to a temp directory
set TEMP_DIR=%TEMP%\eventide_speech_mannerisms_temp
mkdir "%TEMP_DIR%"

REM Create a new directory for the release
mkdir "%TEMP_DIR%\eventide-speech-mannerisms"

REM Copy all files into the new directory
xcopy * "%TEMP_DIR%\eventide-speech-mannerisms\" /E /I /EXCLUDE:exclude.txt

REM Minify JavaScript files
node minify.js "%TEMP_DIR%\eventide-speech-mannerisms"

REM Remove existing zip file if it exists
if exist releases\eventide-speech-mannerisms.zip (
    del releases\eventide-speech-mannerisms.zip
)

REM Create the zip file in the releases folder
powershell -command "Compress-Archive -Path '%TEMP_DIR%\eventide-speech-mannerisms' -DestinationPath 'releases\eventide-speech-mannerisms.zip'"

REM Clean up the temporary directory
rmdir /S /Q "%TEMP_DIR%"
