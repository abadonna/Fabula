const {dialog, MenuItem, Menu} = require('electron')
const fs = require('fs')
const path = require('path')

export function menuUpdateView(event, stack, menu)
{
	let view = menu.getMenuItemById("view")
	let item = view.submenu.items[0]
	
	if (stack.length > 0) {
		item.enabled = true
		item.click = () => {
			event.sender.send('workspace', stack.slice(-1)[0])
		}
	}else {
		item.enabled = false
	}
}

export function menuTemplate(recent, isProject, linkType)
{ 
	return[
    {
      label: 'Fabula',
      submenu: [
        {role: "about"},
        {type: 'separator'},
        {role: "quit"}
      ]
    },
  
    {
      label: 'File',
      submenu: [
		{label: 'New project', click: (menuItem, window, event) => {window.send('new')}},
		{type: 'separator'},
        {label: 'Open ...', accelerator: 'CommandOrControl+O',  click: (menuItem, window, event) => {
			
			let openDialog = function() {
				dialog.showOpenDialog({title: "Open project", properties: ['openDirectory']},
              		function (fileNames) {
            			if (fileNames === undefined) return;
            			fs.readFile(path.join(fileNames[0], "project.js"), 'utf-8', function (err, data) {
              				window.send('openProject', {model:JSON.parse(data), path: fileNames[0]})
            			})
           			}) 
			}
			
			if (global.settings.modified) {
				dialog.showMessageBox({
					type: "question",
					buttons: ["Discard changes", "Cancel"],
					title: "Unsaved changes",
					message: "Do you want to discard your changes?"
				}, 
				response => {
					if (response == 1)
						return
					openDialog()
				})
				return
			}

			openDialog()
		}},
		{
			label: 'Open Recent',
			submenu: recent.map(p => {return {
					label: p.title,
					click: (menuItem, window, event) => {
						let openProject = function() {
							fs.readFile(path.join(p.path, "project.js"), 'utf-8', function (err, data) {
								window.send('openProject', {model:JSON.parse(data), path: p.path})
							})
						}

						if (global.settings.modified) {
							dialog.showMessageBox({
								type: "question",
								buttons: ["Discard changes", "Cancel"],
								title: "Unsaved changes",
								message: "Do you want to discard your changes?"
							}, 
							response => {
								if (response == 1)
									return
								openProject()
							})
							return
						}

						openProject()
					}
				}
			})
		},
		{type: 'separator'},
		{
			label: 'Save', 
			accelerator: 'CommandOrControl+S',
			enabled: isProject,
			click: (menuItem, window, event) => {
				window.send('save')
			}
		},
		{type: 'separator'},
		{
			label: 'Export',
			submenu: [
				{
					label: "Plain Text",
					enabled: isProject, 
					click: (menuItem, window, event) => {
						dialog.showSaveDialog({title: "Export as"},
							function (filename) {
								if (filename === undefined) return
								window.send('export', {format: "plain", path: filename})
							}) 
						}
				},
				{
					label: "JSON",
					enabled: isProject, 
					click: (menuItem, window, event) => {
						dialog.showSaveDialog({title: "Export as"},
							function (filename) {
								if (filename === undefined) return
								window.send('export', {format: "json", path: filename})
							}) 
						}
				},
				{
					label: "XML",
					enabled: isProject, 
					click: (menuItem, window, event) => {
						dialog.showSaveDialog({title: "Export as"},
							function (filename) {
								if (filename === undefined) return
								window.send('export', {format: "xml", path: filename})
							}) 
						}
				}
			]
		}
	]},
  
    {
	  label: 'Edit',
	  role: "",
      submenu: [
		{label: 'Undo', accelerator: 'CommandOrControl+Z',  click: (menuItem, window, event) => {window.send('undo')}},
		{label: 'Redo', accelerator: 'CommandOrControl+Shift+Z',  click: (menuItem, window, event) => {window.send('redo')}},
		{ type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
		{type: 'separator'},
		{label: 'Add new block', 
		submenu: [
			{label: 'Text', enabled: isProject, accelerator: 'CommandOrControl+1',  click: (menuItem, window, event) => {window.send('createBlock', 'box')}},
			{label: 'Annotation', enabled: isProject, accelerator: 'CommandOrControl+2',  click: (menuItem, window, event) => {window.send('createBlock', 'annotation')}},
			{label: 'Dialog', enabled: isProject, accelerator: 'CommandOrControl+3',  click: (menuItem, window, event) => {window.send('createBlock', 'dialog')}},
			{label: 'Image', enabled: isProject, accelerator: 'CommandOrControl+4',  click: (menuItem, window, event) => {window.send('createBlock', 'image')}}
		]},
		
      ]
	},
	
	{
		label: 'View',
		id: "view",
		submenu: [
			{
				label: 'Level up', 
				enabled: false,
				accelerator: 'Escape',
			},
			{label: 'Links', 
			submenu: [
				{label: 'Auto', checked: !linkType || (linkType == 1), type: 'radio', click(menuItem, window) {window.webContents.send('changeLinks', 1)}},
				{label: 'Lines', checked: linkType == 2, type: 'radio', click(menuItem, window) {window.webContents.send('changeLinks', 2)}},
				{label: 'Quadric', checked: linkType == 3, type: 'radio', click(menuItem, window) {window.webContents.send('changeLinks', 3)}},
				{label: 'Cubic', checked: linkType == 4, type: 'radio', click(menuItem, window) {window.webContents.send('changeLinks', 4)}}
			]},
			{type: 'separator'},
			{
				label: 'Zoom in', 
				enabled: isProject,
				accelerator: 'CommandOrControl+Plus',
				click(menuItem, window) {window.webContents.send('zoom', 0.2)}
			},
			{
				label: 'Zoom out', 
				enabled: isProject,
				accelerator: 'CommandOrControl+-',
				click(menuItem, window) {window.webContents.send('zoom', -0.2)}
			}
		]
	},
    
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('http://ktulhusolutions.com') }
        },
        {label: 'Reload', role: "reload"}
      ]
    }
  ]
}