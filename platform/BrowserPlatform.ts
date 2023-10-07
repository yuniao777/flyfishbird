import Platform from "./Platform";

type ListenerProgress = (res: { progress: number, totalBytesWritten: number, totalBytesExpectedToWrite: number }) => void;

class Listener {
    listener: ListenerProgress = null;

    onProgressUpdate(listener: ListenerProgress) {
        this.listener = listener;
    }
}

export default class BrowserPlatform extends Platform {

    login(param?: pf.LoginParam): void {
        param.success && param.success({ code: '' });
        param.complete && param.complete();
    }

    loadSubpackage(param: pf.LoadSubpackageParam): pf.LoadSubpackageTask {
        let task = new Listener();
        cc.assetManager.loadBundle(param.name, () => {
            task.listener && task.listener({ progress: 1, totalBytesExpectedToWrite: 1, totalBytesWritten: 1 });
            param.success && param.success();
            param.complete && param.complete();
        });
        return task;
    }

    getSafeArea() {
        return { left: 0, right: cc.winSize.width, top: cc.winSize.height, bottom: 0, width: cc.winSize.width, height: cc.winSize.height };
    }

    showRewardVideoAd(adUnitId, success, fail) {
        success && success();
    }
}
