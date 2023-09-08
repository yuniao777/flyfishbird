import LittleGame from "./LittleGame";

class TTPlatform extends LittleGame {

    bindGetUserInfoNode(node: cc.Node, success: (data: pf.LittleGameUserInfoData) => void, fail: (errCode: number) => void) {
        if (this.authSetting['scope.userInfo']) {
            pf.tt.getUserInfo({
                withCredentials: true,
                success: success,
                fail: () => fail && fail(1001),
            });
        } else {
            node.on('click', () => {
                this.applyAuthorize('scope.userInfo', () => {
                    pf.tt.getUserInfo({
                        withCredentials: true,
                        success: success,
                        fail: () => fail && fail(1001),
                    })
                }, () => fail && fail(1002));
            });
        }

    }
}

export default TTPlatform;