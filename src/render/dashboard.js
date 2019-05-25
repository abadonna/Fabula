import fs from 'fs'
import path from 'path'
import {remote} from 'electron'

export default class Dashboard extends React.Component {
	constructor(props) {
		super(props)
		this.open = this.open.bind(this)
		this.create = this.create.bind(this)
		this.openDialog = this.openDialog.bind(this)
		this.createDialog = this.createDialog.bind(this)
		this.checkFolder = this.checkFolder.bind(this)
		this.renderNew = this.renderNew.bind(this)
		this.state = {
			path:remote.app.getPath('appData'),
			title: "Untitled",
			mode: props.isNew ? "new" : ""
		}
	}

	createDialog() {
		let self = this
		remote.dialog.showOpenDialog({title: "New project", properties: ['openDirectory']},
            function (fileNames) {
				if (fileNames === undefined) return;
				self.setState({path:fileNames[0]})
			})		   
	}

	openDialog() {
		let self = this
		remote.dialog.showOpenDialog({title: "Open project", properties: ['openDirectory']},
            function (fileNames) {
				if (fileNames === undefined) return;
				self.open(fileNames[0])
			})		   
	}

	open(dir) {
		let file = path.join(dir, "project.js")
		let props = this.props
		
		fs.readFile(file, 'utf-8', function (err, data) {
			props.open({}, {model:JSON.parse(data), path: dir})
		})
	}

	create() {
		let dir = path.join(this.state.path, this.state.title),
		file = path.join(dir, "project.js"),
		data = {
			title: this.state.title,
			nextEntityId: 1,
			links: [],
			nodes: []
		},
		self = this

		fs.mkdir(dir, function(err) {
			if (err) return

			fs.writeFile(file, JSON.stringify(data, null, 2), (err) => {  
				//console.log("created")
				self.open(dir)
			})
		})
	}

	checkFolder() {
		let folder = path.join(this.state.path, this.state.title)
		try {
			let stats = fs.lstatSync(folder)
			//if (stats.isDirectory())

			this.setState({exists: true})
		}
		catch(e) {
			this.setState({exists: false})
		}
	}

	componentDidUpdate(props, state) {
		if ((state.path != this.state.path) ||
		(state.title != this.state.title))
			this.checkFolder()
	}

	componentDidMount() {
		this.checkFolder()
	}

	renderRecent() {
		return <div className = "content">
		<div className = "header">Recent Projects</div>
		{
			this.props.projects ? 
			this.props.projects.map((project, i) => 
				<div className = "project" 
				onClick = {() => this.open(project.path)}
				key = {"p" + i}>
					<div className = "title">{project.title}</div>
					<div className = "path">{project.path}</div>
				</div>
			) 
			: null
		}
		</div>
	}

	renderNew() {
		let dir = path.join(this.state.path, this.state.title)
		let style = this.state.exists ? {color:"red"} : {}

		return <div className = "content">
		<div className = "header">New Project</div>
		<table>
			<colgroup>
			<col width="100px"/>
			<col />
			<col width="50"/>
			</colgroup>
			<tbody>
			<tr>
				<td>Title</td>
				<td>
					<input 
						ref = {(el) => this.title = el} 
						className = "single"
						style = {style}
						onKeyUp = {() => {
							this.setState({title:this.title.value})
							//this.checkFolder()
						}}
						defaultValue = "Untitled"/>
				</td>
				<td></td>
			</tr>
			<tr>
				<td>Location</td>
				<td><input
					className = "single" 
					style = {{width: "100%"}}
					disabled
					value = {dir}/></td>
				<td>
					<button 
						onClick={this.createDialog}
						style={{width:26, height:26}}>...
					</button>
				</td>
			</tr>
			<tr>
				<td colSpan="3">
					<br/>
					<button style={{height:26}}
					disabled = {this.state.exists}
					onClick={this.create}>Create Project!</button>
				</td>
			</tr></tbody>
		</table>
			
		</div>

	}

	render() {
		return <div className = "dashboard">
		<ul>
			<li onClick={()=>this.setState({mode:"recent"})}>RECENT</li>
			<li onClick={()=>this.setState({mode:"new"})}>NEW PROJECT</li>
			<li onClick={this.openDialog}>OPEN PROJECT</li>
		</ul>
		
		{this.state.mode == "new" ? this.renderNew() : this.renderRecent()}

		</div>
	}
}

