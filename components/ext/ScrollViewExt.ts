import ScrollViewExtBase from "./ScrollViewExtBase";

const { ccclass, requireComponent, property, menu } = cc._decorator;

@ccclass
@requireComponent(cc.ScrollView)
@menu('ffb ui组件/ScrollViewExt')
export default class ScrollViewExt extends ScrollViewExtBase {

    itemLength = 0;
    _items: { idx?: number }[] = [];

    set items(v) {
        this._items = v;
        this.updateVars();
        this.updateItems();
    }

    get items() {
        return this._items;
    }


    protected start(): void {
        this.node.on(cc.Node.EventType.CHILD_REMOVED, this.updateLayout, this);
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

    updateItems() {
        let content = this.scrollView.content;
        for (let i = 0; i < content.children.length; ++i) {
            ffb.gameManager.destroyNode(content.children[i]);
        }
        for (let i = 0; i < this.items.length; ++i) {
            let page = this.items[i];
            let prefab = this.prefabs[page.idx ?? 0];
            let node = cc.instantiate(prefab);
            content.addChild(node);
            ffb.dataManager.dealData(node, page, this.dispatchPriority, false, this.genVarGroup(i));
        }
        this.updateLayout();
    }

}


if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_GAME_INITED, () => {
        ffb.dataManager.registKeyword('scrollview', 'ScrollViewExt', 'items');
    });
}