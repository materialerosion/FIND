# FIND - Formula Ingredient Navigator & Database

FIND is a web application for managing formula data with ingredient search and database management capabilities. It provides a secure platform for browsing and searching formula information with Microsoft Azure AD authentication.

## Features

- **Secure Authentication**: Microsoft Azure AD integration for user authentication
- **Formula Management**: Browse and view detailed formula information
- **Advanced Search**: Search formulas by ingredients, amounts, and other criteria
- **Database Management**: Tools for database maintenance and updates
- **Alias Management**: Create and manage ingredient aliases for improved search results

## Technology Stack

- **Frontend**: React with SCSS for styling
- **Backend**: Python Flask API
- **Authentication**: Microsoft Authentication Library (MSAL)
- **Deployment**: Azure Static Web Apps
- **CI/CD**: GitHub Actions workflow

## Authentication

This project uses the Microsoft Authentication Library (MSAL) for secure user authentication through Azure AD. Authentication is configured to:

- Show content only to authenticated users
- Change the navbar color when authenticated (black → blue)
- Handle login and logout operations securely
- Use environment variables and GitHub secrets for sensitive information

## Local Development

### Prerequisites

- Node.js (v14+)
- Python (v3.7+)
- Flask
- Azure AD application registration (for authentication)

### Setting Up the Client

1. **Navigate to the client directory**:
   ```
   cd client
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   
   Create a `.env` file in the client directory:
   ```
   # Azure AD Authentication Settings
   REACT_APP_AZURE_CLIENT_ID=your_client_id_here
   REACT_APP_AZURE_TENANT_ID=your_tenant_id_here
   
   # API configuration
   REACT_APP_API_URL=/api
   ```

4. **Start the development server**:
   ```
   npm run reactstart
   ```

### Setting Up the Server

1. **Navigate to the server directory**:
   ```
   cd server
   ```

2. **Create a virtual environment**:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```
   pip install -r requirements.txt
   ```

4. **Start the development server**:
   ```
   python app.py
   ```

## Deployment

The application is configured for CI/CD using GitHub Actions and Azure Static Web Apps:

### Automatic Deployment

Pushing changes to the `main` branch triggers the GitHub Actions workflow:
- Builds the client application
- Injects environment variables from GitHub secrets
- Deploys to Azure Static Web Apps

The workflow is defined in `.github/workflows/azure-static-web-apps-victorious-field-0dec9f70f.yml`.

### Environment Variables

In production, the application uses these automatically generated Azure secrets:
- `AZUREAPPSERVICE_CLIENTID_F73512DE711240C59AF542A31864A964` - Azure AD client ID
- `AZUREAPPSERVICE_TENANTID_3898B90B49C74CCD85EE50C92B8DBBFB` - Azure AD tenant ID

## Project Structure

```
FIND/
├── client/               # React frontend application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React context providers
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── styles/       # SCSS stylesheets
│   └── .env              # Environment variables (not in git)
├── server/               # Python Flask backend
│   ├── app.py            # Main application file
│   ├── models/           # Database models
│   └── requirements.txt  # Python dependencies
└── .github/
    └── workflows/        # GitHub Actions CI/CD configuration
```

## Security Notes

- Authentication secrets are managed through GitHub secrets and environment variables
- Local `.env` files should never be committed to version control
- All content is protected behind authentication
- API endpoints should implement proper authorization checks

## License

[MIT License](LICENSE)

## Contact

For questions or issues, please [open an issue](https://github.com/yourusername/FIND/issues) in this repository.