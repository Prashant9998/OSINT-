# Deployment Guide for Railway

This guide details how to deploy the OSINT Platform to [Railway](https://railway.app/).

## Prerequisites

1.  A [GitHub](https://github.com/) account with this repository pushed.
2.  A [Railway](https://railway.app/) account.

## Steps

### 1. Create a New Project on Railway

1.  Log in to Railway.
2.  Click **"New Project"**.
3.  Select **"Deploy from GitHub repo"**.
4.  Choose your repository (`OSINT-`).
5.  Click **"Deploy Now"**.

### 2. Configure the Backend Service

Railway will likely detect the repository and create a service. We need to configure it specifically for the backend.

1.  Click on the card for your service (it might be named after your repo).
2.  Go to **"Settings"**.
3.  **Root Directory**: Set this to `/backend`.
4.  **Build Command**: Ensure it is empty (or `pip install -r requirements.txt`, which Railway does automatically for Python).
5.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6.  Go to **"Variables"**.
7.  Add the following variables:
    *   `Allowed_ORIGINS`: `*` (or your frontend URL once deployed)
    *   `SECRET_KEY`: Generate a random string.
    *   `API_KEY`: Set your desired API key.

### 3. Add a Database (PostgreSQL)

1.  In your project check, click **"New"** -> **"Database"** -> **"Add PostgreSQL"**.
2.  Railway will create a PostgreSQL instance.
3.  Once created, click on the **PostgreSQL** card.
4.  Go to **"Variables"**.
5.  Copy the `DATABASE_URL`.
6.  Go back to your **Backend Service** -> **Variables**.
7.  Railway usually auto-injects `DATABASE_URL` into connected services. Verify it is there. If not, add it manually.
    *   *Note: Our code automatically handles the `postgres://` vs `postgresql+asyncpg://` conversion.*

### 4. Configure the Frontend Service

Since this is a monorepo, we need a separate service for the frontend.

1.  In your project view, click **"New"** -> **"GitHub Repo"**.
2.  Select the **SAME repository** again.
3.  Click on the new service card.
4.  Go to **"Settings"**.
5.  **Root Directory**: Set this to `/frontend`.
6.  **Build Command**: `npm run build`
7.  **Start Command**: `npm start`
8.  Go to **"Variables"**.
9.  Add the following variables:
    *   `NEXT_PUBLIC_API_URL`: The URL of your **Backend Service** (e.g., `https://backend-production.up.railway.app`). You can find this in the Backend Service -> Settings -> Networking -> Public Domain.
    *   `NEXT_PUBLIC_API_KEY`: The same API key you set in the backend.

### 5. Finalize

1.  Railway will redeploy both services.
2.  Visit your Frontend URL (found in Frontend Service -> Settings -> Networking).
3.  Test the tool!

## Troubleshooting

*   **Database Connection Failed**: Check the `DATABASE_URL` variable in the backend service.
*   **CORS Errors**: Ensure `ALLOWED_ORIGINS` in the backend matches your frontend URL.
*   **Build Fails**: Check the logs. Ensure `requirements.txt` (backend) and `package.json` (frontend) are correct.
