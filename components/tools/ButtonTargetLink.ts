
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('ffb ui组件/ButtonTargetLink')
export default class ButtonTargetLink extends cc.Component {

    @property(cc.Node) targets: cc.Node[] = [];

    originalColors: cc.Color[] = [];
    originalScale: number[] = [];

    protected start(): void {
        for (let i = 0; i < this.targets.length; ++i) {
            this.originalColors.push(this.targets[i].color);
            this.originalScale.push(this.targets[i].scale);
        }
    }

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.COLOR_CHANGED, this.onColorChanaged, this);
        this.node.on(cc.Node.EventType.SCALE_CHANGED, this.onScaleChanaged, this);
    }

    protected onDisable(): void {
        this.node.on(cc.Node.EventType.COLOR_CHANGED, this.onColorChanaged, this);
        this.node.on(cc.Node.EventType.SCALE_CHANGED, this.onScaleChanaged, this);
    }

    onColorChanaged() {
        let color = this.node.color;
        for (let i = 0; i < this.targets.length; ++i) {
            this.targets[i].color = this.originalColors[i].multiply(color);
        }
    }

    onScaleChanaged() {
        let scale = this.node.scale;
        for (let i = 0; i < this.targets.length; ++i) {
            this.targets[i].scale = this.originalScale[i] * scale;
        }
    }

}
