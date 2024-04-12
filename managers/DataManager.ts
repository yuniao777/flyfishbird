import DataDealer from "../components/DataDealer";
import EventDealer from "../components/EventDealer";


class DataManager {

    nodeTaskTags = {};

    registAttrs: { [key: string]: { [key: string]: { set: ffb.AttrSetFun } } } = {};
    registKeywords: { [key: string]: ffb.KeywordAttr } = {};
    events: ffb.NodeEvents = {};
    langAttrs: { keyword: string, compName: string, wait?: ffb.AttrSetFun }[] = [];

    registAttribute(compName: string, attrName: string, set: ffb.AttrSetFun) {
        let attributes = this.registAttrs[compName]
        if (!attributes) {
            attributes = this.registAttrs[compName] = {};
        }
        attributes[attrName] = { set: set };
    }

    getAttribute(compName: string, attrName: string,) {
        return this.registAttrs?.[compName]?.[attrName];
        // return this.registAttrs[compName];
    }

    registKeyword(keyword: string, compName: string, key: string) {
        this.registKeywords[keyword] = { compName, key };
    }

    registKeywordNode(keyword: string, nodeSet: ffb.NodeSetFun) {
        this.registKeywords[keyword] = { nodeSet };
    }

    registKeywordPromise(keyword: string, compName: string, set: ffb.AttrSetFun) {
        this.registKeywords[keyword] = { compName, set }
    }

    getKeywordAttribute(key: string) {
        return this.registKeywords[key];
    }

    registLabelLike(keyword: string, compName: string, wait?: ffb.AttrSetFun) {
        let attr = this.langAttrs.find((info) => info.keyword === keyword);
        if (attr) {
            cc.error('请不要重复注册 ' + keyword);
            return;
        }
        this.langAttrs.push({ keyword, compName, wait });
    }

    getLabelLikes() {
        return this.langAttrs;
    }

    registEvent(nodeName: string, eventType: string, callback: Function, target?: any, useCapture?: boolean) {
        let nodeNameEvents = this.events[nodeName];
        if (!nodeNameEvents) {
            nodeNameEvents = this.events[nodeName] = {};
        }
        let callbacks = nodeNameEvents[eventType];
        if (!callbacks) {
            callbacks = nodeNameEvents[eventType] = [];
        }
        callbacks.push({ callback, target, useCapture });
    }

    unregistEvent(nodeName: string, eventType: string, callback?: Function) {
        let nodeNameEvents = this.events[nodeName];
        if (!nodeNameEvents) {
            return;
        }
        let callbacks = nodeNameEvents[eventType];
        if (!callbacks) {
            return;
        }
        let idx = callbacks.findIndex((v) => v.callback === callback);
        if (idx >= 0) {
            callbacks.splice(idx, 1);
        } else {
            console.error(`delete fail ${nodeName} ${eventType}`);
        }
    }

    getEvents(nodeName: string) {
        return this.events[nodeName];
    }

    dealData(node: cc.Node, data: Object, priority: number, async: boolean, varGroup: string) {
        return new Promise((resolve, reject) => {
            if (!cc.isValid(node) || typeof data !== 'object') {
                resolve(null);
                return
            }
            let taskTag = 'DATA_MGR_PRIORITY_TAG_' + node.uuid;
            this.nodeTaskTags[node.uuid] = taskTag;
            let counter = new ffb.Tools.Counter(() => {
                delete this.nodeTaskTags[node.uuid];
                resolve(null);
            });
            counter.addCount();
            this.makeSureRefResourcesLoaded(node).then(() => {
                counter.complelteOnce();
            });
            this._dealDataToAllChildren(node, priority, data, async, taskTag, counter, varGroup);
            counter.complelteOnce();
        });
    }

    private makeSureRefResourcesLoaded(node: cc.Node) {
        return new Promise((resolve) => {
            let active = node.active;   //保存之前的状态
            node.active = true;         //设置为true，让组件初始化
            let pageviews = node.getComponentsInChildren(cc.PageView);
            for (let i = 0; i < pageviews.length; ++i) {
                let pageview = pageviews[i]
                let ext = pageview.node.getComponent('PageViewExt');
                if (ext && ext.pageIndex) {
                    pageview.scrollToPage(ext.pageIndex, 0);
                    pageview.setCurrentPageIndex(ext.pageIndex);
                    pageview['update'](1);
                }
            }
            let counter = new ffb.Tools.Counter(() => {
                resolve(null);
            });
            let sprites = node.getComponentsInChildren(cc.Sprite);
            for (let i = 0; i < sprites.length; ++i) {
                let sp = sprites[i];
                if (sp.spriteFrame) {
                    counter.addCount();
                    sp.spriteFrame['onTextureLoaded'](function () {
                        counter.complelteOnce();
                    });
                }
            }
            let labels = node.getComponentsInChildren(cc.Label);
            for (let i = 0; i < labels.length; ++i) {
                let label = labels[i];
                if (label.font instanceof cc.BitmapFont) {
                    counter.addCount();
                    label.font['spriteFrame'].onTextureLoaded(function () {
                        counter.complelteOnce();
                    });
                }
            }
            node.active = false;        //设置为false，让组件暂停运行
            node.active = active;       //恢复之前的状态
            counter.complelteOnce();
        });
    }

    private _dealDataToAllChildren(node: cc.Node, priority: number, data, async: boolean, taskTag: string, counter: ffb.Tools.Counter, varGroup: string) {
        let nodeInData = node.name in data && data[node.name] !== undefined;
        // let dataParent = null;
        // for (const key in data) {
        // dataParent = data[key];
        // if (node.name in data && data[node.name] !== undefined) {
        //     nodeInData = true;
        // break;
        // }
        // }
        let nodeInLanguage = ffb.langManager.containKey(node.name);
        if (nodeInData || nodeInLanguage) {
            let comp = node.getComponent(DataDealer) || node.addComponent(DataDealer);
            if (nodeInLanguage) {
                comp.bindLanguage(varGroup);
            }
            if (nodeInData) {
                counter.addCount();
                // comp.dealData(dataParent, async, priority, taskTag).then(() => {
                comp.dealData(data, async, priority, taskTag, varGroup).then(() => {
                    counter.complelteOnce();
                });
            }
        }
        let events = this.getEvents(node.name);
        if (events) {
            node.getComponent(EventDealer) || node.addComponent(EventDealer);
        }
        let children = node.children;
        for (let i = 0, l = children.length; i < l; i++) {
            let c = children[i];
            this._dealDataToAllChildren(c, priority, data, async, taskTag, counter, varGroup);
        }
    }

    addNodeEvents(node: cc.Node, nodeEvents: ffb.NodeEvents) {
        let events = nodeEvents[node.name];
        if (events) {
            let comp = node.getComponent(EventDealer) || node.addComponent(EventDealer);
            comp.dealEvents(events);
        }
        let children = node.children;
        for (let i = 0, l = children.length; i < l; i++) {
            let c = children[i];
            this.addNodeEvents(c, nodeEvents);
        }
    }

    changePriority(node: cc.Node, priority: number) {
        let tag: string = this.nodeTaskTags[node.uuid];
        if (tag) {
            ffb.taskDispatcher.changeQueenPriority(tag, priority);
        }
    }

    resetDataListen(node: cc.Node) {
        let tag: string = this.nodeTaskTags[node.uuid];
        if (tag) {
            ffb.taskDispatcher.clearTaskQueens(tag);
        }
        let dataDealers = node.getComponentsInChildren(DataDealer);
        for (let i = 0; i < dataDealers.length; ++i) {
            dataDealers[i].removeAll();
        }
        delete this.nodeTaskTags[node.uuid];
    }
}

export default DataManager;

