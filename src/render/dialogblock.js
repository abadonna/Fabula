import Block from './block'

export default class DialogBlock extends Block {
    constructor(props) {
        super(props)
        this.state.content = <div></div>
    }
}
