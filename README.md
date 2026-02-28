# Car Rental System
## Prerequisites

You need three things installed before running this project:

1. **.NET 10 SDK** (or later)
2. **Aspire CLI**
3. **Docker Desktop** (or a compatible container runtime)
4. **Node.js 18+** (for the frontend)

Follow the instructions below for your operating system.

---

## 1. Install the .NET 10 SDK

### Windows

1. Download the latest .NET 10 SDK installer from [https://dotnet.microsoft.com/download/dotnet/10.0](https://dotnet.microsoft.com/download/dotnet/10.0).
2. Run the installer and follow the prompts.
3. Verify the installation:

```powershell
dotnet --version
```

Alternatively, install via **winget**:

```powershell
winget install Microsoft.DotNet.SDK.10
```

### macOS

1. Download the latest .NET 10 SDK installer from [https://dotnet.microsoft.com/download/dotnet/10.0](https://dotnet.microsoft.com/download/dotnet/10.0). Choose the **Arm64** installer for Apple Silicon (M1/M2/M3/M4) or **x64** for Intel Macs.
2. Run the `.pkg` installer and follow the prompts.
3. Verify the installation:

```bash
dotnet --version
```

Alternatively, install via **Homebrew**:

```bash
brew install dotnet-sdk
```

---

## 2. Install the Aspire CLI
### macOS
```bash
curl -sSL https://aspire.dev/install.sh | bash
```

### Windows
```powershell
irm https://aspire.dev/install.ps1 | iex
```

For more information, visit the official Aspire documentation at [https://learn.microsoft.com/dotnet/aspire](https://learn.microsoft.com/dotnet/aspire).

---

## 3. Install Docker

Aspire uses a container runtime to provision infrastructure resources like Redis. Docker Desktop is the recommended option.

### Windows

1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
2. Run the installer. Ensure **WSL 2 backend** is selected during setup (recommended).
3. Restart your machine if prompted.
4. Launch Docker Desktop and wait for it to start.
5. Verify:

```powershell
docker --version
```

> **Tip:** If you don't have WSL 2, Docker Desktop will prompt you to install it. Follow the on-screen instructions.

### macOS

1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/). Choose the **Apple Silicon** or **Intel** version as appropriate.
2. Open the `.dmg` file and drag Docker to your Applications folder.
3. Launch Docker Desktop and wait for it to start.
4. Verify:

```bash
docker --version
```

Alternatively, install via **Homebrew**:

```bash
brew install --cask docker
```

For distribution-specific instructions, see the [official Docker install docs](https://docs.docker.com/engine/install/).

---

## 4. Install Node.js

The React frontend requires Node.js 18 or later.

Download from [https://nodejs.org](https://nodejs.org).

### macOS

```bash
brew install node
```

Or download from [https://nodejs.org](https://nodejs.org).

For other distributions, see [https://nodejs.org/en/download](https://nodejs.org/en/download).

Verify on any platform:

```bash
node --version
npm --version
```

---

## Running the Project

Once all prerequisites are installed, running the project is straightforward.

### 1. Clone the repository

```bash
git clone https://github.com/MaxArmenta-04/Car-Rental-System
cd CarRentalSystem
```

### 2. Restore dependencies

```bash
dotnet restore
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Run with Aspire

**Make sure Docker is running**, then start the application from the AppHost project:

From the project root directory `CarRentalSystem/`

```bash
aspire run
```

This single command will:

- Start the **Aspire Dashboard** (for monitoring and logs)
- Provision a **Redis container** automatically
- Launch the **backend API server**
- Launch the **Vite dev server** for the React frontend

### 5. Open the application

After startup, the terminal output will display URLs. Look for:

- **Aspire Dashboard** -- The orchestration dashboard showing all resources, logs, and traces
- **Frontend** -- The React application
- **Server** -- The backend API

---

## Diagram
<img width="624" height="511" alt="Picture1" src="https://github.com/user-attachments/assets/1f3f8a9b-dda9-4d83-87ca-7c73091436d0" />

<img width="624" height="624" alt="Picture2" src="https://github.com/user-attachments/assets/b3ac6f67-491a-44ed-a0ba-05a80f108bb9" />

## Project Structure

```
CarRentalSystem/
├── CarRentalSystem.sln                  # Solution file
├── CarRentalSystem.AppHost/             # Aspire orchestrator
│   └── AppHost.cs                       # Defines the distributed application topology
├── CarRentalSystem.Server/              # ASP.NET Core backend API
│   ├── Program.cs                       # API endpoints and middleware
│   └── Extensions.cs                    # OpenTelemetry, health checks, service defaults
└── frontend/                            # React + TypeScript + Vite SPA
    ├── src/
    │   ├── App.tsx                      # Main application component
    │   └── main.tsx                     # Entry point
    ├── package.json
    └── vite.config.ts
```
