
window.pf = {
    wx: window['wx'],
    qq: window['qq'],
    tt: window['tt'],
}

export default class Platform {

    isFunctionOverride(name: string) {
        let __proto__ = this['__proto__'];
        let constructor = __proto__.constructor;
        while (constructor !== Platform) {
            if (Object.prototype.hasOwnProperty.call(__proto__, name)) {
                return true;
            }
            __proto__ = __proto__.__proto__;
            constructor = __proto__.constructor;
        }
        return false;
    }

    init() { }

    loadSubpackage(param: pf.LoadSubpackageParam): pf.LoadSubpackageTask {
        console.warn('当前平台没有实现 loadSubpackage');
        param.success && param.success();
        param.complete && param.complete();
        return null;
    }

    login(param?: pf.LoginParam) {
        console.warn('当前平台没有实现 login');
        param.success && param.success({ code: '' });
        param.complete && param.complete();
    }

    bindGetUserInfoNode(node: cc.Node, success: (data: pf.LittleGameUserInfoData) => {}, fail: () => {}) {
        console.warn('当前平台没有实现 bindGetUserInfoNode');
        // node.on('click', ()=>{
        success && success({ userInfo: { nickName: '浏览器用户', avatarUrl: 'white_2x2' } });
        // fail && fail();
        // });
    }

    applyAuthorize(scope: pf.WXAuthType & pf.TTAuthType, success: () => {}, fail: () => {}) {
        console.warn('当前平台没有实现 applyAuthorize');
        success && success();
    }

    isAuthorize(scope: pf.WXAuthType & pf.TTAuthType) {
        return true
    }

    getSafeArea() {
        console.warn('当前平台没有实现 getSafeArea');
        return { left: 0, right: cc.winSize.width, top: cc.winSize.height, bottom: 0, width: cc.winSize.width, height: cc.winSize.height };
    }

    virbrate(short: boolean = true, type: 'heavy' | 'medium' | 'light' = 'heavy'): void {
        console.warn('当前平台没有实现 virbrate');
    }

    showRewardVideoAd(adUnitId, success, fail) {
        console.warn('当前平台没有实现 showRewardVideoAd');
    }

    getLaunchOptionsSync(): pf.LaunchOptions {
        console.warn('当前平台没有实现 getLaunchOptionsSync');
        return null;
    }

    getSystemInfoSync(): pf.SystemInfoData {
        console.warn('当前平台没有实现 getSystemInfoSync');
        return null;
    }

    onShareAppMessage(func: () => pf.ShareParams): void {
        console.warn('当前平台没有实现 onShareAppMessage');
    }

    shareAppMessage(object: pf.ShareParams) {
        console.warn('当前平台没有实现 shareAppMessage');
    }


    requestSubscribeSystemMessage(object: pf.WXSubscribeSystemMessageParams) {
        console.warn('当前平台没有实现 requestSubscribeSystemMessage');
    }
}



