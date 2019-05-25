import Editable from './editable'
import {connect} from 'react-redux'

class Header extends Editable {
	exitEditMode(e) {
		super.exitEditMode(e)
		this.props.onChangeTitle(this.input.value)
	}
	
	render() {
		let content = this.state.edit 
			? <input ref={(el) => this.input = el} autoFocus onKeyDown = {this.onKeyDown} onBlur = {this.exitEditMode} defaultValue = {this.props.text}></input>
			: <div className = "text" onDoubleClick = {this.enterEditMode}>{this.props.text}</div>
		
		let button = this.props.menu ? "block" : "none"
		let button2 = this.props.menu && this.props.container ? "block" : "none"

		return <div className = "menu">
                <div className = "tool close" title="delete" onClick={this.props.onDeleteNode} style = {{display:button}}>☓</div>
                <div className = "tool drill" title="inside" onClick={this.props.onChangeWorkspace} style = {{display:button2}}>⬇</div>
				<div className = "title">
					{content}
        		</div>
            </div>
	}
}

function mapDispatch (dispatch, props) {
	return {
		onChangeTitle: function(title) {
			dispatch({type: 'TITLE', nodeId: props.node.id, title: title})
		},
		onDeleteNode: function() {
			dispatch({type: 'DELETE_NODE', nodeId: props.node.id})
		},
		onChangeWorkspace: function() {
			dispatch({type: 'WORKSPACE', nodeId: props.node.id})
		}
	}
}

export default connect(null, mapDispatch)(Header)
