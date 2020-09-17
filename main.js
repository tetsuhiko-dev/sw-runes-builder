// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron');
const {Monsters, BonusStats} = require('./js/summoner_war');
const {autoUpdater} = require('electron-updater');
const logger = require('electron-log');

autoUpdater.logger = logger;
autoUpdater.autoDownload = false;

let monsters = undefined;
let bonusStats = undefined;
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1700,
        height: 800,
        frame : false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    // and load the index.html of the app.
    if(process.argv.includes("--dev")){
        mainWindow.loadFile('index.html');
    }
    else{
        mainWindow.loadFile('updater.html');
    }
    
    mainWindow.removeMenu();
    mainWindow.resizable = false;
    
    globalShortcut.register('f5', function () {
        mainWindow.reload();
    });

    // Open the DevTools.
    if(process.argv.includes("--dev")){
        mainWindow.webContents.openDevTools();
    }
    
    mainWindow.on("close", function () {
        mainWindow = null;
    });

    monsters = new Monsters();
    bonusStats = new BonusStats();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('filterMonsterRequest', (event, args) => {
    let monstersFilter = monsters.filter(args.name, args.element, args.star);
    event.sender.send('filterMonsterResult', monstersFilter);
});

ipcMain.on('getMonsterRequest', ((event, arg) => {
    try{
        let monster = monsters.get(arg);
        event.sender.send('getMonsterResult', monster);
    } catch(e){
        logger.error(e);
    }
    
}));

ipcMain.on('sendRuneRequest', ((event, args) => {
    bonusStats.slot1(args[0]);
    bonusStats.slot2(args[1]);
    bonusStats.slot3(args[2]);
    bonusStats.slot4(args[3]);
    bonusStats.slot5(args[4]);
    bonusStats.slot6(args[5]);
    
    event.sender.send('sendRuneBonusIndex', bonusStats.getBonusIndex());
    event.sender.send('sendStats0', bonusStats.stats0());
    event.sender.send('sendRuneResult', bonusStats.result());
}));

app.on('ready', function () {
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-not-available');
});

ipcMain.on('update-download', () => {
   autoUpdater.downloadUpdate(); 
});

autoUpdater.signals.updateDownloaded(info => {
   autoUpdater.quitAndInstall(true, true); 
});

autoUpdater.on('download-progress', (info) => {
    mainWindow.webContents.send('update-progress', info);
});

ipcMain.on('app-version', (event) => {
    event.sender.send('app-version', { version: app.getVersion() });
});