
const { ccclass, property, requireComponent, menu } = cc._decorator;

const UnitConfig = [
    { value: Math.pow(10, 4), unit: '万' },
    { value: Math.pow(10, 8), unit: '亿' }
];

@ccclass
@requireComponent(cc.Label)
@menu('tools/UnitLabel')
export default class UnitLabel extends cc.Component {

    _string = '';

    set string(v) {
        this._string = v;
        let val = Number(v);
        let unit = '';
        if (val > UnitConfig[0].value) {
            let cfg = UnitConfig.find((value, i, array) => {
                if (i === array.length - 1) {
                    return true;
                }
                let begin = i === 0 ? 0 : value.value;
                let end = array[i + 1].value;
                return val >= begin && val < end;
            });
            val /= cfg.value;
            unit = cfg.unit;
        }
        let str = val.toFixed(2);
        if (str.indexOf('.') >= 0) {
            let lastIdx = str.length - 1;
            while (str[lastIdx] === '0') {
                str = str.substring(0, lastIdx);
                lastIdx--;
            }
            if (str[lastIdx] === '.') {
                str = str.substring(0, lastIdx);
            }
        }
        this.label.string = str + unit;
    }

    get string() {
        return this._string;
    }

    _label: cc.Label = null;
    get label() {
        if (!this._label) {
            this._label = this.node.getComponent(cc.Label);
        }
        return this._label;
    }

}

if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
        ffb.dataManager.registLabelLike('unitlabel', 'UnitLabel');
    });
}
