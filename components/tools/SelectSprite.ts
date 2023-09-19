
const { ccclass, property, requireComponent, menu } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
@menu('tools/SelectSprite')
export default class SelectSprite extends cc.Component {

    @property(cc.SpriteFrame) selectSpriteFrame = null;
    @property(cc.SpriteFrame) unselectSpriteFrame = null;

    sprite: cc.Sprite = null;
    protected onLoad(): void {
        this.sprite = this.getComponent(cc.Sprite);
    }

    protected start(): void {

    }

    select(selected: Boolean) {
        this.sprite.spriteFrame = selected ? this.selectSpriteFrame : this.unselectSpriteFrame;
    }
}
