
const { ccclass, property, executeInEditMode, menu } = cc._decorator;

let AlignType = cc.Enum({
    left: 0,
    right: 1,
    top: 2,
    bottom: 3,
});

@ccclass
@executeInEditMode
@menu('ffb ui组件/Padding')
export default class Padding extends cc.Component {
    @property(cc.Node) _target: cc.Node = null;
    @property({ type: cc.Node })
    set target(v: cc.Node) {
        if (CC_EDITOR && v) {
            let parent = this.node.parent;
            if (!parent || parent !== v.parent) {
                Editor.warn('无效的target，target必须和当前节点在同一个父节点下');
                return;
            }
            if (v === this.node) {
                Editor.warn('target不能为自身');
                return;
            }
        }
        // this.removeListen();
        this._target = v;
        // this.addListen();
    }

    @property
    get target() {
        return this._target;
    }

    @property({ type: AlignType }) _type = AlignType.left;
    @property({ type: AlignType })
    set type(v: number) {
        this._type = v;
        this.markUpdate();
    }

    @property
    get type() {
        return this._type;
    }

    @property _value = 0;
    @property
    set value(v: number) {
        this._value = v;
        this.markUpdate();
    }

    @property
    get value() {
        return this._value;
    }

    needUpdate = true;

    protected onEnable(): void {
        if (!this._target) {
            return;
        }
        this.addListen();
    }

    protected onDisable(): void {
        if (!this._target) {
            return;
        }
        this.removeListen();
    }

    addListen() {
        let target = this._target;
        target.on(cc.Node.EventType.ANCHOR_CHANGED, this.markUpdate, this);
        target.on(cc.Node.EventType.POSITION_CHANGED, this.markUpdate, this);
        target.on(cc.Node.EventType.SIZE_CHANGED, this.markUpdate, this);
        target.on(cc.Node.EventType.SCALE_CHANGED, this.markUpdate, this);

        let node = this.node;
        node.on(cc.Node.EventType.ANCHOR_CHANGED, this.markUpdate, this);
        node.on(cc.Node.EventType.POSITION_CHANGED, this.markUpdate, this);
        node.on(cc.Node.EventType.SIZE_CHANGED, this.markUpdate, this);
        node.on(cc.Node.EventType.SCALE_CHANGED, this.markUpdate, this);
    }

    removeListen() {
        let target = this._target;
        target.off(cc.Node.EventType.ANCHOR_CHANGED, this.markUpdate, this);
        target.off(cc.Node.EventType.POSITION_CHANGED, this.markUpdate, this);
        target.off(cc.Node.EventType.SIZE_CHANGED, this.markUpdate, this);
        target.off(cc.Node.EventType.SCALE_CHANGED, this.markUpdate, this);

        let node = this.node;
        node.off(cc.Node.EventType.ANCHOR_CHANGED, this.markUpdate, this);
        node.off(cc.Node.EventType.POSITION_CHANGED, this.markUpdate, this);
        node.off(cc.Node.EventType.SIZE_CHANGED, this.markUpdate, this);
        node.off(cc.Node.EventType.SCALE_CHANGED, this.markUpdate, this);
    }

    markUpdate() {
        this.needUpdate = true;
    }

    update() {
        if (!this.needUpdate) {
            return;
        }

        let target = this.target;
        if (!target) {
            return;
        }

        let node = this.node;

        switch (this.type) {
            case AlignType.right:
                node.x = target.x - target.anchorX * target.scaleX * target.width - this.value - node.scaleX * node.width * (1 - node.anchorX);
                break;
            case AlignType.left:
                node.x = target.x + (1 - target.anchorX) * target.scaleX * target.width + this.value + node.scaleX * node.width * node.anchorX;
                break;
            case AlignType.top:
                node.y = target.y - target.anchorY * target.scaleY * target.height - this.value - node.scaleY * node.height * (1 - node.anchorY);
                break;
            case AlignType.bottom:
                node.y = target.y + (1 - target.anchorY) * target.scaleY * target.height + this.value + node.scaleY * node.height * node.anchorY;
                break;
        }
        this.needUpdate = false;
    }
}

