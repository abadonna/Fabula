import {Text, Annotation, Image, Dialog} from './connectors'
import Link from "./link" 
import {connect} from 'react-redux'
import ls from 'local-storage'

class Workspace extends React.Component {
	constructor(props) {
		super(props)
		this.onMouseDown = this.onMouseDown.bind(this)
		this.onMouseUp = this.onMouseUp.bind(this)
		this.onMouseMove = this.onMouseMove.bind(this)
		this.onScroll = this.onScroll.bind(this)
		this.onScroll = this.onScroll.bind(this)
		this.onDragBlock = this.onDragBlock.bind(this)
		this.moveTo = this.moveTo.bind(this)

		this.state = {dragging:false, x:0, y:0}
		this.bounds = this.calcBounds(props.nodes)
		document.addEventListener('mousewheel', this.onScroll)
	}

	calcBounds(nodes) {
		if (nodes.length < 2)
			return {
				minX: (nodes.length == 1) ? nodes[0].x: 0, 
				maxX: (nodes.length == 1) ? nodes[0].x + nodes[0].width: 0, 
				minY: (nodes.length == 1) ? nodes[0].y: 0, 
				maxY: (nodes.length == 1) ? nodes[0].y + nodes[0].height: 0, 
			}

		return nodes.reduce((obj, node) => {return {
			minX: Math.min(obj.minX || obj.x, node.x) || 0,
			maxX: Math.max(obj.maxX || (obj.x + obj.width), node.x + node.width) || 0,
			minY: Math.min(obj.minY || obj.y, node.y) || 0,
			maxY: Math.max(obj.maxY || (obj.y + obj.height), node.y + node.height) || 0
		}})
	}

	moveTo(x, y) { //limit workspace by blocks
		this.setState({
			x: Math.max(100 - this.bounds.maxX * this.props.scale, Math.min(window.innerWidth  - 100 - this.bounds.minX * this.props.scale, x)),
			y: Math.max(100 - this.bounds.maxY * this.props.scale, Math.min(window.innerHeight - 100 - this.bounds.minY * this.props.scale, y))  
		})
	
		let id = this.props.workspaceId || "root"
		ls(id + "_x", x)
		ls(id + "_y", y)
	}

	componentDidUpdate(props, state) {
        if (this.state.dragging && !state.dragging) {
    		document.addEventListener('mousemove', this.onMouseMove)
        	document.addEventListener('mouseup', this.onMouseUp)
        } else if (!this.state.dragging && state.dragging) {
          	document.removeEventListener('mousemove', this.onMouseMove)
          	document.removeEventListener('mouseup', this.onMouseUp)
		}
		if (this.props !== props) {
			this.bounds = this.calcBounds(this.props.nodes)
			if (this.props.path != props.path)
				this.setState({x:0, y:0})
			if (this.props.workspaceId != props.workspaceId) {
				let x = 0, y = 0
				if(this.props.nodes.length > 0)
				{
					let id = this.props.workspaceId || "root"
					x = ls(id + "_x") || 0
					y = ls(id + "_y") || 0
				}
				this.moveTo(x,y)
			}
			// linking
			let linking = null
			if (this.props.linking) {
				linking = {
					x: (this.props.linking.x - this.state.x)/ this.props.scale,
					y: (this.props.linking.y - this.state.y)/ this.props.scale,
					from: this.props.linking.from
				}
				this.props.nodes.forEach(node => {
				if  ((node.x < linking.x) && (node.x + node.width > linking.x) &&
					(node.y < linking.y) && (node.y + node.height > linking.y) &&
					(linking.from != node.id))
						linking.to = node.id
				})
			}
			this.setState({linking: linking})
		}
	}
	
	onMouseDown(e) {
		if (e.button !== 0) return
        this.setState({
			dragging: true,
			rel: {
				x: e.pageX - this.state.x,
				y: e.pageY - this.state.y
			}
        })
        e.stopPropagation()
	}

	onMouseUp(e) {
        this.setState({dragging: false})
        e.stopPropagation()
        e.preventDefault()
	}
	
    onMouseMove(e) {
		if (!this.state.dragging) return
		this.moveTo(e.pageX - this.state.rel.x, e.pageY - this.state.rel.y)
   
        e.stopPropagation()
        e.preventDefault()
	}

	onScroll(e) {
		if ((e.target.tagName == "TEXTAREA") || (e.target.tagName == "INPUT"))
			return
		let x = this.state.x + e.wheelDeltaX * 0.3
		let y = this.state.y + e.wheelDeltaY * 0.3
		this.moveTo(x, y)
	}

	onDragBlock(id, x, y, w, h) {
		let tx = this.state.x,
			ty = this.state.y,
			sx = x * this.props.scale,
			sy = y * this.props.scale,
			sw = w * this.props.scale,
			sh = h * this.props.scale
		
		if (-tx > sx)
			tx = - sx
		else if (sx + tx + sw > window.innerWidth)
			tx = -sx + window.innerWidth - sw
		
		if (-ty > sy)
			ty = - sy
		else if (sy + ty + sh > window.innerHeight)
			ty = -sy + window.innerHeight - sh
		
		this.moveTo(tx, ty)
	}

	createBlock(node) {
		if (node.type == "box")
			return <Text node={node} key={node.id} scale={this.props.scale} linking = {this.state.linking} onDrag = {this.onDragBlock}/>
		else if (node.type == "annotation")
			return <Annotation node={node} key={node.id} scale={this.props.scale} onDrag = {this.onDragBlock}/>
		else if (node.type == "image")
			return <Image node={node} path={this.props.path} key={node.id} scale={this.props.scale} onDrag = {this.onDragBlock}/>
		else if (node.type == "dialog")
			return <Dialog node={node} key={node.id} scale={this.props.scale} linking = {this.state.linking} onDrag = {this.onDragBlock}/>
		return null;
	}
	//transform:"translate(-50%, -50%) scale(" + this.props.scale + ")"
	render() {
		let cursor = this.state.dragging ? 'move' : ''

		return <div className = "workspace" 
		style={{top: this.state.y, left: this.state.x, cursor:cursor}}
		onMouseDown = {this.onMouseDown}>
		
		<div className = "scaler" style = {{transform:"scale(" + this.props.scale + ")"}}>
			{
				this.props.nodes ? 
				this.props.nodes.map((node) => this.createBlock(node)) 
				: null
			}

			
			{
				this.props.links ? 
				this.props.links.map((link, i) => 
				<Link key={"link" + i} id1={link.from} id2={link.to} label = {link.label}/>) 
				: null
			}
			

			{
				this.state.linking ?
				<Link id1={this.state.linking.from} id2={this.state.linking.to} target={this.state.linking}/>
				: null
			}
			
		</div>
		</div>
	}
}

function mapState (state) {
	let nodes = [],
		links = []
	if (state.workspace)
	{
		let node = state.nodes.find(n => n.id == state.workspace)
		nodes = node.nodes ? node.nodes.map(id => state.nodes.find(n => n.id == id)) : []
	}else if (state.nodes && state.nodes.length > 0)
	{
		let keys = state.nodes.map(n => n.nodes || []).reduce((a,b) => a.concat(b))
		nodes = state.nodes.filter(n => !keys.some(k => k == n.id))
	}
	
	links = state.links.filter((link) => {return nodes.some(n => n.id == link.from)})
	return {
		nodes: nodes, 
		path: state.path, 
		workspaceId: state.workspace, 
		links: links,
		linking: state.linking
	}
}

export default connect(mapState)(Workspace)