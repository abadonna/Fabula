import TextBlock from './textblock'
import AnnotationBlock from './annotationblock'
import ImageBlock from './imageblock'
import DialogBlock from './dialogblock'
import {connect} from 'react-redux'

function mapDispatch (dispatch, props) {
	return {
		onChangePosition: function (pos, drag) {
			dispatch({type: 'MOVE', nodeId: props.node.id, x: pos.x, y: pos.y, width: pos.w, height: pos.h, drag: drag})
		},
		onChangeText: function(text) {
			dispatch({type: 'TEXT', nodeId: props.node.id, text: text})
		},
		onStartLink: function(pos) {
			dispatch({type: 'START_LINK', nodeId: props.node.id, x: pos.x, y: pos.y})
		},
		onAddLink: function(target) {
			dispatch({type: 'ADD_LINK', nodeId: props.node.id, targetId: target})
		},
		onMoveLink: function(pos) {
			dispatch({type: 'MOVE_LINK', x: pos.x, y: pos.y})
		},
		onSetImage: function(id, file) {
			dispatch({type: 'IMAGE', nodeId: id, file: file})
		}
	  }
}

export let Text = connect(null, mapDispatch)(TextBlock)
export let Annotation = connect(null, mapDispatch)(AnnotationBlock)
export let Image = connect(null, mapDispatch)(ImageBlock)
export let Dialog = connect(null, mapDispatch)(DialogBlock)