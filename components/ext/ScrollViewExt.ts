import ScrollViewExtBase from "./ScrollViewExtBase";

const { ccclass, requireComponent, property, menu } = cc._decorator;

@ccclass
@requireComponent(cc.ScrollView)
@menu('ffb ui组件/ScrollViewExt')
export default class ScrollViewExt extends ScrollViewExtBase {

    itemLength = 0;
    _items: { idx?: number }[] = [];

    set items(v) {
        this.setItem(v);
    }

    get items() {
        return this._items;
    }

    setItem(v) {
        this._items = v;
        this.updateVars();
        return this.updateItems();
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
        return new Promise((resolve) => {
            let counter = new ffb.Tools.Counter(() => { resolve(null) });

            let content = this.scrollView.content;
            let length = content.children.length;
            for (let i = length - 1; i >= 0; --i) {
                ffb.gameManager.destroyNode(content.children[i]);
            }
            for (let i = 0; i < this.items.length; ++i) {
                let page = this.items[i];
                let prefab = this.prefabs[page.idx ?? 0];
                let node = cc.instantiate(prefab);
                content.addChild(node);
                counter.addCount();
                ffb.dataManager.dealData(node, page, this.dispatchPriority, false, this.genVarGroup(i)).then(() => { counter.complelteOnce(); });
            }
            this.updateLayout();

            counter.complelteOnce();
        });
    }

}

if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_GAME_INITED, () => {
        ffb.dataManager.registKeyword('scrollviewasync', 'ScrollViewExt', 'items');
        ffb.dataManager.registKeywordPromise('scrollview', 'ScrollViewExt', (comp: ScrollViewExt, v) => {
            return comp.setItem(v);
        });
    });
}