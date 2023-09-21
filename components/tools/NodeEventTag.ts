
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('ffb 工具组件/NodeEventTag')
export default class NodeEventTag extends cc.Component {

    @property tag: any = '';                //实际上可以是任意类型（boolean、number、string、object），为了方便在编辑器里面编辑，初始化为string

    getTag(): { tag: string, extra?: {} } {
        return { tag: this.tag }
    }
}

if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_GAME_INITED, () => {
        ffb.dataManager.registKeyword('eventtag', 'NodeEventTag', 'tag');
    });
}
