import {createStore} from 'redux'
import {shallowCopy} from './utils'
      
const reducer = function(state, action) {

    if (action.type == "LOAD")
        return action.data

	let clone = shallowCopy(state)
	clone.canBeUndone = true

	if (action.type == "WORKSPACE") {
		clone.workspace = action.nodeId
		return clone
	}

	if (action.type == "ARROW_TYPE") {
		clone.arrowType = action.value
		return clone
	}

	if (action.type == "START_LINK") {
		clone.linking = {from: action.nodeId, x: action.x, y: action.y}
		clone.canBeUndone = false
		return clone
	}

	if (action.type == "MOVE_LINK") {
		clone.linking = {from: clone.linking.from, x: action.x, y: action.y}
		clone.canBeUndone = false
		return clone
	}

	if (action.type == "ADD_LINK") {
		clone.linking = null

		if (action.targetId)
		{
			clone.links = [...state.links]
			clone.links.push({from:action.nodeId, to:action.targetId})
		}else
			clone.canBeUndone = false
		return clone
	}

	if (action.type == "LABEL") {
		clone.links = [...state.links]
		let idx = clone.links.findIndex(link => (link.to == action.to) && (link.from == action.from))
		
		clone.canBeUndone = (clone.links[idx].label != action.label)
		
		clone.links[idx] = {
			from: action.from,
			to: action.to,
			label: action.label
		}

		return clone
	}

	if (action.type == "DELETE_LABEL") {
		clone.links = [...state.links]
		let idx = clone.links.findIndex(link => (link.to == action.to) && (link.from == action.from))
		clone.canBeUndone = clone.links[idx].label ? true : false

		clone.links[idx] = {
			from: action.from,
			to: action.to
		}

		return clone
	}

	if (action.type == "CREATE_LABEL") {
		clone.canBeUndone = false
		clone.links = [...state.links]
		let idx = clone.links.findIndex(link => (link.to == action.to) && (link.from == action.from))
		clone.links[idx] = {
			from: action.from,
			to: action.to,
			label: ""
		}

		return clone
	}

	if (action.type == "DELETE_LINK") {
		clone.links = [...state.links]
		let idx = clone.links.findIndex(link => (link.to == action.to) && (link.from == action.from))
		clone.links.splice(idx, 1)
		return clone
	}
	
	if (action.nodeId)
	{
		clone.nodes = state.nodes ? [...state.nodes] : [{}]
		let idx = clone.nodes.findIndex(n => n.id == action.nodeId),
			node = null

		if (idx > -1) {
			node = shallowCopy(clone.nodes[idx])
			clone.nodes[idx] = node
		}

		if (action.type == "IMAGE") {
			node.image = action.file
		}
		
		if (action.type == "ADD")
		{
			let child = {
				title: "untitled",
				text: "empty",
				height: 200,
				width: 200,
				y: action.y,
				x: action.x,
				type: action.block,
				id: "flow" + clone.nextEntityId }
				
			clone.nextEntityId += 1

			clone.nodes.push(child)
			if (node) {
				node.nodes = node.nodes ? [...node.nodes] : []
				node.nodes.push(child.id)
			}
		}

		if (action.type == "MOVE") {
			node.x = action.x
			node.y = action.y
			node.width = action.width
			node.height = action.height
			clone.canBeUndone = !action.drag
		}
		
		if (action.type == "TEXT") {
			clone.canBeUndone = (node.text != action.text)
			node.text = action.text
		}

		if (action.type == "TITLE") {
			clone.canBeUndone = (node.title != action.title)
			node.title = action.title
		}

		if (action.type == "DELETE_NODE") {
			clone.nodes.splice(idx, 1)
			//remove all nested
			if (node.nodes)
				node.nodes.forEach(childId => {
					let idx = clone.nodes.findIndex(n => n.id == childId)
					clone.nodes.splice(idx, 1)
				})

			//remove from parent
			node = clone.nodes.find(n => n.nodes && n.nodes.some(id => id == action.nodeId))
			if (node && node.nodes) {
				node.nodes = [...node.nodes]
				idx = node.nodes.findIndex(id => id == action.nodeId)
				node.nodes.splice(idx, 1)
			}

			// delete links	
			clone.links = [...state.links]
			while (true) {
				idx = clone.links.findIndex(link => (link.to == action.nodeId) || (link.from == action.nodeId)) 
				if (idx == -1)
					break
				clone.links.splice(idx, 1)
			}
		}
	}
	
    return clone
}

export default function(data) {return createStore(reducer, data)}