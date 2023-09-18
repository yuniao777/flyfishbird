
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

    applyAuthorizeSync(scope: pf.WXAuthType & pf.TTAuthType) {
        return true
    }

    getSafeArea() {
        console.warn('当前平台没有实现 getSafeArea');
        return { left: 0, right: cc.winSize.width, top: cc.winSize.height, bottom: 0, width: cc.winSize.width, height: cc.winSize.height };
    }
}



