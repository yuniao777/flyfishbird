
import MutilpleDefineProperties, { DefineProperties } from "./MutilpleDefineProperties";
const KeyRegex = /\@{([^}]*)}/g;

let mutilpleDefineProperties = new MutilpleDefineProperties();

function isValidValue(v) {
    let type = typeof v;
    return type === 'number' || type === 'string'
}


let _uuid_ = 0;

function getUuid() {
    return 'LanguageSetter_' + (_uuid_++);
}

type SetterValueType = string | number | LanguageSetter;
type BindKeys = { [key: string]: SetterValueType };

class LanguageSetter {

    value: string | number;
    splitArray = [];
    lastBindKeys: BindKeys = {};
    parent: LanguageSetter = null;
    varGroup: string = '';

    uuid: string = getUuid().toString();

    components: { [key: string]: ffb.LabelLike } = {};

    //向上传递，刷新文本内容
    valueChanged(v: string, force?: boolean) {
        if (this.parent) {
            this.parent.set(this.parent.value, force);
            return;
        }
        for (const key in this.components) {
            this.components[key].string = v;
        }
    }

    set(v: string | number, force?: boolean) {
        if (!force && this.value === v) {
            return;
        }
        this.value = v;
        this.dealString();
        this.valueChanged(this.toString(), force);
    }

    get() {
        return this.value;
    }

    //向下传递，刷新文本内容
    dealString() {
        const str = this.value.toString();
        const arr = str.split(KeyRegex);
        let len = arr.length;
        let bindKeys: BindKeys = {};
        let idx = 1;
        while (idx < len) {
            let key = arr[idx];
            idx += 2;
            if (key in bindKeys) {
                continue;
            }

            let languageObject = this.getLanguageObject(key);

            if (!languageObject) {
                console.error(`未找到名为${key}的变量，请调用ffb.langManager.setVar设置`);
                continue;
            }

            let value: SetterValueType = languageObject[key];
            value = this.getNewValue(value, key);
            if (key in this.lastBindKeys) {
                delete this.lastBindKeys[key];
            } else {
                let props = {};
                props[key] = {
                    set: (v: string | number) => {
                        this.lastBindKeys[key] = this.getNewValue(v, key);
                        this.valueChanged(this.toString(), true);
                        // this.set(v, true);
                    },
                    get: () => {
                        return value instanceof LanguageSetter ? value.value : this.lastBindKeys[key];
                    }
                };
                mutilpleDefineProperties.addValueProps(languageObject, props, '', 'LanguangeManager', this.uuid);
            }

            bindKeys[key] = value;
        }

        this.removeLastBindKeys();

        this.splitArray = arr;
        this.lastBindKeys = bindKeys;
    }

    getLanguageObject(key: string) {
        let languageObject: ffb.LanguageObject = null;
        if (this.varGroup) {
            languageObject = ffb.langManager.getVar(this.varGroup);

        }

        if (!languageObject || !(key in languageObject)) {
            languageObject = ffb.langManager.getVarParent(key);
        }

        return languageObject;
    }

    getNewValue(v: string | number, key: string): SetterValueType {
        let oldValue = this.lastBindKeys[key];
        if (oldValue instanceof LanguageSetter) {
            oldValue.set(v);
            return oldValue;
        }
        if (typeof v === 'string' && v.match(KeyRegex)) {
            let setter = new LanguageSetter();
            setter.parent = this;
            setter.varGroup = this.varGroup;
            setter.set(v);
            return setter;
        }
        return v;
    }

    toString() {
        let str = '';
        for (let i = 0; i < this.splitArray.length; ++i) {
            let key = this.splitArray[i];
            if (!key) {
                continue;
            }
            str += (i % 2 === 0 ? key : this.lastBindKeys[key].toString());
        }
        return str;
    }

    removeLastBindKeys() {
        for (const bindKey in this.lastBindKeys) {
            const bindData = this.lastBindKeys[bindKey];
            let varParent = this.getLanguageObject(bindKey);
            mutilpleDefineProperties.removeValueProps(varParent, [bindKey], '', 'LanguangeManager', this.uuid);
            if (bindData instanceof LanguageSetter) {
                bindData.destroy();
            }
        }
        this.lastBindKeys = null;
    }

    destroy() {
        this.value = null;
        this.removeLastBindKeys();
        this.components = null;
        this.splitArray = null;
    }
}

interface SetterWithPropName {
    [key: string]: LanguageSetter;
}

interface SetterWithData {
    setters: SetterWithPropName;
    parentData: object;
}

// ${} 在data里面找变量      @{} 在语言文件里面找key
class LangManager {

    UPDATE_LANGUAGE = 'FFB_UPDATE_LANGUAGE';

    language: ffb.LanguageObject = {};
    languageVar: ffb.KeyLanguage = {};
    setterWithDatas: SetterWithData[] = [];

    setLanguage(language: ffb.LanguageObject) {
        for (const key in language) {
            this.language[key] = language[key];
        }
    }

    setVar(varGroup: string, languageVar: ffb.LanguageObject) {
        if (varGroup in this.languageVar) {
            cc.error('var 的 key 不能重复');
            return;
        }
        this.languageVar[varGroup] = languageVar;
    }

    getVar(varGroup: string): ffb.LanguageObject {
        return this.languageVar[varGroup];
    }

    removeVar(varGroup: string) {
        delete this.languageVar[varGroup];
    }

    getVarParent(varGroup: string) {
        if (varGroup in this.language) {
            return this.language;
        }
        for (const key2 in this.languageVar) {
            let element = this.languageVar[key2];
            if (varGroup in element) {
                return element;
            }
        }
        return null;
    }

    containKey(key: string) {
        return key in this.language;
    }

    unBindLanguage(comp: ffb.LabelLike, data?: object, key?: string, varGroup?: string) {
        data = data ?? this.language;
        varGroup = varGroup || '';
        key = key || comp.node.name;

        // let nodeName = comp.node.name;
        // let setterKey = this.genSetterKey(nodeName);
        // let setterDatas = this.setters[setterKey];
        // if (!setterDatas) {
        //     return;
        // }
        // let { setterData, idx } = this.getSetterData(setterDatas, data);
        // if (!setterData) {
        //     console.error('无法根据data找到对应的数据');
        //     return;
        // }
        // let setterUuids = setterData.setterUuids;
        // let { setter, i } = this.getSetterByVarGrounp(setterData.setterUuids, varGroup);
        // if (!setter) {
        //     console.error('无法根据varGroup找到对应的数据');
        //     return;
        // }
        let idx = this.setterWithDatas.findIndex((value) => value.parentData === data);
        if (idx < 0) {
            console.error('unBindLanguage setterWithData error');
            return;
        }
        let setterWithData = this.setterWithDatas[idx];
        let setter = setterWithData.setters[key];
        if (!setter) {
            console.error('unBindLanguage setter error');
            return;
        }
        delete setter.components[comp.uuid];
        if (Object.keys(setter.components).length === 0) {
            mutilpleDefineProperties.removeValueProps(data, [key], '', 'cc.LabelLike', setter.uuid);
            setter.destroy();
            delete setterWithData.setters[key];
            if (Object.keys(setterWithData.setters).length === 0) {
                this.setterWithDatas.splice(idx, 0);
            }
        }
    }

    bindLanguage(comp: ffb.LabelLike, data: ffb.LanguageObject, key?: string, varGroup?: string) {
        let nodeName = comp.node.name;

        data = data ?? this.language;
        key = key || nodeName;
        varGroup = varGroup || '';
        let setterWithData = this.setterWithDatas.find((value) => value.parentData === data);
        if (!setterWithData) {
            setterWithData = {
                parentData: data,
                setters: {},
            }
            this.setterWithDatas.push(setterWithData);
        }
        if (!setterWithData.setters[key]) {
            let value = data[key];
            if (!isValidValue(value)) {
                console.error(`没找到与节点${nodeName}对应的数据`);
                return;
            }
            let setter = new LanguageSetter();
            setter.components[comp.uuid] = comp;
            setter.varGroup = varGroup;
            setter.set(value);
            let props = {};
            props[key] = {
                set: setter.set.bind(setter),
                get: setter.get.bind(setter),
            };
            mutilpleDefineProperties.addValueProps(data, props, '', 'cc.LabelLike', setter.uuid);
            setterWithData.setters[key] = setter;
        } else {
            let setter = setterWithData.setters[key];
            setter.components[comp.uuid] = comp;
            comp.string = setter.toString();
        }
    }

}

export default LangManager;
