
const { ccclass, property, menu } = cc._decorator;


@ccclass
@menu('ffb 工具组件/PrefabLoader')
export default class PrefabLoader extends cc.Component {

    @property(cc.Prefab) prefab: cc.Prefab = null;
    @property() zIndex = 0;

    protected onLoad(): void {
        this.node.addChild(cc.instantiate(this.prefab), this.zIndex);
    }

}
