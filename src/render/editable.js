export default class Editable extends React.Component {
	constructor(props) {
        super(props)
		this.enterEditMode = this.enterEditMode.bind(this)
		this.exitEditMode = this.exitEditMode.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.state = {edit:false}
	}
	
	enterEditMode(e) {
        this.setState({edit: true})
        e.stopPropagation()
        e.preventDefault()
    }
    exitEditMode(e) {
		this.setState({edit: false})
	}
	onKeyDown(e) {
		if (event.keyCode == '13')
		{
			e.stopPropagation()
			e.preventDefault()
			this.exitEditMode()
		}else if (event.keyCode == '27')
		{
			e.stopPropagation()
			e.preventDefault()
			this.setState({edit: false})
		}
	}
	componentDidUpdate(props, state) {
		if (this.props.text !== props.text)
			this.setState({edit: false})
	}
	
	render() {
		return "dummy"
	}
}