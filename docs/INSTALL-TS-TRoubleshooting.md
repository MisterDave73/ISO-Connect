# Troubleshooting npm install EBUSY on Windows (PowerShell steps)

Purpose
-------
When running `npm install` in the `app/` folder you may encounter an EBUSY / resource busy error removing a transient `.tailwindcss-*` folder under `node_modules`. This file shows safe, repeatable PowerShell steps to diagnose and resolve the issue on Windows so `npm install` can complete.

Important notes
---------------
- Run these commands from an elevated PowerShell (Run as Administrator) for best results.
- Execute steps in order and confirm the result of each step before proceeding.
- If you are uncomfortable running any destructive command, choose the interactive option and I'll guide you instead.

Paths used in these examples
----------------------------
Repository root (example):
D:\QMS Pro Kit\qms-pro-ui-kit\ISO-Connect\app

Adjust the path if your repo lives elsewhere.

Step A — open elevated PowerShell and change to the app folder
--------------------------------------------------------------
Run in an elevated PowerShell window:

cd "D:\QMS Pro Kit\qms-pro-ui-kit\ISO-Connect\app"

Step B — stop Node / npm processes (safe)
-----------------------------------------
Stop common processes that can hold file handles:

Stop-Process -Name node,npm -Force -ErrorAction SilentlyContinue

Step C — list suspect `.tailwindcss-*` directories
-------------------------------------------------
Find the transient Tailwind-generated directories that are often locked:

Get-ChildItem -Path .\node_modules -Directory -Filter '.tailwindcss-*' -ErrorAction SilentlyContinue | Select-Object FullName,LastWriteTime

If nothing is returned, there are no such folders.

Step D — try removing the target folder(s)
-------------------------------------------
If Step C lists folders, try removing them now:

Get-ChildItem -Path .\node_modules -Directory -Filter '.tailwindcss-*' -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host "Removing: $($_.FullName)"
  Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop
}

- If Remove-Item works: go to Step G (fresh install).
- If Remove-Item fails with EBUSY / Access Denied, continue.

Step E — take ownership and grant permissions (if Remove-Item fails)
--------------------------------------------------------------------
Run as Administrator:

# Take ownership (recursively)
takeown /F "D:\QMS Pro Kit\qms-pro-ui-kit\ISO-Connect\app\node_modules\.tailwindcss-*" /R /A

# Grant full control to current user
icacls "D:\QMS Pro Kit\qms-pro-ui-kit\ISO-Connect\app\node_modules\.tailwindcss-*" /grant "%USERNAME%:F" /T

Then retry the Remove-Item loop from Step D.

Step F — if the folder remains locked, find the locking process
---------------------------------------------------------------
Option 1 — Sysinternals handle.exe (recommended)
1. Download handle.exe: https://learn.microsoft.com/en-us/sysinternals/downloads/handle
2. Open an elevated Command Prompt and run:
   handle.exe -a ".tailwindcss"

This prints processes holding handles. For each PID shown, you can kill the process with:

taskkill /PID <pid> /F

Option 2 — Process Explorer (GUI)
1. Download Process Explorer: https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer
2. Run as Administrator, press Ctrl+F, search for ".tailwindcss" or the locked path, note the process, and close it or right-click -> Kill Process.

Notes:
- Sometimes antivirus or an editor extension locks files. Temporarily disabling AV or closing VS Code can help.
- If a system service holds the handle and cannot be stopped safely, a reboot will clear the handle.

Step G — clean npm state and install
-------------------------------------
Once the locked folder is removed and there are no blocking processes, perform a clean install.

Option G1 — conservative (recommended):
# Ensure you are in the app directory
cd "D:\QMS Pro Kit\qms-pro-ui-kit\ISO-Connect\app"

# Install dependencies and generate package-lock.json
npm install

Option G2 — clean (if you want a fresh start):
Remove node_modules entirely then install (be careful — this deletes node_modules):

Remove-Item -LiteralPath .\node_modules -Recurse -Force
npm install

Step H — verify presence of `next` binary and lockfile
------------------------------------------------------
After install finishes:

# Check package-lock
Test-Path .\package-lock.json

# Check next binary (should exist after successful install)
Test-Path .\node_modules\.bin\next

Step I — start the dev server
-----------------------------
When install completes successfully, start the dev server:

npm run dev

Common causes and additional tips
---------------------------------
- VS Code / extensions with file watchers can hold files. Close VS Code windows if removal fails.
- Windows Defender or other AV can lock files. Exclude the repo folder temporarily or pause AV while performing removal.
- Long path / spaces: PowerShell and Windows handle the provided quoted paths, but if you run into path issues try using the short path (8.3) or move the repo to a simpler path temporarily.
- If repeated attempts fail, a system reboot usually clears persistent handles.

If you want me to execute these steps now from this environment:
- I can run them here (stop processes, remove the folder, run `npm install`) — say YES to authorize me to perform the removal & install in the project (I'll run the commands and report results).
- Or choose NO and run the steps locally yourself; tell me results and I'll continue.

Safety & audit
--------------
- Commands shown that delete files are limited to `node_modules` transient folders and `node_modules` itself if you explicitly request a full clean. I will not run these destructive commands without your approval.
