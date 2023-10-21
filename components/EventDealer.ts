import NodeEventTag from "./tools/NodeEventTag";

const { ccclass, disallowMultiple } = cc._decorator;

let EVENT_COUNTER = 0;

@ccclass
@disallowMultiple
export default class EventDealer extends cc.Component {

    protected eventFinished: { [key: string]: boolean } = {};

    protected onLoad(): void {
        this.addGlobalEvent();
    }

    addGlobalEvent() {
        let events = ffb.dataManager.getEvents(this.node.name);
        if (events) {
            this.dealEvents(events);
        }
    }

    dealEvents(events: ffb.TypeEvents) {
        let _this = this;
        for (const key in events) {
            const eventInfo = events[key];
            let event_id = key + EVENT_COUNTER ++;
            this.node.on(key, function () {
                let args = [];
                let tag = _this.node.getComponent(NodeEventTag);
                if (tag) {
                    args.push(tag.getTag());
                }
                for (let i = 0; i < arguments.length; ++i) {
                    args.push(arguments[i]);
                }
                _this.callEvent(eventInfo, args, event_id);
            }, eventInfo.target, eventInfo.useCapture);
        }
    }

    async callEvent(eventInfo: ffb.EventInfo, args: any[], key: string) {
        if (this.eventFinished[key] === false) {
            return;
        }
        this.eventFinished[key] = false;
        await eventInfo.callback.apply(eventInfo.target, args);
        this.eventFinished[key] = true;
    }

}
