import Handlebars from "handlebars"
import Workspace from "./workspace"
import Dashboard from "./dashboard"
import * as cfg from "./config"
import {connect} from 'react-redux'
import {remote, ipcRenderer} from 'electron'
import {shallowCopy} from './utils'
import path from 'path'
import ls from 'local-storage'

class App extends React.Component {
	constructor(props) {
		super(props)

		this.stack = []
		this.undoStack = []
		this.redoStack = []
		this.lastSaved = {}

		this.save = this.save.bind(this)
		ipcRenderer.on('save', this.save)
		
		ipcRenderer.on('openProject', this.openProject.bind(this))
		ipcRenderer.on('workspace', this.changeWorkspace.bind(this))
		ipcRenderer.on('createBlock', this.createBlock.bind(this))
		ipcRenderer.on('changeLinks', this.changeLinks.bind(this))
		ipcRenderer.on('new', this.newProject.bind(this))
		ipcRenderer.on('undo', this.undo.bind(this))
		ipcRenderer.on('redo', this.redo.bind(this))
		ipcRenderer.on('export', this.export.bind(this))
		ipcRenderer.on('zoom', this.zoom.bind(this))
		

		this.state = {scale: 1}

		cfg.projects(projects => {
			this.setState({recent: projects})
			ipcRenderer.send('recent', {projects:projects, isProject:false})
		})
	}

	newProject() {
		
		if (!remote.getGlobal('settings').modified) {
			this.setState({isNew: true})
			return
		}

		remote.dialog.showMessageBox({
			type: "question",
			buttons: ["Discard changes", "Cancel"],
			title: "Unsaved changes",
			message: "Do you want to discard your changes?"
		}, 
		response => {
			if (response == 1)
				return
			this.setState({isNew: true})
		})
	}

	save() {
		if (!this.props.data.title)
			return

		let data = shallowCopy(this.props.data),
			file = path.join(data.path, "project.js")

		data.path = null
		data.workspace = null
		fs.writeFile(file, JSON.stringify(data, null, 2), (err) => {  
			console.log("saved")
		})

		this.lastSaved = this.props.data
		remote.getGlobal('settings').modified = false
		remote.getCurrentWindow().setTitle(data.title)
	}

	undo() {
		if (this.undoStack.length == 0)
			return
		let data = this.undoStack.pop()
		this.is_undo = true
		this.redoStack.push(this.props.data)
		this.props.dispatch({type: 'LOAD', data:data})
	}

	redo() {
		if (this.redoStack.length == 0)
			return
		let data = this.redoStack.pop()
		this.is_redo = true
		this.props.dispatch({type: 'LOAD', data:data})
	}

	zoom(event, arg) {
		let s = this.state.scale + arg
		s = Math.min(Math.max(s, 0.6), 2)
		this.setState({scale: s})
	}

	export(event, arg) {
		let self = this
		let data = {
			title: this.props.data.title
		}
		let keys = this.props.data.nodes.map(n => n.nodes || []).reduce((a,b) => a.concat(b))
		let createNode = function(n) {
			let links = self.props.data.links.filter(link => link.from == n.id)
			return {
				title: n.title,
				text: n.text,
				nodes: n.nodes ? [...n.nodes] : null,
				links: links.length > 0 ? links : null,
				id: n.id,
				type: n.type
			}
		}
		
		data.nodes = this.props.data.nodes.filter(n => !keys.some(k => k == n.id)).map(createNode)
		data.links = this.props.data.links

		let build = function(node) {
			if (!node.nodes) return
			node.nodes = node.nodes.map(id => self.props.data.nodes.find(n => n.id == id)).map(createNode)
			node.nodes.forEach(n => build(n))
		}

		if (data.nodes)
			data.nodes.forEach(node => build(node))
	
		fs.readFile(path.join(__dirname,"../export/" + arg.format + ".txt"), 'utf8', (err, src) => {  
			if (err) {
				console.log(err)
				return
			}
			let template = Handlebars.compile(src)
			fs.writeFile(arg.path, template(data), (err) => {  
				console.log("done")
			})
			//console.log(template(data))
		})
	}

	openProject(event, arg) {
		let data = arg.model
		data.path = arg.path
		this.props.dispatch({type: 'LOAD', data:data})

		if (data.title) {
			cfg.recent(arg, projects => {
				ipcRenderer.send('recent', {projects:projects, isProject:true, links:data.arrowType})
			})
			
			remote.getCurrentWindow().setTitle(data.title)
		}

		this.stack = []
		this.undoStack = []
		this.redoStack = []
		this.lastSaved = data
		remote.getGlobal('settings').modified = false

		this.setState({isNew: false})
	}

	changeWorkspace(event, arg) {
		this.props.dispatch({type: 'WORKSPACE', nodeId: arg == "root" ? null : arg})
	}

	changeLinks(event, arg) {
		this.props.dispatch({type: 'ARROW_TYPE', value: arg})
	}

	createBlock(event, arg) {
		let id = this.props.workspaceId || "root",
			x = ls(id + "_x") || 0,
			y = ls(id + "_y") || 0
		x = parseInt( (window.innerWidth / 2 - x - 100) / this.state.scale )
		y = parseInt( (window.innerHeight / 2 - y - 100) / this.state.scale )
		this.props.dispatch({type: 'ADD', nodeId: this.props.workspaceId, block: arg, x:x, y:y})
	}

	componentDidUpdate(props, state) {
		if (this.props != props)
			if (!this.is_undo && (props.data.canBeUndone || this.undoStack.length == 0)) {
					this.undoStack.push(props.data)
					if (!this.is_redo)
						this.redoStack = []
				}
		
		if (this.props.workspaceId !== props.workspaceId) {
			let idx = this.stack.indexOf(this.props.workspaceId)
			if (idx == -1) 
				this.stack.push(props.workspaceId)
			else
				this.stack = this.stack.slice(0, idx)
			
			ipcRenderer.send('workspace', this.stack)
		}

		this.is_undo = false
		this.is_redo = false

		if ((this.props.data != this.lastSaved) && (this.props.data.title) ) {
			remote.getGlobal('settings').modified = true
			remote.getCurrentWindow().setTitle(this.props.data.title + "*")
		} else {
			remote.getGlobal('settings').modified = false
			if (this.props.data.title)
				remote.getCurrentWindow().setTitle(this.props.data.title)
		}
	}

	render() {
		return (this.props.data.path && !this.state.isNew) ? <Workspace scale={this.state.scale} />
		: <Dashboard 
			projects = {this.state.recent} 
			isNew = {this.state.isNew}
			open = {this.openProject.bind(this)} />
	}
}

function mapState (state) {
	return {workspaceId: state.workspace || "root", data: state}
}

export default connect(mapState)(App)