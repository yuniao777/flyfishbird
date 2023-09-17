
interface ResourcePath {
    [key: string]: string;
}

interface ResourceFold {
    [key: string]: ResourcePath;
}

interface AllResource {
    [key: string]: ResourceFold;
}

class ResManager {

    bundles: { [key: string]: cc.AssetManager.Bundle } = {};
    allResources: AllResource = {};
    netAssets: { [key: string]: cc.Asset } = {};

    addBundleByName(name: string): Promise<boolean> {
        return new Promise((resolve) => {
            cc.assetManager.loadBundle(name, (err, bundle) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }
                this.addBundle(bundle);
                resolve(true);
            });
        });
    }

    addBundle(bundle: cc.AssetManager.Bundle) {
        let bundleName = bundle.name;
        this.bundles[bundleName] = bundle;
        let resourceFold = this.allResources[bundleName] = {};
        let paths = bundle['_config']['paths']['_map'];
        for (const path in paths) {
            let fold = path.substring(0, path.indexOf('/'));
            if (fold === 'scripts') {
                continue;
            }
            let resourcePath = resourceFold[fold];
            if (!resourcePath) {
                resourcePath = resourceFold[fold] = {};
            }
            let filename = path.substring(path.lastIndexOf('/') + 1);
            resourcePath[filename] = path;
        }
    }

    loadResource<T extends cc.Asset>(fold: string, filename: string, type?: { prototype: T }, isPreLoad?: boolean): Promise<T> {
        if (!fold || !filename) {
            return Promise.resolve(null);
        }
        let bundleName = '';
        let path = '';
        for (const name in this.allResources) {
            const element = this.allResources[name][fold];
            if (element && filename in element) {
                bundleName = name;
                path = element[filename];
            }
        }
        let bundle = this.bundles[bundleName];
        if (!bundle) {
            console.error(fold + '文件夹内不存在' + filename);
            return Promise.resolve(null);
        }
        let asset = bundle.get<T>(path, type);
        if (asset) {
            return Promise.resolve(asset);
        }
        return new Promise((resolve) => {
            let funcName = isPreLoad ? 'preload' : 'load';
            if (type) {
                bundle[funcName]<T>(path, type, (err, asset) => {
                    err && console.error(`bundle ${bundleName}的 ${filename} 加载出错:`, err);
                    resolve(asset);
                });
            } else {
                bundle[funcName]<T>(path, (err, asset) => {
                    err && console.error(`bundle ${bundleName}的 ${filename} 加载出错:`, err);
                    resolve(asset);
                });
            }
        });
    }

    // loadRemoteResource<T extends cc.Asset>(url: string, options?: Record<string, any>): Promise<T> {
    //     if (!url) {
    //         return Promise.resolve(null);
    //     }

    //     return new Promise((resolve, reject) => {
    //         let onComplete = function (err: Error, asset) {
    //             if (err) {
    //                 console.error(err);
    //             }
    //             resolve(asset);
    //         }
    //         if (options) {
    //             cc.assetManager.loadRemote(url, options, onComplete);
    //         } else {
    //             cc.assetManager.loadRemote(url, onComplete);
    //         }
    //     });
    // }

    loadAudio(audioName: string) {
        return this.loadResource<cc.AudioClip>('audio', audioName);
    }

    async loadAndInstantiatePrefab(prefabName: string, isPreLoad?: boolean) {
        let prefab: cc.Prefab = await this.loadResource('prefab', prefabName, cc.Prefab, isPreLoad);
        if (isPreLoad && !(prefab instanceof cc.Prefab)) {
            //预加载返回的是RequestItem[]，并不会返回cc.Prefab，因此需要重新加载一遍
            prefab = await this.loadResource('prefab', prefabName, cc.Prefab);
        }
        return prefab ? cc.instantiate(prefab) : null;
    }

    loadPrefab(prefabName: string): Promise<cc.Prefab> {
        return this.loadResource('prefab', prefabName);
    }

    loadRes<T extends cc.Asset>(filename: string, type?: { prototype: T }) {
        return this.loadResource<T>('res', filename, type);
    }

    async loadSpriteFrameByAtlas(atlas: string, filename: string) {
        let spriteAtlas = await this.loadResource('res', atlas, cc.SpriteAtlas);
        if (!spriteAtlas) {
            return null;
        }
        return spriteAtlas.getSpriteFrame(filename);
    }

    isNetResources(name: string) {
        return name && (name.startsWith("http://") || name.startsWith("https://"));
    }

    loadNetResource<T extends cc.Asset>(url: string, options?): Promise<T> {
        if (this.netAssets[url]) {
            return Promise.resolve(this.netAssets[url] as T);
        }
        return new Promise<T>((resolve, reject) => {
            let callback = (err: Error, asset: T) => {
                err && console.error(`load ${url} error:`, err);
                this.netAssets[url] = asset;
                resolve(asset);
            }
            if (options) {
                cc.assetManager.loadRemote<T>(url, options, callback);
            } else {
                cc.assetManager.loadRemote<T>(url, callback);
            }
        });
    }

    releaseNetResource(name: string) {
        let asset = this.netAssets[name];
        if (asset) {
            cc.assetManager.releaseAsset(asset);
            delete this.netAssets[name];
        }
    }

    getFullPath(filename: string, fold: string, bundleName: string) {
        let folds = this.allResources[bundleName];
        if (folds) {
            let paths = folds[fold];
            if (paths) {
                let path = paths[filename];
                if (path) {
                    return path;
                }
                console.error(`没有在${bundleName}的${fold}文件夹中找到名叫${filename}的文件`);
                return;
            } else {
                console.error(`没有在${bundleName}中找到名叫${fold}的文件夹`);
            }
        } else {
            console.error(`没有找到名叫${bundleName}的bundle`);
        }
        return '';
    }

    getPackFilePathByFullPath(fullPath: string, bundleName: string, ext: string) {
        let bundle = this.bundles[bundleName];
        let uuid = bundle.getInfoWithPath(fullPath).uuid;
        return cc.assetManager.utils.getUrlWithUuid(uuid, { isNative: true, nativeExt: ext });
    }

    getPackFilePathByFileName(filename: string, fold: string, bundleName: string, ext: string) {
        let fullname = this.getFullPath(filename, fold, bundleName);
        return this.getPackFilePathByFullPath(fullname, bundleName, ext);
    }

    getFileName(uuid: string, bundleName: string) {
        let bundle = this.bundles[bundleName];
        let info = bundle.getAssetInfo(uuid);
        return info.path;
    }

    getBundle(name: string) {
        return this.bundles[name];
    }
}

export default ResManager;
