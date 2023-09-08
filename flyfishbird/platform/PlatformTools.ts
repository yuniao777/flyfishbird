import BrowserPlatform from "./BrowserPlatform";
import WXPlatform from "./LittleGame/WXPlatform";

export enum PlatformType {
    WX,
    TT,
    QQ,
    Native,
    Browser,
    Others,
}

export enum OSSystem {
    iOS,
    Android,
    Windows,
    Others
}

export default class PlatformTools {

    static PlatformType = PlatformType;
    static OSSystem = OSSystem;

    static createPlatform() {
        let platform = null;
        let platformType = PlatformTools.getCurrentPlatform();
        switch (platformType) {
            case PlatformType.WX:
                platform = new WXPlatform();
                break;
            case PlatformType.TT:
                break;
            case PlatformType.QQ:
                break;
            case PlatformType.Native:
                break;
            case PlatformType.Browser:
                platform = new BrowserPlatform();
                break;
            case PlatformType.Others:
                break;
        }
        return platform;
    }

    static getCurrentPlatform() {
        if (window.pf.tt) {
            return PlatformType.TT;
        } else if (window.pf.qq) {
            return PlatformType.QQ;
        } else if (window.pf.wx) {
            return PlatformType.WX;
        } else if (cc.sys.isNative) {
            return PlatformType.Native;
        } else if (cc.sys.isBrowser) {
            return PlatformType.Browser;
        }
        return PlatformType.Others;
    }

    static getOSSystem() {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            return OSSystem.Android
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            return OSSystem.iOS;
        } else if (cc.sys.os === cc.sys.OS_WINDOWS) {
            return OSSystem.Windows;
        }
        return OSSystem.Others;
    }

    static isLittleGame(): boolean {
        return !!(pf.wx || pf.qq || pf.tt);
    }
}
