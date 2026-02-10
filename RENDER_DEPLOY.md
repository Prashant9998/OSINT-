# Deploying to Render (Automated)

I have configured your repository for **automated deployment** using a `render.yaml` Blueprint. This makes deployment extremely simple.

## Steps to Deploy

1.  **Log in to Render**: Go to [dashboard.render.com](https://dashboard.render.com/).
2.  **Create New Blueprint**:
    *   Click on the **"New +"** button.
    *   Select **"Blueprint"**.
3.  **Connect Repository**:
    *   Connect your GitHub account if you haven't already.
    *   Select your repository: `Prashant9998/OSINT-`.
4.  **Deploy**:
    *   Render will automatically detect the `render.yaml` file.
    *   Click **"Apply"** or **"Create Services"**.
    *   Render will create:
        *   `osint-backend` (Web Service)
        *   `osint-frontend` (Web Service)
        *   `osint-db` (PostgreSQL Database)

## Environment Variables

The Blueprint automatically sets up the connection between the Frontend, Backend, and Database.

However, for the **Advanced OSINT features** to work, you need to manually add your API keys to the `osint-backend` service in the Render Dashboard:

1.  Go to **Dashboard** -> **osint-backend** -> **Environment**.
2.  Add the following variables:
    *   `SHODAN_API_KEY`
    *   `VIRUSTOTAL_API_KEY`
    *   `HUNTER_API_KEY`
    *   `SECURITYTRAILS_API_KEY`
    *   `URLSCAN_API_KEY`
    *   `ABSTRACT_API_KEY`
    *   `GREYNOISE_API_KEY`
    *   `GOOGLE_SAFE_BROWSING_KEY`
