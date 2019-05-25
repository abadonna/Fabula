import TextBlock from './textblock'

export default class AnnotationBlock extends TextBlock {
    constructor(props) {
        super(props)
		this.state.class = "annotation"
		this.state.container = false
    }
}