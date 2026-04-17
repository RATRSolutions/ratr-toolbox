@echo off
start "Frontend" cmd /k "cd /d %USERPROFILE% && wsl bash /home/tom/projects/toolbox/start-frontend.sh"
start "Backend" cmd /k "cd /d %USERPROFILE% && wsl bash /home/tom/projects/toolbox/start-backend.sh"
