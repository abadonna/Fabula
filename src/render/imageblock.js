import Block from './block'
import fs from 'fs'
import path from 'path'

export default class ImageBlock extends Block {
    constructor(props) {
		super(props)
		this.openFile = this.openFile.bind(this)
		this.loadImage = this.loadImage.bind(this)
	
		if (props.node.image) {
			this.loadImage()
		}else
			this.state.content = <div>
				<br/>Drop image here or 
				<button onClick = {this.openFile}
				>Select image</button>
			</div>
		//this.state.content = <img src = {"file:///" + props.path + "/" + props.node.image}/>
	}

	loadImage() {
		fs.readFile(this.props.path + "/" + this.props.node.image, (err, data) => {
			let blob = new window.Blob([data]);
			this.setState({content: <img 
				onDoubleClick = {this.openFile}
				src = {URL.createObjectURL(blob)}/>})
		})
	}

	openFile() {
		const {dialog} = require('electron').remote
		let update = this.props.onSetImage,
			id = this.props.node.id,
			base = this.props.path,
			current = this.props.node.image,
			comp = this

		dialog.showOpenDialog({
			title: "Open file", 
			properties: ['openFile'], 
			defaultPath: this.props.path,
			filters: [
				{name: 'Images', extensions: ['jpg', 'png', 'gif']},
		  	]},
			function (fileNames) {
				if (fileNames === undefined) return

				let src = fileNames[0],
					file = path.basename(src),
					dst = path.join(base, file)

				if (current == file) return

				comp.setState({content:<div>....please wait....</div>})
				
				const {COPYFILE_EXCL} = fs.constants

				fs.copyFile(src, dst, COPYFILE_EXCL, (err, stats) => {
					update(id, file)
				})
				
			})
	}

	componentDidUpdate(props, state) {
		super.componentDidUpdate(props, state)
		if (this.props.node.image != props.node.image)
			this.loadImage()
	}
	
}
