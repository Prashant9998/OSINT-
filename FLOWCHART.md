# 🔄 OSINT Platform Architecture Flowchart

```mermaid
graph TD
    %% Nodes
    User([User])
    FE[Frontend Next.js]
    API[Backend API FastAPI]
    Auth[Auth & Rate Limiter]
    DB[(SQLite/Postgres Database)]
    
    %% OSINT Modules
    subgraph Modules [OSINT Intelligence Modules]
        Domain[Domain Intel WHOIS/DNS]
        Tech[Tech Stack Wappalyzer]
        Social[Username & Social Media]
        Email[Email & Breach Data]
        Phone[Phone Intel Veriphone]
        Infra[Infrastructure Shodan/VT]
    end
    
    %% Analysis Layer
    subgraph Analysis [Analysis Engine]
        Correlator[Intelligence Correlator]
        Risk[Risk Scoring Engine]
        Surface[Attack Surface Mapper]
    end
    
    %% Reporting
    subgraph Reporting [Report Generation]
        PDF[PDF Generator ReportLab]
    end

    %% Flow
    User -- "1. Initiates Scan" --> FE
    FE -- "2. POST /api/v1/scan" --> API
    
    API -- "3. Verify Key & Limit" --> Auth
    Auth -- "4. Authorized" --> API
    
    API -- "5. Dispatch Scan Task" --> Modules
    
    %% Module Execution
    Modules -- "6. Raw Data" --> Correlator
    
    %% Correlation Flow
    Correlator -- "7. Normalize Data" --> Risk
    Risk -- "8. Calculate Score" --> Surface
    Surface -- "9. Map Attack Vectors" --> Correlator
    
    Correlator -- "10. Correlated Results" --> DB
    
    %% Response Flow
    DB -- "11. Save Result" --> API
    API -- "12. Scan Complete JSON" --> FE
    FE -- "13. Display Dashboard" --> User
    
    %% Reporting Flow
    User -- "14. Download Report" --> FE
    FE -- "15. GET /scan/{id}/report" --> API
    API -- "16. Fetch Data" --> DB
    DB -- "17. Return Result" --> API
    API -- "18. Generate PDF" --> PDF
    PDF -- "19. PDF File" --> API
    API -- "20. Download" --> FE
```

## 📝 Detailed Data Flow

1.  **Initiation**: The user enters a target (e.g., `example.com`, `+1234567890`) in the Next.js Frontend.
2.  **API Request**: The Frontend sends a secure POST request to the FastAPI Backend, including the API Key.
3.  **Security Check**: The Backend verifies the API Key and checks Rate Limits (e.g., 5 req/min) via `slowapi`.
4.  **Module Dispatch**: Based on the `scan_type` (domain, phone, username), the backend triggers specific **OSINT Modules** in parallel using `asyncio`.
    *   *Domain Intel*: Fetches WHOIS, DNS records, and subdomains (crt.sh).
    *   *Phone Intel*: Validates number and carrier info via Veriphone.
    *   *Infrastructure*: Checks IP reputation (VirusTotal) and open ports (Shodan).
5.  **Correlation**: Collected raw data is sent to the **Analysis Engine**.
    *   *Risk Scoring*: AI logic calculates a risk score (0-100) based on open ports, vulnerabilities, and exposed emails.
    *   *Attack Surface*: Identifies critical weak points (e.g., "Exposed Admin Panel", "Leaked Credentials").
6.  **Storage**: The final structured JSON result is saved to the SQLite/PostgreSQL database.
7.  **Visualization**: The Frontend receives the JSON and renders the **Interactive Dashboard** with graphs and alerts.
8.  **Reporting**: When the user clicks "Download Report", the **Report Generator** fetches the stored data, uses `ReportLab` to draw a professional PDF, and streams it back to the user.
