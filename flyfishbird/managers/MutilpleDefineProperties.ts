
interface DefineProperties {
    [key: string]: { set: Function, get: Function }
}

interface DefinePropertiesWithValue {
    defines: DefineProperties;
    value: object;
}

interface DefinePropertiesMap {
    [key: string]: DefinePropertiesWithValue[];
}

export { DefineProperties }

/**
 * 用于处理一个属性同时作用在多个节点上
 */
export default class MutilpleDefineProperties {

    defines: DefinePropertiesMap = {};

    genKey(nodeName: string, key1: string, key2: string) {
        return `ListenKey_${nodeName}%%${key1}!!${key2}##`
    }

    addValueProps(value: Object, props: DefineProperties, nodeName: string, compName: string, uuid: string) {
        let listenMgrProps = {};
        for (const propName in props) {
            let key = this.genKey(nodeName, compName, propName);        //节点名、组件名、属性名称也相同时
            let definesWithValue = this.defines[key];
            let defines = null;
            if (!definesWithValue) {
                defines = {};
                this.defines[key] = definesWithValue = [{ defines: defines, value: value }];
            } else {
                defines = this.getDefinesFromDefinesWithValue(definesWithValue, value).defines;
                if (!defines) {
                    defines = {};
                    definesWithValue.push({ defines: defines, value: value });
                }
            }
            const prop = props[propName];
            if (Object.keys(defines).length === 0) {
                listenMgrProps[propName] = {
                    get: function () {
                        let define = defines[Object.keys(defines)[0]];
                        if (!define) {
                            console.error(`get ${propName} fail`);
                            return;
                        }
                        return define.get();
                    },
                    set: function (v) {
                        for (const key in defines) {
                            const element = defines[key];
                            element.set(v);
                        }
                    }
                };
            } else {
                // console.log('repeat added ' + nodeName);
            }
            defines[uuid] = { set: prop.set, get: prop.get };
        }
        if (Object.keys(listenMgrProps).length > 0) {
            Object.defineProperties(value, listenMgrProps);
        }
    }

    removeValueProps(value: Object, props: string[], nodeName: string, compName: string, uuid: string) {
        let listenMgrProps = {};
        for (let i = 0; i < props.length; ++i) {
            let propName = props[i];
            let key = this.genKey(nodeName, compName, propName);
            let definesWithValue = this.defines[key];
            if (!definesWithValue) {
                continue;
            }
            let {defines, idx} = this.getDefinesFromDefinesWithValue(definesWithValue, value);
            if (!defines || !defines[uuid]) {
                continue;
            }
            if (Object.keys(defines).length === 1) {
                listenMgrProps[propName] = {
                    value: value[propName],
                    writable: true
                }
                definesWithValue.splice(idx, 1);
            }
            delete defines[uuid];
        }
        if (Object.keys(listenMgrProps).length > 0) {
            Object.defineProperties(value, listenMgrProps);
        }
    }

    private getDefinesFromDefinesWithValue(definesWithValue: DefinePropertiesWithValue[], value: object) {
        for (let i = 0; i < definesWithValue.length; ++i) {
            if (value === definesWithValue[i].value) {
                return {defines:definesWithValue[i].defines, idx:i};
            }
        }
        return {};
    }
}



