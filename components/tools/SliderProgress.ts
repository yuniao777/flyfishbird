
const { ccclass, property, requireComponent, menu } = cc._decorator;

@ccclass
@menu('tools/SliderProgress')
@requireComponent(cc.Slider)
export default class SliderProgress extends cc.Component {

    set progress(v) {
        this.progressBar.progress = v;
        this.slider.progress = v;
    }

    get progress() {
        return this.progressBar.progress;
    }

    _slider: cc.Slider = null;
    get slider() {
        if (!this._slider) {
            this._slider = this.getComponent(cc.Slider);
        }
        return this._slider;
    }

    _progressBar: cc.ProgressBar = null;
    get progressBar() {
        if (!this._progressBar) {
            this._progressBar = this.getComponent(cc.ProgressBar);
        }
        return this._progressBar;
    }

    protected onLoad(): void {
        this.addEvent();
    }

    addEvent() {
        let event = new cc.Component.EventHandler();
        event.target = this.node;
        event.component = 'SliderProgress';
        event.handler = 'onSlider';
        this.slider.slideEvents.push(event);
    }

    onSlider() {
        this.progressBar.progress = this.slider.progress;
    }

}


if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
        ffb.dataManager.registKeyword('sliderprogress', 'SliderProgress', 'progress');
    });
}
