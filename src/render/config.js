import fs from 'fs'
import path from 'path'
import {remote} from 'electron'

function checkFolder(folder) {
	try {
		let stats = fs.lstatSync(folder)
		return stats.isDirectory()
	}
	catch(e) {
		return false
	}
}

export let projects = function (callback) {
	let file = path.join(remote.app.getPath('appData'), remote.app.getName(), "config.json")
	fs.readFile(file, (err, data) => {  
		if (err) {
			callback([])
			return
		}
		let cfg = JSON.parse(data),
			projects = cfg.projects.filter(p => checkFolder(p.path))
			
		callback(projects)
	})
}

export let recent = function (project, callback) {
	let file = path.join(remote.app.getPath('appData'), remote.app.getName(), "config.json")
	fs.readFile(file, (err, data) => {
		let cfg = {projects:[]}
		if (!err)
			cfg = JSON.parse(data)
		
		let idx = cfg.projects.findIndex(p => p.path == project.path)
		if (idx > -1)
			cfg.projects.splice(idx, 1)

		cfg.projects.unshift({title:project.model.title, path:project.path, time: Date.now()})
		cfg.projects = cfg.projects.filter(p => checkFolder(p.path))
		
		data = JSON.stringify(cfg, null, 2);
		fs.writeFile(file, data, (err) => {  
			if (callback)
				callback(cfg.projects)
		})
	})
	
}
