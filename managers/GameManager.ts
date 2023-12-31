
interface UpdateFun {
    fun: Function,
    frame: number,
}

interface LayerLoading {
    [key: string]: {
        endCallbacks: Function[],
        isPreload: boolean,
        node: cc.Node
    }
}

const ROOT_LAYER_ZINDE = 100;
const DEFAULT_PRIORITY = 5;

class GameManager {

    staticBackground = true;
    staticSprite: cc.Sprite = null;

    private updateFuns: UpdateFun[] = [];
    private layers: cc.Node[] = [];

    private layerLoading: LayerLoading = {};
    private loadingScene = '';

    private publicCamera: cc.Camera = null;

    init() {
        this.initUpdate();
        this.listenSceneChange();
    }

    private listenSceneChange() {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, () => {

        });
    }

    private initUpdate() {
        cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this.afterUpdate, this);
    }

    private afterUpdate() {
        for (let i = 0; i < this.updateFuns.length;) {
            let fun = this.updateFuns[i];
            if (fun.frame <= 0) {
                fun.fun();
                this.updateFuns.splice(i, 1);
            } else {
                fun.frame--;
                i++;
            }
        }
    }

    private waitingPrefabLoadEnd(nameOrNode: string | cc.Node, isPreload: boolean, data: Object, varGroup: string): Promise<cc.Node> {
        return new Promise(async (resolve) => {
            let name = '';
            let node = null;
            let loading = null;
            if (typeof nameOrNode === 'string') {
                name = nameOrNode
                loading = this.layerLoading[name];
                if (!loading) {
                    loading = this.layerLoading[name] = { endCallbacks: [resolve], isPreload: isPreload, node: null };
                } else {
                    loading.endCallbacks.push(resolve);
                    if (!isPreload && loading.isPreload) {
                        loading.isPreload = isPreload;
                        if (loading.node) {
                            let priority = isPreload ? DEFAULT_PRIORITY - 1 : DEFAULT_PRIORITY;
                            ffb.dataManager.changePriority(loading.node, priority);
                            let extBases = loading.node.getComponentsInChildren('ExtBase');
                            for (let i = 0; i < extBases.length; ++i) {
                                extBases[i].dispatchPriority = priority;
                            }
                        } else {
                            ffb.resManager.loadAndInstantiatePrefab(name);
                        }
                    }
                    return;
                }
                node = await ffb.resManager.loadAndInstantiatePrefab(name, loading.isPreload);
            } else {
                name = nameOrNode.name;
                node = nameOrNode;
                loading = this.layerLoading[name] = { endCallbacks: [resolve], isPreload: isPreload, node: null };
            }
            if (node) {
                loading.node = node;
                node.parent = cc.find('Canvas');
                node.active = false;
                if (loading.isPreload) {
                    await ffb.dataManager.dealData(node, data, DEFAULT_PRIORITY - 1, true, varGroup);
                    if (loading.isPreload) {
                        this.destroyNode(node);
                        node = null;
                    } else {
                        node.active = true;
                    }
                } else {
                    await ffb.dataManager.dealData(node, data, DEFAULT_PRIORITY, false, varGroup);
                    node.active = true;
                }

                let callbacks = this.layerLoading[name].endCallbacks;
                if (callbacks) {
                    for (let i = 0; i < callbacks.length; ++i) {
                        let callback = callbacks[i];
                        callback && callback(node);
                    }
                }
                delete this.layerLoading[name];
            }
        });
    }

    private initLayer(layer: cc.Node) {

    }

    addToAfterUpdate(fun: Function, frame: number = 0) {
        this.updateFuns.push({ fun: fun, frame: frame });
    }

    async preLoadPrefab(name: string) {
        return this.waitingPrefabLoadEnd(name, true, {}, null);
    }

    async setRootLayer(nameOrNode: string | cc.Node, data: object, varGroup?: string, clearAllPopLayer: boolean = true) {

        let layer = await this.waitingPrefabLoadEnd(nameOrNode, false, data, varGroup);
        layer.zIndex = ROOT_LAYER_ZINDE;

        this.initLayer(layer);

        if (clearAllPopLayer) {
            let len = this.layers.length;
            for (let i = 0; i < len; ++i) {
                this.destroyNode(this.layers[i]);
            }
            this.layers.length = 0;
            this.layers.push(layer);
        } else {
            let oldRootLayer = this.layers[0];
            if (oldRootLayer) {
                this.destroyNode(oldRootLayer);
                this.layers[0] = layer;
            } else {
                this.layers.push(layer);
            }
        }

        return layer;
    }

    async insertLayer(nameOrNode: string, data: object, varGroup?: string, index?: number) {

        if (index === undefined) {
            index = this.layers.length;
        } else {
            index = Math.max(Math.min(index, this.layers.length), 1);
        }
        let layer = await this.waitingPrefabLoadEnd(nameOrNode, false, data, varGroup);
        this.initLayer(layer);
        this.layers.splice(index, 0, layer);
        for (let i = 0; i < this.layers.length; ++i) {
            this.layers[i].zIndex = ROOT_LAYER_ZINDE + i;
        }

        this.updateStaticBackground();

        return layer;
    }

    updateStaticBackground() {
        if (!this.staticBackground) {
            return
        }
        if (!cc.isValid(this.staticSprite)) {
            let node = new cc.Node('StaticBackground');
            node.scaleY = -1;
            // let widget = node.addComponent(cc.Widget);
            // widget.top = 0; widget.bottom = 0; widget.left = 0; widget.right = 0;
            cc.find('Canvas').addChild(node);
            this.staticSprite = node.addComponent(cc.Sprite);
            let tex = new cc.RenderTexture();
            tex.initWithSize(cc.winSize.width, cc.winSize.height, cc.RenderTexture.DepthStencilFormat.RB_FMT_D24S8);
            this.staticSprite.spriteFrame = new cc.SpriteFrame(tex);
        }

        let staticNode = this.staticSprite.node;
        if (this.layers.length <= 1) {
            staticNode.active = false;
            this.layers[this.layers.length - 1].opacity = 255;
            return;
        }
        staticNode.active = true;

        let tex: cc.RenderTexture = this.staticSprite.spriteFrame.getTexture() as cc.RenderTexture;
        let parent = this.layers[0].parent;
        let node = new cc.Node();
        node.parent = cc.find('Canvas');
        let camera = this.getPublicCamera();
        camera.targetTexture = tex;
        camera.node.active = true;
        camera.node.x = cc.winSize.width / 2;
        camera.node.y = cc.winSize.height / 2;
        for (let i = 0; i < this.layers.length - 1; ++i) {
            let layer = this.layers[i];
            layer.parent = node;
            layer.opacity = 255;
        }
        camera.render(node);
        for (let i = 0; i < this.layers.length - 1; ++i) {
            let layer = this.layers[i];
            layer.parent = parent;
            layer.opacity = 0;
        }
        this.layers[this.layers.length - 1].opacity = 255;
        camera.node.active = false;
        camera.targetTexture = null;
        node.destroy();
    }

    getPublicCamera(): cc.Camera {
        if (this.publicCamera) {
            return this.publicCamera;
        }
        let node = new cc.Node('PublicCameraNode');
        this.publicCamera = node.addComponent(cc.Camera);
        cc.game.addPersistRootNode(node);
        this.publicCamera.node.active = false;
        return this.publicCamera;
    }

    popLayer(nameOrIndex?: string | number) {
        if (this.layers.length <= 1) {
            console.error('popLayer 调用失败：rootlayer无法被移除');
            return;
        }
        let layer: cc.Node;
        if (typeof nameOrIndex === 'string') {
            for (let i = this.layers.length - 1; i >= 1; --i) {
                if (this.layers[i].name === nameOrIndex) {
                    layer = this.layers.splice(i, 1)[0];
                    break;
                }
            }
        } else if (typeof nameOrIndex === 'number') {
            let index = Math.max(Math.min(nameOrIndex, this.layers.length), 1);
            layer = this.layers.splice(index, 1)[0];
        } else {
            layer = this.layers.pop();
        }

        if (!layer) {
            console.error('popLayer 调用失败，未找到要移除的layer：' + nameOrIndex);
            return;
        }

        this.destroyNode(layer);
        for (let i = 0; i < this.layers.length; ++i) {
            this.layers[i].zIndex = ROOT_LAYER_ZINDE + i;
        }

        this.updateStaticBackground();
    }

    clearAllPopLayer() {
        let len = this.layers.length;
        for (let i = 1; i < len; ++i) {
            this.destroyNode(this.layers[i]);
        }
    }

    layerExit(name: string) {
        return !!this.layers.find((layer) => layer.name === name);
    }

    destroyAllLayer() {
        let len = this.layers.length;
        for (let i = 0; i < len; ++i) {
            this.destroyNode(this.layers[i]);
        }
        this.layers.length = 0;
    }

    loadScene(sceneName: string, onLaunched: (err: string, scene: cc.SceneAsset) => void): boolean {
        if (this.loadingScene) {
            cc.warn(`loadScene: Failed to load scene ${sceneName} because ${this.loadingScene} is already being loaded.`);
            return false;
        }
        var bundle = cc.assetManager.bundles.find((bundle) => {
            return !!bundle.getSceneInfo(sceneName);
        });
        if (bundle) {
            cc.director.emit(cc.Director.EVENT_BEFORE_SCENE_LOADING, sceneName);
            this.loadingScene = sceneName;
            console.time('LoadScene ' + sceneName);
            bundle.loadScene(sceneName, (err, scene) => {
                console.timeEnd('LoadScene ' + sceneName);
                this.loadingScene = '';
                if (err) {
                    onLaunched && onLaunched('Failed to load scene: ' + err, null);
                } else {
                    this.destroyAllLayer();
                    cc.director.runSceneImmediate(scene, null, onLaunched);
                }
            });
            return true;
        } else {
            cc.error(`loadScene: Can not load the scene ${sceneName} because it was not in the build settings before playing.`);
            return false;

        }
    }

    getLayerNames(): string[] {
        let names: string[] = [];
        for (let i = 0; i < this.layers.length; ++i) {
            names.push(this.layers[i].name);
        }
        return names;
    }

    async addChild(parent: cc.Node, nameOrNode: cc.Node | string, data: object, varGroup?: string) {
        let node: cc.Node = null;
        if (typeof nameOrNode === 'string') {
            node = await ffb.resManager.loadAndInstantiatePrefab(nameOrNode);
        } else {
            node = nameOrNode;
        }
        if (!cc.isValid(parent)) {
            return null;
        }
        parent.addChild(node);
        node.active = false;
        await ffb.dataManager.dealData(node, data, DEFAULT_PRIORITY, false, varGroup);
        if (!cc.isValid(node)) {
            return null;
        }
        node.active = true;
        return node;
    }

    destroyNode(node: cc.Node) {
        ffb.dataManager.resetDataListen(node);
        node.destroy();
    }

    destroyAllChildren(node: cc.Node) {
        let children = [];
        for (let i = 0; i < node.children.length; ++i) {
            children.push(node.children[i]);
        }
        for (let i = 0; i < children.length; ++i) {
            ffb.gameManager.destroyNode(children[i]);
        }
    }
}

export default GameManager