import SelectSprite from "./SelectSprite";

const { ccclass, property, requireComponent, menu } = cc._decorator;

@ccclass
@menu('tools/SelectController')
export default class SelectController extends cc.Component {

    set select(v: number) {
        for (let i = 0; i < this.selectSprites.length; ++i) {
            this.selectSprites[i].select(i === v);
        }
    }

    selectSprites: SelectSprite[] = [];

    protected onLoad(): void {
        let selectSprites: SelectSprite[] = [];
        for (let i = 0; i < this.node.childrenCount; ++i) {
            let selectSprite = this.node.children[i].getComponent(SelectSprite);
            selectSprite && selectSprites.push(selectSprite);
        }
        this.selectSprites = selectSprites;
    }

    protected start(): void {

    }
}

if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_GAME_INITED, () => {
        ffb.dataManager.registKeyword('selectctr', 'SelectController', 'select')
    });
}