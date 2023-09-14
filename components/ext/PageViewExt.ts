import ExtBase from "./ExtBase";

const { ccclass, requireComponent, property, menu } = cc._decorator;

@ccclass
@requireComponent(cc.PageView)
@menu('ffb ui组件/PageViewExt')
export default class PageViewExt extends ExtBase {

    @property(cc.Prefab) prefabs: cc.Prefab[] = [];

    itemLength = 0;
    _pages: { idx?: number }[] = [];

    set pages(v) {
        this._pages = v;
        this.updateVars();
        this.updatePages();
    }

    get pages() {
        return this._pages;
    }

    _pageView: cc.PageView = null;

    get pageView() {
        if (!this._pageView) {
            this._pageView = this.getComponent(cc.PageView);
        }
        return this._pageView;
    }

    protected start(): void {

    }

    private genVarGroup(i: number) {
        return `${this.node.name}$$${this.uuid}!!${i}`
    }

    updateVars() {
        for (let i = 0; i < this.itemLength; ++i) {
            ffb.langManager.removeVar(this.genVarGroup(i));
        }
        this.itemLength = this.pages.length;
        for (let i = 0; i < this.itemLength; ++i) {
            ffb.langManager.setVar(this.genVarGroup(i), this.pages[i]);
        }
    }

    protected onDestroy(): void {
        for (let i = 0; i < this.itemLength; ++i) {
            ffb.langManager.removeVar(this.genVarGroup(i));
        }
    }

    updatePages() {
        for (let i = 0; i < this.pageView.content.children.length; ++i) {
            ffb.gameManager.destroyNode(this.pageView.content.children[i]);
        }
        this.pageView.removeAllPages();
        for (let i = 0; i < this.pages.length; ++i) {
            let page = this.pages[i];
            let prefab = this.prefabs[page.idx ?? 0];
            let node = cc.instantiate(prefab);
            this.pageView.addPage(node);
            ffb.dataManager.dealData(node, page, this.dispatchPriority, false, this.genVarGroup(i));
        }
    }
}
