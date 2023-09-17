import { setSpriteFrame } from "../DataDealer";


const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
@menu('ffb 工具组件/VarSprite')
export default class VarSprite extends cc.Component {

    _string = '';
    set string(v: string) {
        this._string = v;
        setSpriteFrame(this.sprite, v);
    }

    get string() {
        return this._string;
    }

    _sprite
    get sprite() {
        if (!this._sprite) {
            this._sprite = this.node.getComponent(cc.Sprite);
        }
        return this._sprite;
    }

}

if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_GAME_INITED, () => {
        ffb.dataManager.registLabelLike('varsprite', 'VarSprite');
    });
}