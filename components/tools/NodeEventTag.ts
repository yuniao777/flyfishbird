
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('ffb 工具组件/NodeEventTag')
export default class NodeEventTag extends cc.Component {

    @property tag = '';

    getTag(): { tag: string, extra?: {} } {
        return { tag: this.tag }
    }
}
