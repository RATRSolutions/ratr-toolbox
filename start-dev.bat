@echo off
start "Frontend" cmd /k "wsl bash /home/tom/projects/toolbox/start-frontend.sh"
start "Backend" cmd /k "wsl bash /home/tom/projects/toolbox/start-backend.sh"
