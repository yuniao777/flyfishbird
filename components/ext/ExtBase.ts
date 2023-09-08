
const { ccclass } = cc._decorator;

@ccclass
export default class ExtBase extends cc.Component {

    _dispatchPriority = 0;

    set dispatchPriority(v) {
        this._dispatchPriority;
    }

    get dispatchPriority() {
        return this._dispatchPriority;
    }

    

}
