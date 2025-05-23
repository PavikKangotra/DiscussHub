@echo off
echo Setting up the Discussion Forum project...

echo Creating .env file in frontend directory
echo REACT_APP_API_URL=http://localhost:5000/api > frontend\.env
echo SKIP_PREFLIGHT_CHECK=true >> frontend\.env
echo TSC_COMPILE_ON_ERROR=true >> frontend\.env
echo ESLINT_NO_DEV_ERRORS=true >> frontend\.env
echo DISABLE_ESLINT_PLUGIN=true >> frontend\.env

echo Creating .env file in backend directory
echo PORT=5000 > backend\.env
echo MONGODB_URI=mongodb://localhost:27017/discussion-forum >> backend\.env
echo JWT_SECRET=mysupersecretkey >> backend\.env

echo Creating "node_modules" directories
mkdir frontend\node_modules
mkdir backend\node_modules

echo Project setup completed
echo.
echo To install dependencies, run:
echo - For frontend: cd frontend && npm install
echo - For backend: cd backend && npm install
echo.
echo Note: You might need to run PowerShell as Administrator with the following command:
echo Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
echo.
echo Then restart your terminal and try npm commands again. 