import Editable from './editable'
import {connect} from 'react-redux'

class Label extends Editable {
	constructor(props) {
        super(props)
		this.shiftToCenter = this.shiftToCenter.bind(this)
		
		this.state = {
			edit: this.props.text == "",
			width: 150,
			visibility: (this.props.text == "") ? "" : "hidden"
		}
	}
	
    exitEditMode(e) {
		super.exitEditMode(e)
		this.setState({visibility:"hidden"})
		if (this.input.value == "")
			this.props.onDeleteLabel()
		else
			this.props.onChangeLabel(this.input.value)
	}

	componentDidUpdate(props, state) {
		super.componentDidUpdate(props, state)
		if (this.props.text !== props.text)
			this.setState({visibility:"hidden"})
	}
	shiftToCenter() {
		let width = this.el.clientWidth
		if (!this.state.width 
			|| (Math.abs(this.state.width - width) > 10)
			|| (this.state.visibility == "hidden"))
			this.setState({width: width, visibility: ""})
	}
	render() {
		let content = this.state.edit
			? <input ref={(el) => this.input = el} 
					autoFocus 
					onKeyDown = {this.onKeyDown} 
					onBlur = {this.exitEditMode} 
					defaultValue = {this.props.text}
					style={{width: Math.max(150, this.state.width)}}></input>
			: <div className = "text" onDoubleClick = {this.enterEditMode}>{this.props.text}</div>
		
		let button = this.state.hover ? "block" : "none",
			style = {
				left: this.props.style.left, 
				top: this.props.style.top,
				visibility: this.state.visibility,
				marginLeft: this.state.width ? -this.state.width/2 : 0}
			
		if (!this.state.edit)
			setTimeout(this.shiftToCenter, 0)

		return <div className = "label"
			ref={(el) => this.el = el}
			onMouseEnter = {()=>this.setState({hover:true})} 
			onMouseLeave = {()=>this.setState({hover:false})} 
			style = {style}>
                <div className = "tool close" title="delete" onClick={this.props.onDeleteLabel} style = {{display:button}}>☓</div>
				<div className = "title">
					{content}
        		</div>
            </div>
	}
}

function mapDispatch (dispatch, props) {
	return {
		onChangeLabel: function(text) {
			dispatch({type: 'LABEL', from: props.id1, to: props.id2, label: text})
		},
		onDeleteLabel: function() {
			dispatch({type: 'DELETE_LABEL', from: props.id1, to: props.id2})
		}
	}
}

export default connect(null, mapDispatch)(Label)