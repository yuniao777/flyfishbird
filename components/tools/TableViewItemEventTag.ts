import TableViewItem from "../ext/TableViewItem";
import NodeEventTag from "./NodeEventTag";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('ffb 工具组件/TableViewTag')
export default class TableViewItemEventTag extends NodeEventTag {

    @property(cc.Node) itemNode: cc.Node = null;

    tableViewItem: TableViewItem = null;

    protected onLoad(): void {
        this.tableViewItem = this._getTableViewItemInParents(this.node);
    }

    _getTableViewItemInParents(node: cc.Node) {
        if (!node) {
            return null;
        }
        let tableViewItem = node.getComponent(TableViewItem);
        if (tableViewItem) {
            return tableViewItem
        }
        return this._getTableViewItemInParents(node.parent);
    }

    getTag() {
        return {
            tag: this.tag,
            extra: {
                index: this.tableViewItem.index,
            }
        };
    }
}

