import {app, BrowserWindow, Menu, ipcMain, systemPreferences} from 'electron'
import path from 'path'

function createWindow () {
	if (process.platform == 'darwin') {
		systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
		systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
	}
	
	global.settings = {modified: false}

	// Create the browser window.
	let win = new BrowserWindow({
		width: 800, 
		height: 600, 
		backgroundColor: '#000000',
		icon: path.join(__dirname, 'icons/64.png')
	})

	win.toggleDevTools()

	// and load the index.html of the app.
	//win.loadFile('index.html')
	win.loadURL(`file://${__dirname}/index.html`)

	const {menuTemplate, menuUpdateView, menuUpdateRecent}  = require("./main/menu")
	let menu = Menu.buildFromTemplate(menuTemplate([], false))
	Menu.setApplicationMenu(menu)

	ipcMain.on('workspace', (event, arg) => {  
		menuUpdateView(event, arg, menu)
		//Menu.setApplicationMenu(menu)
	})

	ipcMain.on('recent', (event, arg) => {  
		menu = Menu.buildFromTemplate(menuTemplate(arg.projects, arg.isProject, arg.links))
		Menu.setApplicationMenu(menu)
	})
  
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
})