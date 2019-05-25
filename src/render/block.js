import Header from './header'

export default class Block extends React.Component {
    constructor(props) {
        super(props)
       
        this.state = 
        {
            content: null, 
            class: "", 
			dragging: false,
			container: false
        }
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }
    componentDidUpdate(props, state) {
        if (this.state.dragging && !state.dragging) {
          document.addEventListener('mousemove', this.onMouseMove)
          document.addEventListener('mouseup', this.onMouseUp)
        } else if (!this.state.dragging && state.dragging) {
          document.removeEventListener('mousemove', this.onMouseMove)
          document.removeEventListener('mouseup', this.onMouseUp)
        }
    }
    onMouseDown(e) {
		if (e.button !== 0) return
		
		e.stopPropagation()
		//e.preventDefault()
		
		if (e.altKey || e.ctrlKey) { //linking
			this.props.onStartLink({x:e.pageX, y: e.pageY})
			this.setState({dragging: true, linking:true})
			return
		}
        
        this.setState({
			dragging: true,
			resizeWidth: e.target.dataset.resizeWidth,
			resizeHeight: e.target.dataset.resizeHeight,
			rel: {
				x: e.pageX / this.props.scale - this.props.node.x,
				y: e.pageY / this.props.scale - this.props.node.y
			},
			x: this.props.node.x,
			y: this.props.node.y,
			w: this.props.node.width,
			h: this.props.node.height
		})
    }
    onMouseUp(e) {
		if (!this.state.dragging)
			return

		if (this.state.linking)
			this.props.onAddLink(this.props.linking.to)

		if (this.state.moved)
			this.props.onChangePosition(this.state)

        this.setState({dragging: false, moved: false, linking: false})
        e.stopPropagation()
		e.preventDefault()
    }
    onMouseMove(e) {
		if ((!this.state.dragging) || (e.movementX + e.movementY == 0))
			return

		if (this.state.linking) {
			this.props.onMoveLink({x:e.pageX, y: e.pageY})
			return
		}

		if (this.state.editing)
			return

		e.stopPropagation()
		e.preventDefault()
		
		if (this.state.resizeWidth || this.state.resizeHeight)
		{
			this.setState({
				w: this.state.w + (this.state.resizeWidth ? e.movementX / this.props.scale : 0),
				h: this.state.h + (this.state.resizeHeight ? e.movementY / this.props.scale : 0),
				moved: true
			  })
			  return
		}

		let x = e.pageX / this.props.scale - this.state.rel.x 
		let y = e.pageY / this.props.scale - this.state.rel.y 
        this.setState({
          x: x,
		  y: y,
		  moved: true
		})

		this.props.onChangePosition(this.state, true)
		this.props.onDrag(this.props.node.id, x, y, this.props.node.width, this.props.node.height)  
	}
	
	render() {
        let x = (this.state.dragging && !this.state.linking) ? this.state.x : this.props.node.x
		let y = (this.state.dragging && !this.state.linking) ? this.state.y : this.props.node.y
		let w = this.state.resizeWidth ? this.state.w : this.props.node.width
		let h = this.state.resizeHeight ? this.state.h : this.props.node.height

		let extra = (this.props.linking && 
			( (this.props.linking.from == this.props.node.id) || 
			(this.props.linking.to == this.props.node.id)) )? " linking" : ""
        return <div 
			onMouseDown = {this.onMouseDown}
			onMouseEnter = {()=>this.setState({hover:true})} 
			onMouseLeave = {()=>this.setState({hover:false})} 
            className = {"flow " + this.state.class + extra} 
            id = {this.props.node.id}
            style = {{top: y,
                     left: x,
                     width: w,
                     height: h}}>
                <div className = "inner">
                    {this.state.content}
                </div>
                <Header node={this.props.node} text={this.props.node.title} menu={this.state.hover} container={this.state.container} />
				<div data-resize-width = "true" className="ui-resizable-handle ui-resizable-e"></div>
				<div data-resize-height = "true" className="ui-resizable-handle ui-resizable-s"></div>
				<div data-resize-height = "true" data-resize-width = "true" className="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"></div>
            </div>;
	}
}
