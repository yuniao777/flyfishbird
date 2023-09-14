import ScrollViewExtBase from "./ScrollViewExtBase";
import TableViewItem from "./TableViewItem";

const { ccclass, requireComponent, property, menu } = cc._decorator;


@ccclass
@requireComponent(cc.ScrollView)
@menu('ffb ui组件/TableView')
export default class TableView extends ScrollViewExtBase {

    _items = [];     //其中idx表示第几个prefab，不设置，默认为第0个,height表示高度
    async = false;
    itemLength = 0;

    itemY: number[] = [];

    nodePool = new cc.NodePool();

    needUpdate = false;

    set items(v) {
        this._items = v;
        this.itemChangedNeedUpdate();
    }

    get items() {
        return this._items;
    }

    onScrollViewScroll(): void {
        this.updateShow();
    }

    updateLayout() {
        this.changeNeedUpdate();
    }

    changeNeedUpdate() {
        this.needUpdate = true;
    }

    update() {
        if (!this.needUpdate) {
            return;
        }
        this.updateRightNow();
    }

    updateRightNow() {
        this.needUpdate = false;
        this.resetContentHeight();
        return this.updateShow();
    }

    resetContentHeight() {
        let count = this.items.length;
        let totalHeight = this.paddingTop;
        this.itemY = [];
        for (let i = 0; i < count; ++i) {
            this.itemY.push(totalHeight);
            // console.log(totalHeight);
            let item = this.items[i];
            totalHeight += item.height ? item.height : this.prefabs[item.idx ?? 0].data.height + this.spacingY;
        }
        totalHeight -= this.spacingY;
        this.itemY.push(totalHeight);
        let height = this.paddingBottom + totalHeight;
        let content = this.scrollView.content;
        content.height = Math.max(content.parent.height, height);

        let min = content.parent.height * (1 - content.parent.anchorY) - (1 - content.anchorY) * content.height;
        let max = min + content.height - content.parent.height
        content.y = Math.max(min, Math.min(max, content.y));
        // console.log('resetContentHeight', content.height);
    }

    updateShow() {
        // console.log('updateShow');
        let itemCount = this.items.length;

        let content = this.scrollView.content;
        let parent = content.parent;

        let topY = content.position.y + content.height * (1 - content.anchorY);
        let beginY = topY - parent.height * (1 - parent.anchorY);
        let endY = topY + parent.height * parent.anchorY;

        // let begin = Math.max(Math.floor((beginY - this.paddingTop + this.spacingY) / (this.prefab.data.height + this.spacingY)), 0);
        // let end = Math.min(Math.ceil((endY - this.paddingTop) / (this.prefab.data.height + this.spacingY)), itemCount);
        let begin = this.itemY.length, end = 0;
        // let contains = [];
        for (let i = 0; i < itemCount; ++i) {
            let v1 = this.itemY[i] - beginY;
            let v2 = this.itemY[i] - endY;
            let v3 = this.itemY[i + 1] - beginY;
            let v4 = this.itemY[i + 1] - endY;
            if ((v1 < 0 && v3 < 0) || (v2 > 0 && v4 > 0)) {
                continue;
            }
            if (i < begin) {
                begin = i;
            }
            if (i > end) {
                end = i;
            }
        }

        // console.log(begin, end);

        return new Promise((resolve) => {

            let counter = new ffb.Tools.Counter(() => {
                resolve(null);
            });

            let children = this.scrollView.content.children;
            let shouldRemove: { index: number, node: cc.Node }[] = [];
            for (let i = 0; i < children.length; ++i) {
                let child = children[i];
                let tableViewItem = child.getComponent(TableViewItem);
                shouldRemove.push({ index: tableViewItem.index, node: child });
            }

            let shouldAdd = [];

            for (let i = begin; i <= end; ++i) {
                let find = false;
                for (let j = 0; j < shouldRemove.length; ++j) {
                    if (shouldRemove[j].index === i) {
                        find = true;
                        shouldRemove.splice(j, 1);
                    }
                }
                if (!find) {
                    shouldAdd.push(i);
                }
            }
            for (let i = 0; i < shouldRemove.length; ++i) {
                this.removeFromTableView(shouldRemove[i].node);
            }

            for (let i = 0; i < shouldAdd.length; ++i) {
                counter.addCount();
                this.addToTableView(shouldAdd[i]).then(() => {
                    counter.complelteOnce();
                });
            }

            counter.complelteOnce();
        });
    }

    private removeFromTableView(node: cc.Node) {
        ffb.dataManager.resetDataListen(node);
        // node.destroy();
        this.nodePool.put(node);
    }

    private addToTableView(i: number) {
        let node = this.nodePool.get();
        let item = this.items[i];
        let tableViewItem: TableViewItem = null;
        if (!node) {
            node = cc.instantiate(this.prefabs[item.idx ?? 0]);
        }
        tableViewItem = node.getComponent(TableViewItem);
        if (!tableViewItem) {
            tableViewItem = node.addComponent(TableViewItem);
        }
        tableViewItem.data = item;
        tableViewItem.index = i;
        node.zIndex = i;
        node.y = this.getY(i, node);
        node.parent = this.scrollView.content;
        return ffb.dataManager.dealData(node, item, this.dispatchPriority, this.async, this.genVarGroup(i));
        // await ffb.dataManager.dealData(node, data, DEFAULT_PRIORITY, false, varGroup);
    }

    itemChangedNeedUpdate(updateRightNow: boolean = false) {
        let children = this.scrollView.content.children;
        for (let i = 0; i < children.length; ++i) {
            let child = children[i];
            let tableViewItem = child.getComponent(TableViewItem);

            let idx = this.items.indexOf(tableViewItem.data);
            tableViewItem.index = idx;
            child.y = this.getY(idx, child);
            child.zIndex = idx;
        }
        this.updateVars();
        if (updateRightNow) {
            return this.updateRightNow();
        } else {
            this.changeNeedUpdate();
        }
    }

    getY(i: number, node: cc.Node) {
        let content = this.scrollView.content;
        let paddingTop = this.paddingTop;
        let height = this.itemY[i + 1] - this.itemY[i] - (i === this.items.length - 1 ? 0 : this.spacingY);
        let y = (1 - content.anchorY) * content.height - (this.itemY[i] + height / 2 + (0.5 - node.anchorY) * node.height + paddingTop);
        // console.log(y);
        return y;
    }

    spliceItems<T>(start: number, count: number, items: T[]) {
        if (items) {
            this.items.splice(start, count, items);
        } else {
            this.items.splice(start, count);
        }
        this.itemChangedNeedUpdate();
    }

    pushItems<T>(items: T[]) {
        this.items.push(items);
        this.itemChangedNeedUpdate();
    }

    fiterItems<T>(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any) {
        this.items = this.items.filter(predicate, thisArg);
        this.itemChangedNeedUpdate();
    }

    private genVarGroup(i: number) {
        return `${this.node.name}$$${this.uuid}!!${i}`
    }

    updateVars() {
        for (let i = 0; i < this.itemLength; ++i) {
            ffb.langManager.removeVar(this.genVarGroup(i));
        }
        this.itemLength = this.items.length;
        for (let i = 0; i < this.itemLength; ++i) {
            ffb.langManager.setVar(this.genVarGroup(i), this.items[i]);
        }
    }

    protected onDestroy(): void {
        for (let i = 0; i < this.itemLength; ++i) {
            ffb.langManager.removeVar(this.genVarGroup(i));
        }
    }
}

// if (!CC_EDITOR) {
//     cc.game.on(cc.game.EVENT_GAME_INITED, () => {
//         ffb.dataManager.registeAttribute('TableView', 'items', (comp: TableView, value: []) => {
//             return comp.itemChangedNeedUpdate(true);
//         });
//     });
// }