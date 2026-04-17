@echo off
start "Frontend" cmd /k "wsl bash -c 'cd /home/tom/projects/toolbox/frontend && npm run dev'"
start "Backend" cmd /k "wsl bash -c 'cd /home/tom/projects/toolbox/backend && npm run dev'"
