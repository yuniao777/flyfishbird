import LittleGame from "./LittleGame";

export default class WXPlatform extends LittleGame {

    init(): void {
        super.init();
        pf.wx.showShareMenu({ withShareTicket: true, menus: ["shareAppMessage", "shareTimeline"] });
        this._checkUpdate();
    }

    bindGetUserInfoNode(node: cc.Node, success: (data: pf.LittleGameUserInfoData) => void, fail: (errCode: number) => void) {
        let platform = pf.wx;
        if (this.authSetting['scope.userInfo']) {
            platform.getUserInfo({
                withCredentials: true,
                success: success,
                fail: () => fail && fail(1001),
            });
        } else {
            let btn = platform.createUserInfoButton({
                withCredentials: true,
                type: 'image',
                style: this.convertToScreenRect(node),
            });
            btn.onTap((res) => {
                if (res.encryptedData) {
                    success && success(res);
                } else {
                    console.error('获取用户信息失败', res);
                    fail && fail(1002)
                }
                btn.destroy();
            });
            node.parent.on(cc.Node.EventType.CHILD_REMOVED, (child: cc.Node) => {
                if (child === node) {
                    btn.destroy();
                }
            });
        }

    }

    virbrate(short: boolean = true, type: 'heavy' | 'medium' | 'light' = 'light'): void {
        if (short) {
            pf.wx.vibrateShort({ type: type });
        } else {
            pf.wx.vibrateLong();
        }
    }

    _checkUpdate() {
        const updateManager = pf.wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            // console.log(res.hasUpdate)
        })

        updateManager.onUpdateReady(function () {
            pf.wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启小游戏？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
        })
    }

    requestSubscribeSystemMessage(object: pf.WXSubscribeSystemMessageParams): void {
        pf.wx.requestSubscribeSystemMessage(object);
    }
}
