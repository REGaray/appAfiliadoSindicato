const { app, BrowseWindow, ipcMain } = require('electron');
const path = require('path');

//We create the main window of the desktop app
function createWindow() {
    const mainWindow = new BrowseWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname,'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })};

//Load the main html file

