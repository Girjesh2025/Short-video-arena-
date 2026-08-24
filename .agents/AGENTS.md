# Workspace Agent Rules

- **VPS Credentials and Context**: On starting a session in this workspace, the AI assistant MUST immediately open and read [vps_credentials.md](file:///Users/girjesh/Desktop/cloudonfire/vps_credentials.md) at the project root. This file contains the active VPS IP (`222.167.207.161`), username, password, project directories, and a summary of all recent feature updates.
- **Direct VPS Execution**: All development, logs inspection, and process management must be performed directly on the VPS. Do not run local project files unless requested.
