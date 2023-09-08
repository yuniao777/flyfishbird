import LittleGame from "./LittleGame";

export default class WXPlatform extends LittleGame {
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
}
