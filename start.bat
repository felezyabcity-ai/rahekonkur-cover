@echo off
chcp 65001 >nul
title سازنده کاور وردپرس و مقایسه اساتید
cd /d "%~dp0"

echo ===================================================================
echo     سازنده حرفه‌ای کاور وردپرس و مقایسه اساتید
echo ===================================================================
echo.
echo در حال آماده‌سازی و راه‌اندازی برنامه... لطفاً صبر کنید.
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [هشدار] نرم‌افزار Node.js روی سیستم شما یافت نشد.
    echo.
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        echo پایتون روی ویندوز شناسایی شد! در حال اجرای برنامه با پایتون...
        start "" http://localhost:3000/dist/
        python -m http.server 3000
        goto end
    )
    echo برای اجرای پروژه نیاز به Node.js دارید.
    echo می‌توانید Node.js را رایگان از سایت زیر نصب کنید:
    echo https://nodejs.org/
    echo.
    echo پس از نصب Node.js، مجدداً همین فایل start.bat را باز کنید.
    echo.
    pause
    exit /b 1
)

:: 2. Check and install dependencies if needed
if not exist node_modules (
    echo [مرحله ۱ از ۲] بسته‌های پروژه برای اولین بار در حال نصب هستند (npm install)...
    echo لطفاً ۱ الی ۲ دقیقه صبور باشید...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [تلاش دوم] در حال نصب با دستور اجباری...
        call npm install --force
    )
) else (
    echo [مرحله ۱ از ۲] بسته‌های برنامه قبلاً نصب شده‌اند.
)

echo.
echo [مرحله ۲ از ۲] در حال اجرای برنامه و باز کردن مرورگر...
echo.
echo ===================================================================
echo  برنامه در آدرس http://localhost:3000 در مرورگر شما باز خواهد شد.
echo  برای توقف برنامه، این پنجره را ببندید.
echo ===================================================================
echo.

:: Open browser automatically after 2 seconds
start "" http://localhost:3000

:: Start Dev Server
call npm run dev

:end
pause
