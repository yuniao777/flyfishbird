import { setSpriteFrame } from "../DataDealer";

const { ccclass, requireComponent, menu, property } = cc._decorator;


@ccclass
@requireComponent(cc.Sprite)
@menu('tools/LimitSprite')
export default class LimitSprite extends cc.Component {

    @property maxWidth = 0;
    @property maxHeight = 0;

    loaded: Function = null;
    loadEnd = false;

    set string(v: string) {
        this.loadEnd = false;
        setSpriteFrame(this.sprite, v).then(() => {
            let scaleX = 1, scaleY = 1;
            if (this.maxWidth > 0) {
                scaleX = this.maxWidth / this.node.width;
            }
            if (this.maxHeight > 0) {
                scaleY = this.maxHeight / this.node.height;
            }
            this.node.scale = Math.min(scaleX, scaleY);
            // console.log(this.node.scale);
            this.loaded && this.loaded();
            this.loaded = null;
            this.loadEnd = true;
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
        ffb.dataManager.registLabelLike('limitsprite', 'LimitSprite', (cmp: LimitSprite) => {
            if (cmp.loadEnd) {
                return Promise.resolve();
            } else {
                return new Promise((resolve) => {
                    cmp.loaded = resolve;
                });
            }
        });
    });
}
