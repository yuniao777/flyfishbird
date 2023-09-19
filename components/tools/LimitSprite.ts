import { setSpriteFrame } from "../DataDealer";

const { ccclass, requireComponent, menu, property } = cc._decorator;


@ccclass
@requireComponent(cc.Sprite)
@menu('tools/LimitSprite')
export default class LimitSprite extends cc.Component {

    @property maxWidth = 0;
    @property maxHeight = 0;

    set string(v: string) {
        setSpriteFrame(this.sprite, v).then(() => {
            let scaleX = 1, scaleY = 1;
            if (this.maxWidth > 0) {
                scaleX = this.node.width / this.maxWidth;
            }
            if (this.maxHeight > 0) {
                scaleY = this.node.height / this.maxHeight;
            }
            this.node.scale = Math.min(scaleX, scaleY);
        });
    }

    _sprite: cc.Sprite = null;

    get sprite() {
        if (!this._sprite) {
            this._sprite = this.node.getComponent(cc.Sprite);
        }
        return this._sprite;
    }
}

if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_GAME_INITED, () => {
        ffb.dataManager.registLabelLike('limitsprite', 'LimitSprite');
    });
}
