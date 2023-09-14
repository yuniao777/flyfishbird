
import ExtBase from "./ExtBase";
const { ccclass, requireComponent, property } = cc._decorator;

@ccclass
@requireComponent(cc.ScrollView)
export default class ScrollViewExtBase extends ExtBase {

    @property(cc.Prefab) prefabs: cc.Prefab[] = [];

    paddingBottom = 0;
    paddingTop = 0;
    @property spacingY = 0;
    paddingLeft = 0;
    paddingRight = 0;
    spacingX = 0;

    /**
     * 0纵向排列。
     * 1横向排列。
     * 2网格排列。 
     * 默认为0
     */
    type = 0;

    // _layoutDirty = false;
    _scrollView: cc.ScrollView = null;

    get scrollView() {
        if (!this._scrollView) {
            this._scrollView = this.getComponent(cc.ScrollView);
        }
        return this._scrollView;
    }

    onEnable() {
        this.node.on('scrolling', this.onScrollViewScroll, this);
        this.updateLayout();
    }

    onDisable() {
        this.node.off('scrolling', this.onScrollViewScroll, this);
    }

    onScrollViewScroll() {

    }

    updateLayout() {
        // if (!this._layoutDirty) {
        //     return;
        // }

        let scrollView = this.getComponent(cc.ScrollView);
        let content = scrollView.content;

        let type = this.type;
        if (type == 0) {
            let paddingTop = this.paddingTop;
            let paddingBottom = this.paddingBottom;
            let spacingY = this.spacingY;
            let topY = content.height * (1 - content.anchorY);

            let height = paddingTop;
            for (let i = 0; i < content.children.length; ++i) {
                let child = content.children[i];
                child.y = topY - height - child.height * (1 - child.anchorY);
                height += child.height + spacingY;
            }
            content.height = Math.max(content.parent.height, paddingBottom + height - spacingY);
        } else if (type == 1) {
            let paddingLeft = this.paddingLeft;
            let paddingRight = this.paddingRight;
            let spacingX = this.spacingX;
            let leftX = - content.width * content.anchorX;
            let width = paddingLeft;
            for (let i = 0; i < content.children.length; ++i) {
                let child = content.children[i];
                child.x = leftX + width + child.width * child.anchorX;
                width += child.width + spacingX;
            }
            content.width = Math.max(content.parent.width, paddingRight + width - spacingX);
        } else if (type == 2) {
            let paddingLeft = this.paddingLeft;
            let spacingX = this.spacingX;
            let paddingTop = this.paddingTop;
            let paddingBottom = this.paddingBottom;
            let spacingY = this.spacingY;

            let topY = content.height * (1 - content.anchorY);
            let rightX = content.width * (1 - content.anchorX);
            let startX = -content.width * content.anchorX + paddingLeft;
            let x = startX;
            let height = paddingTop;
            for (let i = 0; i < content.children.length; ++i) {
                let child = content.children[i];
                if (x + child.width > rightX) {
                    x = startX;
                    height += child.height + spacingY;
                }
                child.x = x + child.width * child.anchorX;
                child.y = topY - height - child.height * (1 - child.anchorY);
                x += child.width + spacingX;
            }
            if (content.children.length > 0) {
                height += content.children[0].height + paddingBottom;
            }
            content.height = Math.max(content.parent.height, height);
        }

        // this._layoutDirty = false;
    }
}
