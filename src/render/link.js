import Label from './label'
import {linear, quadric, cubic, best} from './curves'
import {connect} from 'react-redux'

class Link extends React.Component {
    constructor(props) {
    	super(props)
		this.calcSize = this.calcSize.bind(this)
		this.dummyNode = this.dummyNode.bind(this)
		this.state = this.calcSize()
    }
	
	dummyNode() {
		return {
			x: this.props.target.x,
			y: this.props.target.y,
			width: 100,
			height: 100
		}
	}

	calcSize() {
		let getLinkPoints = function(node) {
			return [
			{x: node.x + node.width/2, y: node.y, p: 'N'},
			{x: node.x + node.width/2, y: node.y + node.height, p: 'S'},
				{x: node.x + node.width, y: node.y + node.height/2, p: 'E'},
				{x: node.x, y: node.y + node.height/2, p: 'W'}
			]
		}

		let findNearestPoints = function(node1, node2) {
			let fPoints = getLinkPoints(node1),
            	tPoints = getLinkPoints(node2),
            	point1 = null,
            	point2 = null,
				dest = Number.MAX_VALUE

			fPoints.forEach((f) =>
			{
				tPoints.forEach((t) =>
				{
					let dx = Math.pow(f.x - t.x, 2),
						dy = Math.pow(f.y - t.y, 2),
						d = dx + dy
		
					if (d < dest)
					{
						point1 = f;
						point2 = t;
						dest = d;
					}
				})
			})
			return [point1, point2]
		}

		let points = findNearestPoints(this.props.from, this.props.to || this.dummyNode()),
            fPoint = points[0],
			tPoint = points[1]
		
		if (!this.props.to)
			tPoint = {x: this.props.target.x, y: this.props.target.y}
		
		else { //calculate other inputs\outputs to shift entry points

			points = [tPoint]
			
			this.props.outputs.forEach(node => {
				if (node != this.props.to) {
					let p = findNearestPoints(this.props.from, node)
					if ((p[0].x == fPoint.x) && (p[0].y == fPoint.y))
						points.push(p[1])		
				}
			})

			let dx = 0,
				dy = 0,
				point = {x:fPoint.x, y:fPoint.y, p:fPoint.p}
			if ((fPoint.x == this.props.from.x) ||
				(fPoint.x == this.props.from.x + this.props.from.width))
			{
				points.sort((a, b) => a.y - b.y)
				point.y -= (points.length - 1) * 10
				dy = 20
			}
			else
			{
				points.sort((a, b) => a.x - b.x)
				point.x -= (points.length - 1) * 10
				dx = 20
			}
			points.forEach(p => {
				if (p == tPoint)
					fPoint = {x: point.x, y: point.y, p:point.p}

				point.x += dx
				point.y += dy
			})
			
			points = [fPoint]
				
			this.props.inputs.forEach(node => {
				if (node != this.props.from) {
					let p = findNearestPoints(this.props.to, node)
					if ((p[0].x == tPoint.x) && (p[0].y == tPoint.y))
						points.push(p[1])		
				}
			})
			
			dx = 0
			dy = 0
			point = {x:tPoint.x, y:tPoint.y, p:tPoint.p}

			if ((tPoint.x == this.props.to.x) ||
				(tPoint.x == this.props.to.x + this.props.to.width))
			{
				points.sort((a, b) => a.y - b.y)
				point.y -= (points.length - 1) * 10
				dy = 20
			}
			else
			{
				points.sort((a, b) => a.x - b.x)
				point.x -= (points.length - 1) * 10
				dx = 20
			}

			points.forEach(p => {
				if (p == fPoint)
					tPoint = {x: point.x, y: point.y, p: point.p}

				point.x += dx
				point.y += dy
			})
		}
	

		let x = Math.min(fPoint.x, tPoint.x) - 50,
			y = Math.min(fPoint.y, tPoint.y) - 50,
			w = Math.abs(fPoint.x - tPoint.x) + 100,
			h = Math.abs(fPoint.y - tPoint.y) + 100

		return {
			x: x,
			y: y,
			width: w,
			height: h,
			start: {x: fPoint.x - x, y: fPoint.y - y, p: fPoint.p},
			end: {x: tPoint.x - x, y: tPoint.y - y, p: tPoint.p}
		}
	}

	delete() {
		this.props.onDeleteLink(this.props.id1, this.props.id2)
	}

	componentDidUpdate(props, state) {
		if (this.props !== props)
			this.setState(this.calcSize())
	}

	build(arrow, start, end) {
		switch(arrow)
		{
			case 2:
				return linear(start, end)
			case 3:
				return quadric(start, end)
			case 4: 
				return cubic(start, end)
			default:
				return best(start, end)
		}
	}

	render() {
		let link = this.build(this.props.arrowType, this.state.start, this.state.end),
		labelStyle = {top:link.y, left:link.x}

		return <div className = "connection"
		style = {{top: this.state.y,left: this.state.x, width: this.state.width, height: this.state.height}}>
			<svg version="1.1" width="100%" height="100%">
			<g stroke="transparent" strokeWidth="40"
		onDoubleClick = {this.props.onCreateLabel}
		onMouseEnter = {()=>this.setState({hover:true})} 
		onMouseLeave = {()=>this.setState({hover:false})}>
				{link.path}
				<g stroke="red" strokeWidth="2">
					{link.path}
					<polygon points="-10,-5 0,0 -10,5" fill="red" transform={link.transform}></polygon>
					{
						this.state.hover ? 
						<text x={link.x} y={link.y} dx="-3" dy="3" stroke="yellow" strokeWidth="1" className="tool close" onClick={() => this.delete()} >x</text> 
						: null
					} 
				</g>
			</g>
			</svg>
			
			{
				typeof(this.props.label) == "string" ? 
				<Label text={this.props.label} id1={this.props.id1} id2={this.props.id2} style = {labelStyle} />
				: null
			}
		</div>
	}
}

function mapDispatch (dispatch, props) {
	return {
		onDeleteLink: function(from, to) {
			dispatch({type: 'DELETE_LINK', from: from, to: to})
		},
		onCreateLabel: function() {
			if (props.label)
				return
			dispatch({type: 'CREATE_LABEL', from: props.id1, to: props.id2})
		}
	  }
}

function mapState (state, props) {
	let fromNode = state.nodes.find(n => n.id == props.id1),
		toNode = state.nodes.find(n => n.id == props.id2),
		links1 = state.links.filter(n => (n.from == props.id1) || (n.to == props.id1)),
		links2 = state.links.filter(n => (n.from == props.id2) || (n.to == props.id2)),
		nodes1 = links1.map(link => (link.from == props.id1) 
			? state.nodes.find(n => n.id == link.to) 
			: state.nodes.find(n => n.id == link.from)),
		nodes2 = links2.map(link => (link.from == props.id2) 
			? state.nodes.find(n => n.id == link.to) 
			: state.nodes.find(n => n.id == link.from))
	return {
		from: fromNode, 
		to: toNode, 
		outputs: nodes1, 
		inputs: nodes2, 
		arrowType: state.arrowType || 1
	}
}


export default connect(mapState, mapDispatch)(Link)
