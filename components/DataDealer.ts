import MutilpleDefineProperties, { DefineProperties } from "../managers/MutilpleDefineProperties";

const { ccclass, disallowMultiple } = cc._decorator;
const mutilpleDefineProperties = new MutilpleDefineProperties();

interface DataDefine {
    data: Object;
    props: DefineProperties;
    compName: string;
}

interface DefineData {
    set?: Function;
    data?: { object: Object, key: string };
}

function createDefineSetget(defineData: DefineData) {
    let setter = defineData.set;
    let data = defineData.data;
    if (data) {
        let object = data.object;
        let key = data.key;
        return {
            set: function (v) {
                object[key] = v;
                setter && setter();
            },
            get: function () {
                return object[key];
            }
        };
    } else {
        let value = null;
        return {
            set: function (v) {
                value = v;
                setter && setter(v);
            },
            get: function () {
                return value;
            }
        };
    }
}

@ccclass
@disallowMultiple
export default class DataDealer extends cc.Component {

    dataParent = null;
    langParent = null;

    _varGroup = '';
    dispatchPriority = 0;

    dataDefines: DataDefine[] = null;

    set varGroup(v) {
        this._varGroup = v;
        if (this._varGroup) {
            let index = this._varGroup.indexOf('@{parent}');
            if (index >= 0) {
                let parent = this.findParentsVarGroup(this.node);
                this._varGroup.replace('@{parent}', parent);
            }
        }
    }

    get varGroup() {
        return this._varGroup;
    }


    valueChangeComponent: (compName: string, value: any) => any = null;

    findParentsVarGroup(node: cc.Node) {
        let parent = node;
        if (!parent) {
            return '';
        }
        let dealer = parent.getComponent(DataDealer);
        if (!dealer || !dealer.varGroup) {
            return this.findParentsVarGroup(parent);
        }
        return dealer.varGroup
    }

    dealData(dataParent: Object, async: boolean, priority: number, taskTag: string, varGroup: string) {
        if (this.dataParent) {
            console.error('不能重复绑定节点的数据');
            return Promise.resolve();
        }

        this.dispatchPriority = priority;

        this.dataParent = dataParent;
        this.varGroup = varGroup;

        if (async) {
            return ffb.taskDispatcher.addTaskToPriorityQueens(this.dispatchPriority, taskTag, this._dealData, this);
        } else {
            return this._dealData();
        }
    }

    bindLanguage(varGroup: string) {
        this.varGroup = varGroup;
        this.langParent = null;
        let comp = this.getLabelLikeComp();
        comp && ffb.langManager.bindLanguage(comp, this.langParent, '', this.varGroup);
    }

    unBindLanguage() {
        let comp = this.getLabelLikeComp();
        comp && ffb.langManager.unBindLanguage(comp, this.langParent, this.varGroup);
    }

    getLabelLikeComp() {
        let labelLikes = ffb.dataManager.getLabelLikes();
        for (let i = 0; i < labelLikes.length; ++i) {
            let comp = this.node.getComponent(labelLikes[i].compName);
            if (comp) {
                return comp;
            }
        }
        return null;
    }

    removeAll() {
        this.unBindLanguage();
        this.dealDefineNode(this.dataParent, true);
        if (this.dataDefines) {
            for (let i = 0; i < this.dataDefines.length; ++i) {
                let dataDefine = this.dataDefines[i];
                mutilpleDefineProperties.removeValueProps(dataDefine.data, Object.keys(dataDefine.props), this.node.name, dataDefine.compName, this.node.uuid);
            }
        }
        this.dataParent = null;
        this.dispatchPriority = 0;
        this.dataDefines = null;
    }

    private containBindData(parent: Object) {
        if (!parent) {
            return false;
        }
        return this.node.name in parent;
    }

    private dealDefineNode(dataParent: Object, isRemove: boolean) {
        let contain = this.containBindData(dataParent);
        if (!contain) {
            return;
        }
        let bindData = dataParent[this.node.name];
        if (typeof bindData !== 'object') {
            return;
        }
        if ('node' in bindData) {
            if (isRemove) {
                Object.defineProperty(bindData, 'node', { writable: true, value: null });
            } else {
                Object.defineProperty(bindData, 'node', {
                    get: () => {
                        return this.node;
                    },
                    set: () => {
                        console.error('node is readonly');
                    }
                });
            }
        }
        if ('components' in bindData) {
            if (isRemove) {
                for (const key in bindData['components']) {
                    Object.defineProperty(bindData['components'], key, { writable: true, value: null });
                }
            } else {
                for (const key in bindData['components']) {
                    let comp = this.getComponent(this.getComponentByString(key));
                    Object.defineProperty(bindData['components'], key, {
                        get: () => {
                            //可能是后面才加进去的组件
                            // if (!comp) {
                            //     comp = this.getComponent(key);
                            // }
                            return comp;
                        },
                        set: () => {
                            console.error('components[' + key + '] is readonly');
                        }
                    });
                }
            }
        }
    }

    private getComponentByString(str: string) {
        let compType: any = str;
        let arr = str.split('_');
        if (arr.length >= 2) {
            compType = window;
            for (let i = 0; i < arr.length; ++i) {
                compType = compType[arr[i]]
            }
        }
        return compType;
    }

    private _dealData() {

        this.dealDefineNode(this.dataParent, false);

        let contain = this.containBindData(this.dataParent);
        if (contain) {
            return this._dealDataWithDataParent(this.dataParent);
        }
    }

    private _dealDataWithDataParent(dataParent) {
        return new Promise((resolve, reject) => {
            let data = dataParent[this.node.name];
            let dataType = typeof data;
            let dataDefines: DataDefine[] = [];
            let counter = new ffb.Tools.Counter(() => {
                resolve(null);
            });

            let find = false;
            let keys = this.node.name.split('_');
            let labelLikes = ffb.dataManager.getLabelLikes();
            if (dataType === 'string' || dataType === 'number') {
                let findLabelLike = labelLikes.find((info) => keys.indexOf(info.keyword) >= 0);
                if (findLabelLike) {
                    find = true;
                    let comp = this.node.getComponent(findLabelLike.compName);
                    this.langParent = dataParent;
                    ffb.langManager.bindLanguage(comp, this.langParent, '', this.varGroup);
                    if (findLabelLike.wait) {
                        counter.addCount();
                        findLabelLike.wait(comp, comp.string).then(() => {
                            counter.complelteOnce();
                        });
                    }
                }
            }

            if (!find) {
                for (let i = 0; i < keys.length; ++i) {
                    let KeywordAttr = ffb.dataManager.getKeywordAttribute(keys[i]);
                    if (KeywordAttr) {
                        find = true;
                        let key = KeywordAttr.key;
                        if (key) {
                            let compName = KeywordAttr.compName;
                            let comp = this.node.getComponent(compName);
                            if (comp) {
                                let props: DefineProperties = {};
                                props[this.node.name] = createDefineSetget({ data: { object: comp, key: key } });
                                dataDefines.push({ data: dataParent, compName: compName, props: props });
                            } else {
                                cc.warn(`${this.node.name} 节点缺少 ${compName} 组件`);
                            }
                        } else if (KeywordAttr.set) {
                            let compName = KeywordAttr.compName;
                            let comp = this.node.getComponent(compName);
                            if (comp) {
                                let props: DefineProperties = {};
                                props[this.node.name] = createDefineSetget({
                                    set: (v) => {
                                        counter.addCount();
                                        KeywordAttr.set(comp, v).then(() => {
                                            counter.complelteOnce();
                                        });
                                    }
                                });
                                dataDefines.push({ data: dataParent, compName: compName, props: props });
                            } else {
                                cc.warn(`${this.node.name} 节点缺少 ${compName} 组件`);
                            }
                        } else if (KeywordAttr.nodeSet) {
                            let props: DefineProperties = {};
                            props[this.node.name] = createDefineSetget({
                                set: (v) => {
                                    let promise = KeywordAttr.nodeSet(this.node, v);
                                    if (promise instanceof Promise) {
                                        counter.addCount();
                                        promise.then(() => {
                                            counter.complelteOnce();
                                        });
                                    }
                                }
                            });
                            dataDefines.push({ data: dataParent, compName: 'cc.Node', props: props });
                        }
                        break;
                    }
                }
            }

            if (!find && dataType === 'object') {
                for (const key in data) {
                    if (key === 'node' || key === 'components') {
                        continue;
                    }
                    let classObj = this.getComponentByString(key);
                    if (typeof classObj === 'string') {
                        classObj = cc.js.getClassByName(key);
                    }
                    if (CC_DEBUG && !cc.js.isChildClassOf(classObj, cc.Component)) {
                        console.error(key + '不是 cc.Component 类型');
                        continue;
                    }
                    if (!classObj) {
                        continue;
                    }
                    let comp = this.getComponent(classObj);
                    if (!comp) {
                        console.error(`节点${this.node.name}中找不到 ${key} 组件`);
                        continue;
                    }
                    let compData = data[key];
                    if (typeof compData === 'object') {
                        let props: DefineProperties = {};
                        for (const name in compData) {
                            if (name in comp) {
                                let registAttribute = ffb.dataManager.getAttribute(key, name);
                                if (registAttribute) {
                                    props[name] = createDefineSetget({
                                        set: (v: string) => {
                                            counter.addCount();
                                            registAttribute.set(comp, v).then(() => {
                                                counter.complelteOnce();
                                                this.valueChangeComponent && this.valueChangeComponent(name, v);
                                            });
                                        }, data: {
                                            object: comp,
                                            key: name,
                                        }
                                    });
                                } else {
                                    if (name === 'string' && labelLikes.find((info) => cc.js.getClassName(info.compName) === classObj)) {
                                        this.langParent = compData;
                                        ffb.langManager.bindLanguage(comp as ffb.LabelLike, this.langParent, name, this.varGroup);
                                    } else {
                                        props[name] = createDefineSetget({ data: { object: comp, key: name } });
                                    }
                                }
                            }
                        }
                        if (Object.keys(props).length > 0) {
                            dataDefines.push({ data: compData, props: props, compName: key });
                        }
                    }
                }
            }
            for (let i = 0; i < dataDefines.length; ++i) {
                let prop = dataDefines[i];
                let values = {};
                for (const key in prop.data) {
                    if (key in prop.props) {
                        values[key] = prop.data[key];
                    }
                }
                mutilpleDefineProperties.addValueProps(prop.data, prop.props, this.node.name, prop.compName, this.node.uuid);
                // console.log('dataDefines', this.node.name);
                for (const key in values) {
                    prop.data[key] = values[key];
                }
            }
            this.dataDefines = dataDefines;
            counter.complelteOnce();
        });
    }
}

async function setSpriteFrame(comp: cc.Sprite, sf: string) {
    let spriteFrame: cc.SpriteFrame = null;
    if (ffb.resManager.isNetResources(sf)) {
        let texture: cc.Texture2D = await ffb.resManager.loadNetResource(sf);
        spriteFrame = new cc.SpriteFrame(texture);
    } else {
        let idx = sf.indexOf('/');
        if (idx >= 0) {
            let textureName = sf.substring(0, idx);
            let spriteFrameName = sf.substring(idx + 1);
            let atlas = await ffb.resManager.loadRes(textureName, cc.SpriteAtlas);
            spriteFrame = atlas.getSpriteFrame(spriteFrameName);
        } else {
            spriteFrame = await ffb.resManager.loadRes(sf, cc.SpriteFrame);
        }
    }
    if (!cc.isValid(comp)) {
        return;
    }
    comp.spriteFrame = spriteFrame;
}

async function setSkeletonData(comp: sp.Skeleton, sd: string) {
    let skeletonData = await ffb.resManager.loadRes<sp.SkeletonData>(sd);
    if (!cc.isValid(comp)) {
        return;
    }
    comp.skeletonData = skeletonData;
}

if (!CC_EDITOR) {
    cc.game.on(cc.game.EVENT_GAME_INITED, () => {
        ffb.dataManager.registAttribute('cc.Sprite', 'spriteFrame', setSpriteFrame);
        ffb.dataManager.registAttribute('sp.Skeleton', 'skeletonData', setSkeletonData);

        ffb.dataManager.registKeywordPromise('sprite', 'cc.Sprite', setSpriteFrame);
        ffb.dataManager.registKeywordPromise('skeleton', 'sp.Skeleton', setSkeletonData);

        ffb.dataManager.registKeyword('progressBar', 'cc.ProgressBar', 'progress');
        ffb.dataManager.registKeyword('button', 'cc.Button', 'interactable');
        ffb.dataManager.registKeyword('toggle', 'cc.Toggle', 'isChecked');
        ffb.dataManager.registKeyword('slider', 'cc.Slider', 'progress');
        ffb.dataManager.registKeyword('editbox', 'cc.EditBox', 'string');

        ffb.dataManager.registLabelLike('label', 'cc.Label');
        ffb.dataManager.registLabelLike('richtext', 'cc.RichText');
    });
}

export { setSpriteFrame }