
const { ccclass } = cc._decorator;
@ccclass
export default class TableViewItem extends cc.Component {

    _data = null;

    index: number = -1;

    set data(v) {
        this._data = this.data;
        this.onDataChanged();
    }

    get data() {
        return this._data;
    }

    onDataChanged() {

    }

}
