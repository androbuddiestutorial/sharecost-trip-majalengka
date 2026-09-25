@echo off
title Sharecosttrip Admin Build Menu
color 0B

:: Setup Environment Variables
set "JAVA_HOME=E:\PROJECT\APLIKASI\CameraControl\.toolchain\jdk17\jdk-17.0.19+10"
set "ANDROID_HOME=E:\PROJECT\APLIKASI\CameraControl\.toolchain\android-sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;E:\PROJECT\APLIKASI\CameraControl\.toolchain\flutter\bin;%PATH%"

:MENU
cls
echo =======================================================
echo          SHARECOSTTRIP ADMIN BUILD MENU
echo =======================================================
echo.
echo 1. Clean Project ^& Pub Get (flutter clean ^& pub get)
echo 2. Build Release APK (android-arm64)
echo 3. Clean Build (clean + pub get + build - RECOMMENDED)
echo 4. Stop Gradle Daemon (Fix JVM crash / out of memory)
echo 5. Run Flutter Analyze
echo 6. Exit
echo.
set /p choice=Select option (1-6): 

if "%choice%"=="1" goto CLEAN
if "%choice%"=="2" goto BUILD
if "%choice%"=="3" goto CLEAN_BUILD
if "%choice%"=="4" goto STOP_GRADLE
if "%choice%"=="5" goto ANALYZE
if "%choice%"=="6" exit
goto MENU

:CLEAN
echo.
echo Cleaning project...
call flutter clean
call flutter pub get
echo.
pause
goto MENU

:BUILD
echo.
echo Building Release APK (target: android-arm64)...
call flutter build apk --release --target-platform android-arm64 --no-tree-shake-icons
echo.
echo APK can be found at: build\app\outputs\flutter-apk\app-release.apk
pause
goto MENU

:CLEAN_BUILD
echo.
echo === STEP 1/3: Cleaning project ===
call flutter clean
echo.
echo === STEP 2/3: Getting dependencies ===
call flutter pub get
echo.
echo === STEP 3/3: Building Release APK ===
call flutter build apk --release --target-platform android-arm64 --no-tree-shake-icons
echo.
echo =============================================
echo   Build complete! APK is ready at:
echo   build\app\outputs\flutter-apk\app-release.apk
echo =============================================
pause
goto MENU

:STOP_GRADLE
echo.
echo Stopping Gradle Daemon...
cd android
call gradlew.bat --stop
cd ..
echo.
pause
goto MENU

:ANALYZE
echo.
echo Running Flutter Analyze...
call flutter analyze
echo.
pause
goto MENU
