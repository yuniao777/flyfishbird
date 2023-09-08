
const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Label)
export default class SpeakLabel extends cc.Component {

    @property speed = 10;
    @property maxHeight = 0;

    _string = '';
    set string(v) {
        this.speakEnd = false;
        this.pageEnd = false;
        this.startIndex = 0;
        this._string = v;
        this.label.string = '';
        this.resetSchedule();
    }

    get string() {
        return this._string;
    }

    label: cc.Label = null;

    startIndex = 0;
    speakEnd = true;   //所有内容是否说完
    pageEnd = false;    //当前页面是否说完

    protected onLoad(): void {
        this.label = this.getComponent(cc.Label);
    }

    protected start(): void {

    }

    resetSchedule() {
        this.unschedule(this.speak);
        this.schedule(this.speak, 1 / this.speed);
    }

    speak() {
        if (this.startIndex + this.label.string.length === this.string.length) {
            this.unschedule(this.speak);
            this.speakEnd = true;
            return;
        }
        this.label.string = this.string.substring(this.startIndex, this.startIndex + this.label.string.length + 1);
        this.label._assembler.updateRenderData(this.label);
        this.node._renderFlag &= ~cc.RenderFlow.FLAG_UPDATE_RENDER_DATA;

        if (this.maxHeight <= this.node.height) {
            this.pageEnd = true;
            this.unschedule(this.speak);
            this.label.string = this.string.substring(this.startIndex, this.startIndex + this.label.string.length - 1);
            return false;
        }
        return true;
    }

    showPageContent() {
        while (this.speak()) { }
    }

    nextPage() {
        if (this.speakEnd) {
            return;
        }
        this.pageEnd = false;
        this.startIndex += this.label.string.length;
        this.label.string = "";
        this.resetSchedule();
    }
}
