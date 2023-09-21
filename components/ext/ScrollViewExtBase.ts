
import ExtBase from "./ExtBase";
const { ccclass, requireComponent, property } = cc._decorator;

const ArrangeType = cc.Enum({
    Vertical: 0,
    Horizontal: 1,
    Grid: 2,
});

@ccclass
@requireComponent(cc.ScrollView)
export default class ScrollViewExtBase extends ExtBase {

    @property({ type: ArrangeType }) type = 0;
    @property(cc.Prefab) prefabs: cc.Prefab[] = [];

    @property({ tooltip: '开启后，当content大小不足以撑满ScrollView时，将自动撑满ScrollView，使content可以滑动' }) autoFull = false;

    @property paddingTop = 0;
    @property paddingLeft = 0;
    @property spacingY = 0;
    @property spacingX = 0;

    paddingRight = 0;
    paddingBottom = 0;
    /**
     * 0纵向排列。
     * 1横向排列。
     * 2网格排列。 
     * 默认为0
     */

    // _layoutDirty = false;
    _scrollView: cc.ScrollView = null;

    get scrollView() {
        if (!this._scrollView) {
            this._scrollView = this.getComponent(cc.ScrollView);
        }
        return this._scrollView;
    }

    protected onLoad(): void {
        //widget会在update刷新
        if (this.getComponent(cc.Widget)) {
            let content = this.scrollView.content;
            content.parent.on(cc.Node.EventType.SIZE_CHANGED, this.onParentSizeChange, this);
        }
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

    onParentSizeChange() {
        let content = this.scrollView.content;
        content.y = content.parent.height / 2;;
        this.updateLayout();
        content.parent.off(cc.Node.EventType.SIZE_CHANGED, this.onParentSizeChange, this);
    }

    updateLayout() {
        // if (!this._layoutDirty) {
        //     return;
        // }

        let content = this.scrollView.content;

        let type = this.type;
        if (type == 0) {
            let paddingTop = this.paddingTop;
            let paddingBottom = this.paddingBottom;
            let spacingY = this.spacingY;
            let topY = content.height * (1 - content.anchorY);

            let height = paddingTop;
            for (let i = 0; i < content.children.length; ++i) {
                let child = content.children[i];
                if (!cc.isValid(child, true)) {
                    continue;
                }
                child.y = topY - height - child.height * (1 - child.anchorY);
                height += child.height + spacingY;
            }
            if (this.autoFull) {
                content.height = Math.max(content.parent.height, paddingBottom + height - spacingY);
            } else {
                content.height = paddingBottom + height - spacingY;
            }
        } else if (type == 1) {
            let paddingLeft = this.paddingLeft;
            let paddingRight = this.paddingRight;
            let spacingX = this.spacingX;
            let leftX = - content.width * content.anchorX;
            let width = paddingLeft;
            for (let i = 0; i < content.children.length; ++i) {
                let child = content.children[i];
                if (!cc.isValid(child, true)) {
                    continue;
                }
                child.x = leftX + width + child.width * child.anchorX;
                width += child.width + spacingX;
            }
            content.width = paddingRight + width - spacingX;
            // content.width = Math.max(content.parent.width, paddingRight + width - spacingX);
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
                if (!cc.isValid(child, true)) {
                    continue;
                }
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
            if (this.autoFull) {
                content.height = Math.max(content.parent.height, height);
            } else {
                content.height = height;
            }
        }

        // this._layoutDirty = false;
    }
}
