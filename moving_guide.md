# ZAD Print System: New Machine Setup Guide

Follow these steps to move your automated printing system to a new computer.

### 1. Printer Setup
- Connect the **XPrinter XP-370B** via USB.
- Install the driver and ensure the printer name in Windows is set to `Xprinter XP-370B`.
- Load 58mm thermal paper or labels.

### 2. Software Prerequisites
- Install **Node.js** (LTS Version) from [nodejs.org](https://nodejs.org).
- Open PowerShell and run: `npm install -g pnpm`

### 3. Move Files
- Copy the entire `Ziad-Zad` folder to the new computer.
- Ensure the `.env` file is included in the copy.

### 4. Initialize
- Open a terminal in the project folder.
- Run the command: `pnpm install`

### 5. Start Printing
- Double-click `start-agent.bat` to begin polling for orders.
- Right-click `start-agent.bat` > **Send to** > **Desktop (Shortcut)** for easy access.

---
**Troubleshooting:**
- If the printer name is different, edit the `.env` file and update `PRINTER_INTERFACE`.
- Ensure the computer has a stable internet connection.
