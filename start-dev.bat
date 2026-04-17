@echo off
start "Frontend" cmd /k "wsl --cd /home/tom/projects/toolbox/frontend npm run dev"
start "Backend" cmd /k "wsl --cd /home/tom/projects/toolbox/backend npm run dev"
