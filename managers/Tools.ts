
class Counter {

    private count = 1;
    private complete: Function = null;

    constructor(complete: () => any) {
        this.complete = complete;
    }

    addCount() {
        this.count++;
    }

    complelteOnce() {
        this.count--;
        if (this.count <= 0 && this.complete) {
            this.complete();
            this.complete = null;
        }
    }
}

function getLabelHeight(func: (cal: (str: string, size: cc.Size, attribute: Record<string, any>) => number) => void) {
    let node = new cc.Node();
    let label = node.addComponent(cc.Label);
    cc.find('Canvas').addChild(node);

    let cal = function (str: string, size: cc.Size, attribute: Record<string, any>) {
        node.setContentSize(size);
        for (const key in attribute) {
            label[key] = attribute[key];
        }
        label.string = str;
        label['_assembler'].updateRenderData(label);
        node['_renderFlag'] &= ~cc['RenderFlow'].FLAG_UPDATE_RENDER_DATA;
        // console.log('size test', node.width);
        return node.height;
    }

    func(cal);

    node.destroy();
}

function getRichTextHeight(func: (getHeight: (str: string, size: cc.Size, attribute: Record<string, any>) => number) => void) {
    let node = new cc.Node();
    let label = node.addComponent(cc.RichText);
    cc.find('Canvas').addChild(node);

    let cal = function (str: string, size: cc.Size, attribute: Record<string, any>) {
        node.setContentSize(size);
        for (const key in attribute) {
            label[key] = attribute[key];
        }
        label.string = str;
        label._updateRichText();
        return node.height;
    }

    func(cal);

    node.destroy();
}

function randomInt(lower: number, upper: number) {
    lower = Math.ceil(lower);
    upper = Math.floor(upper);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

export default { Counter, getLabelHeight, getRichTextHeight, randomInt }

