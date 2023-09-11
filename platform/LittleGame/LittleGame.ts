import Platform from "../Platform";

let platform = pf.tt ? pf.tt : pf.qq ? pf.qq : pf.wx;

export default class LittleGame extends Platform {

    authSetting: { [key: string]: boolean } = {};

    init() {
        platform.getSetting({
            success: (data) => {
                this.authSetting = data.authSetting;
            }
        });
    }

    login(param?: pf.LoginParam) {
        platform.login(param);
    }

    loadSubpackage(param: pf.LoadSubpackageParam): pf.LoadSubpackageTask {
        let p: pf.LoadSubpackageParam = { name: '' };
        for (const key in param) {
            p[key] = param[key];
        }
        let success = p.success;
        p.success = function () {
            cc.assetManager.loadBundle(p.name, () => {
                success && success();
            });
        }
        return platform.loadSubpackage(param);
    }

    applyAuthorize(scope: pf.WXAuthType & pf.TTAuthType, success: () => void, fail: () => void) {
        platform.authorize({
            scope,
            success,
            fail,
        });
    }

    applyAuthorizeSync(scope: pf.WXAuthType & pf.TTAuthType) {
        return !!this.authSetting[scope];
    }

    /**
     * 将游戏中的rect转化成屏幕的rect。
     * @param {*} rect  游戏中的rect。
     */
    protected convertToScreenRect(node: cc.Node) {
        let pos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let frameSize = cc.view.getFrameSize();
        let ratio = cc.view.getDevicePixelRatio();
        let scale = cc.view.getScaleX() / ratio;
        let width = node.width * scale;
        let height = node.height * scale;
        let left = pos.x * scale - width * node.anchorX;
        let top = frameSize.height - pos.y * scale - (1 - node.anchorY) * height;
        return { left: left, top: top, width: width, height: height }
    }

    getSafeArea(): { left: number; right: number; top: number; bottom: number; width: number; height: number; } {
        let frameSize = cc.view.getFrameSize();
        let area = platform.getSystemInfoSync().safeArea;
        let ratio = cc.view.getDevicePixelRatio();
        let scale = cc.view.getScaleX() / ratio;
        for (const key in area) {
            area[key] /= scale;
        }
        area.bottom = frameSize.height - area.bottom;
        area.top = area.top - frameSize.height;
        return area;
    }
}
