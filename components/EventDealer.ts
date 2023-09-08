import NodeEventTag from "./tools/NodeEventTag";

const { ccclass, disallowMultiple } = cc._decorator;

@ccclass
@disallowMultiple
export default class EventDealer extends cc.Component {

    protected onLoad(): void {
        this.addEvent();
    }

    addEvent() {
        let _this = this;
        let events = ffb.dataManager.getEvents(this.node.name);
        if (!events) {
            return;
        }
        for (const key in events) {
            const eventInfo = events[key];
            this.node.on(key, function () {
                let args = [];
                let tag = _this.node.getComponent(NodeEventTag);
                if (tag) {
                    args.push(tag.getTag());
                }
                for (let i = 0; i < arguments.length; ++i) {
                    args.push(arguments[i]);
                }
                eventInfo.callback.apply(eventInfo.target, args)
            }, eventInfo.target, eventInfo.useCapture);
        }
    }
}
