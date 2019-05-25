import Block from './block'

export default class TextBlock extends Block {
    constructor(props) {
        super(props)
		this.enterEditMode = this.enterEditMode.bind(this)
		this.exitEditMode = this.exitEditMode.bind(this)
		this.defaultContent = this.defaultContent.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.state.content = this.defaultContent()
		this.state.container = true
	}
	defaultContent() {
		let text = this.formatText(this.props.node.text)
        return <div className = "text" onDoubleClick = {this.enterEditMode}>{text}</div>
	}
	formatText(text) {
		return text.split('\n').map( (t,i) => [t, <br key = {i}/>])
	}
	componentDidUpdate(props, state) {
		super.componentDidUpdate(props, state)
		if (this.props !== props) {
			let text = this.formatText(this.props.node.text)
			this.setState({content: this.defaultContent()})
		}
	}
    enterEditMode(e) {
		this.setState({content: <textarea ref={(el) => this.textArea = el} 
			autoFocus onBlur = {this.exitEditMode} 
			onKeyDown = {this.onKeyDown} 
			defaultValue = {this.props.node.text}/>,
			
			editing: true
		})
        e.stopPropagation()
        e.preventDefault()
    }
    exitEditMode() {
		this.props.onChangeText(this.textArea.value)
		this.setState({editing: false})
	}
	onKeyDown(e) {
		if (event.keyCode == '27')
		{
			e.stopPropagation()
			e.preventDefault()
			this.setState({content: this.defaultContent(), editing: false})
		}
	}
}