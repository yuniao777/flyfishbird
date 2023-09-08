
namespace ffb {

    interface GameManager {

        /**
         * 添加某个函数到cocos的update阶段执行
         * @param fun 要执行的函数，当前帧的所有update执行完了才会执行
         * @param frame 延迟执行的帧数。0为当前帧，1为下一帧，以此类推
         */
        addToAfterUpdate(fun: Function, frame: number = 0);

        /**
         * 预加载bundle文件夹下的预制，节点在加载完后可能会被销毁，返回一个Promise对象
         * @param name 预制名
         */
        preLoadPrefab(name: string): Promise<unknown>;

        /**
         * 加载rootLayer（主界面）。注意主界面只能通过此方法替换，无法通过popLayer删除
         * @param nameOrNode rootLayer的预制名或者节点对象
         * @param data rootLayer需要绑定的数据对象
         * @param clearAllPopLayer 是否销其他layer，默认销毁
         */
        setRootLayer(nameOrNode: string | cc.Node, data: object, varGroup?: string, clearAllPopLayer?: boolean): Promise<cc.Node>;

        /**
         * 插入一个layer到layer栈（弹窗）中
         * @param name layer名
         * @param data layer要绑定的数据
         * @param index layer插入到哪一层弹窗，默认为顶部位置
         */
        insertLayer(name: string, data: object, varGroup?: string, index?: number): Promise<cc.Node>;

        /**
         * 从layer栈（弹窗）删除一个layer。注意：rootLayer无法通过此方法删除，只能通过setRootLayer替换
         * @param nameOrIndex 弹窗的名称或者所在位置的索引，默认为顶部layer
         */
        popLayer(nameOrIndex?: string | number);

        /**
         * 移除所有layer栈里面的内容
         */
        clearAllPopLayer();

        /**
         * 获取所有layer栈（弹窗）的名称
         */
        getLayerNames(): string[];


        addChild(parent: cc.Node, nameOrNode: cc.Node | string, data: object, varGroup?: string): Promise<cc.Node>;

        /**
         * 销毁节点（包括子节点），有数据绑定的节点必须要通过此方法销毁（通过popLayer移除的不需要再调用此方法）。
         * @param node 要销毁的节点
         */
        destroyNode(node: cc.Node);
    }

    type AttrSetFun = (comp: cc.Component, value) => Promise<unknown>;
    type NodeSetFun = (node: cc.Node, value) => void | Promise<unknown>;

    interface KeywordAttr {
        compName?: string;
        key?: string;
        set?: ffb.AttrSetFun;
        nodeSet?: ffb.NodeSetFun;
    }

    interface EventInfo {
        callback: Function;
        target?: any;
        useCapture?: boolean;
    }

    interface DataManager {
        /**
         * 注册组件的属性修改时执行的方法。仅在有同步操作，需要等待操作完成（比如加载资源）的时候才需要注册。如果是异步，无需注册。
         * @param compName 组件名
         * @param attrName 属性名
         * @param set 方法
         */
        registeAttribute(compName: string, attrName: string, set: AttrSetFun);
        getAttribute(compName: string, attrName: string): { set: AttrSetFun };

        /**
         * 注册节点名关键字
         * @param keyword 节点名关键字
         * @param compName 节点名关键字涉及的组件
         * @param attributeName 节点名关键字涉及组件上的属性名
         */
        registeKeyword(keyword: string, compName: string, attributeName: string);
        registeKeywordPromise(keyword: string, compName: string, set: ffb.AttrSetFun);
        registeKeywordNode(keyword: string, set: NodeSetFun);
        getKeywordAttribute(key: string): KeywordAttr;

        /**
         * 
         */
        registeEvent(nodeName: string, eventType: string, callback: Function, target?: any, useCapture?: boolean)
        getEvents(nodeName: string): { [key: string]: EventInfo };

        /**
         * 
         * @param node 
         * @param data 
         * @param priority 
         * @param async 
         */
        dealData(node: cc.Node, data: Object, priority: number, async: boolean, varGroup?: string): Promise<unknown>;
        changePriority(node: cc.Node, priority: number);
        resetDataListen(node: cc.Node);
    }

    //clips（动画文件）、res（资源文件）、audio（音频文件）、prefab（预制文件）
    type ResFoldNames = 'clips' | 'res' | 'audio' | 'prefab'

    interface ResManager {

        /**
         * 根据名称加载并解析bundle
         * @param name bundle名
         */
        addBundleByName(name: string): Promise<boolean>;

        /**
         * 解析bundle
         * @param bundle bundle对象
         */
        addBundle(bundle: cc.AssetManager.Bundle);

        /**
         * 获取bundle对象
         * @param name bundle名
         */
        getBundle(name: string): cc.AssetManager.Bundle;

        /**
         * 加载bundle的资源，
         * @param fold bundle第一级目录文件夹
         * @param filename 文件名
         * @param type 资源类型
         * @param isPreLoad 是否预加载（注意：当预加载时，返回的就不是cc.Asset类型了）
         */
        loadResource<T extends cc.Asset>(fold: ResFoldNames, filename: string, type?: { prototype: T }, isPreLoad?: boolean): Promise<T>;
        loadRemoteResource<T extends cc.Asset>(url: string, options?: Record<string, any>): Promise<T>;

        /**
         * 加载audio文件夹内音频文件,
         * @param audioName 音频文件名
         */
        loadAudio(audioName: string): Promise<cc.AudioClip>;

        /**
         * 加载prefab文件夹内的预制文件并实例化
         * @param prefabName 预制名
         * @param isPreLoad 是否为预加载，默认为false
         */
        loadAndInstantiatePrefab(prefabName: string, isPreLoad?: boolean): Promise<cc.Node>;

        /**
         * 加载prefab文件夹内的预制文件
         * @param prefabName 预制名
         */
        loadPrefab(prefabName: string): Promise<cc.Prefab>;

        /**
         * 加载res文件夹内的资源
         * @param filename 资源文件名
         * @param type 资源类型。可选参数
         */
        loadRes<T extends cc.Asset>(filename: string, type?: { prototype: T }): Promise<T>;

        /**
         * 获取 SpriteAtlas 下的 spriteFrame
         * @param atlas SpriteAtlas 文件名
         * @param filename spriteFrame 名
         */
        loadSpriteFrameByAtlas(atlas: string, filename: string): Promise<cc.SpriteFrame>;

        /**
         * 是否为网络资源
         * @param url  网络资源url
         */
        isNetResources(url: string): boolean;

        /**
         * 加载网络资源
         * @param url 网络资源url
         * @param options cc.assetManager.loadRemote 中的 options 参数
         */
        loadNetResource<T extends cc.Asset>(url: string, options?): Promise<T>;

        /**
         * 释放网络资源
         * @param url 网络资源url
         */
        releaseNetResource(url: string);

        /**
         * 根据文件名获取完整的路径
         * @param filename 文件名
         * @param fold bundle第一级目录文件夹
         * @param bundleName 所在的bundle
         */
        getFullPath(filename: string, fold: ResFoldNames, bundleName: string): string;

        /**
         * 根据完整的路径获取打包后的路径
         * @param fullPath 完整的路径
         * @param bundleName 所在的bundle
         * @param ext 扩展名
         */
        getPackFilePathByFullPath(fullPath: string, bundleName: string, ext: string): string;

        /**
         * 根据文件名获取打包后的路径
         * @param filename 文件名
         * @param fold bundle第一级目录文件夹
         * @param bundleName  所在的bundle
         * @param ext 扩展名
         */
        getPackFilePathByFileName(filename: string, fold: ResFoldNames, bundleName: string, ext: string): string;

        /**
         * 根据uuid获取文件路径
         * @param uuid uuid
         * @param bundleName 所在的bundle
         */
        getFileName(uuid: string, bundleName: string): string;
    }

    type LabelLike = cc.Component & { string: string };
    interface LanguageObject {
        [key: string]: string | number;
    }

    interface KeyLanguage {
        [key: string]: LanguageObject;
    }

    interface LangManager {

        //
        UPDATE_LANGUAGE: string;


        containKey(key: string): boolean;

        /**
         * 设置文本对象
         * @param language 文本对象
         */
        setLanguage(language: LanguageObject);

        setVar(varGroup: string, languageVar: ffb.LanguageObject);
        getVar(varGroup: string): LanguageObject;
        removeVar(varGroup: string);
        getVarParent(varGroup: string): LanguageObject;

        /**
         * 绑定文本对象
         * @param comp 绑定的组件
         * @param data 绑定的文本所在的object
         * @param key 绑定的是data里面的哪个key
         * @param varGroup 文本变量所在的组，如果指定了组，会优先在该组寻找，如果没有找到或者varGroup为空则在所有文本变量中寻找
         */
        bindLanguage(comp: ffb.LabelLike, data?: ffb.LanguageObject, key?: string, varGroup?: string);

        /**
         * 解绑文本对象
         * @param comp 需要解绑的组件
         */
        unBindLanguage(comp: ffb.LabelLike, data?: object, varGroup?: string);

    }

    /**
     * 调度任务管理。任务将在每帧渲染结束后根据性能执行。
     */
    interface TaskDispatcher {

        static MAX_PRIORITY: number = 10;
        static MIN_PRIORITY: number = 0;

        init();

        /**
         * 添加到调度任务队列
         * @param priority 任务的优先级，取值范围为 MAX_PRIORITY 到 MIN_PRIORITY。值越大，越先被执行
         * @param tag 任务队列的tag
         * @param func 调度任务执行的函数
         * @param thisObj func中的this对象
         * @param argArray func的参数
         * @returns 返回一个Promise对象，处理func返回的数据
         */
        addTaskToPriorityQueens<T>(priority: number, tag: string, func: (...argArray: any[]) => T, thisObj?: any, ...argArray: any[]): Promise<T>

        /**
         * 根据priority、tag清空度任务队列
         * @param priority 调度任务执行的函数
         * @param tag func中的this对象
         * @param argArray func中的参数数组
         */
        clearTaskQueens<T>(tag: string);

        changeQueenPriority(tag: string, newPriority: number, index?: number);
    }

    interface ScrollViewExtBase {
        paddingBottom: number;
        paddingTop: number;
        spacingY: number;
        paddingLeft: number;
        paddingRight: number;
        spacingX: number;

        /**
         * 0纵向排列。
         * 1横向排列。
         * 2网格排列。 
         * 默认为0
         */
        type: number;
    }

    interface TableView extends ScrollViewExtBase {
        prefabs: cc.Prefab[];
        spliceItems<T>(start: number, count: number, items?: T[]);
        pushItems<T>(items: T[]);
        fiterItems<T>(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any);
        //items的height发生变化后调用
        changeNeedUpdate();
        //items的顺序发生了变化后调用
        itemChangedNeedUpdate();
        //立马刷新item的变化
        updateRightNow();
    }

    namespace Tools {
        export class Counter {
            constructor(complete: () => any);
            addCount();
            complelteOnce();
        }
        function getLabelHeight(func: (getHeight: (str: string, size: cc.Size, attribute: Record<string, any>) => number) => void);
        function getRichTextHeight(func: (getHeight: (str: string, size: cc.Size, attribute: Record<string, any>) => number) => void);
    }

    export let gameManager: GameManager;
    export let dataManager: DataManager;
    export let resManager: ResManager;
    export let langManager: LangManager;
    export let taskDispatcher: TaskDispatcher;

    type OneParamFun = (value) => void;
}


