import Platform from "../Platform";

let platform = pf.tt ? pf.tt : pf.qq ? pf.qq : pf.wx;

export default class LittleGame extends Platform {

    authSetting: { [key: string]: boolean } = {};
    rewardedVideoAds = {};
    rewardedVideoAdInfo: { success: Function, fail: Function, loading: boolean } = { success: null, fail: null, loading: false };

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
            ffb.resManager.addBundleByName(p.name).then(()=>{
                success && success();
            });
        }
        return platform.loadSubpackage(p);
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


    //错误码：  -1广告加载错误   -2广告未看完   -3没有合适的视频填充
    showRewardVideoAd(adUnitId: any, success: any, fail: any): void {

        if (this.rewardedVideoAdInfo.loading) {
            return;
        }

        let rewardedVideoAd = this.rewardedVideoAds[adUnitId];
        if (!rewardedVideoAd) {
            rewardedVideoAd = platform.createRewardedVideoAd({ adUnitId: adUnitId });
            rewardedVideoAd.onError(this._OnRewardVideoError.bind(this));
            rewardedVideoAd.onClose(this._OnRewardVideoClose.bind(this));
            this.rewardedVideoAds[adUnitId] = rewardedVideoAd;
        }

        this.rewardedVideoAdInfo.success = success;
        this.rewardedVideoAdInfo.fail = fail;
        this.rewardedVideoAdInfo.loading = true;

        rewardedVideoAd.load().then(() => {
            //console.log(adUnitId, "ShowRewardVideoAd loaded");
            return rewardedVideoAd.show();
        }).catch((err) => {
            this.rewardedVideoAdInfo.loading = false;
            //console.log(adUnitId, "ShowRewardVideoAd err", err);
        });
    }

    private _OnRewardVideoError(err) {
        this.rewardedVideoAdInfo.loading = false;
        if (err.errCode == 1004) {
            this.rewardedVideoAdInfo.fail && this.rewardedVideoAdInfo.fail(-3, err.errMsg);
        } else {
            this.rewardedVideoAdInfo.fail && this.rewardedVideoAdInfo.fail(-1, err.errMsg);
        }
        this.rewardedVideoAdInfo.success = null;
        this.rewardedVideoAdInfo.fail = null;
    }

    private _OnRewardVideoClose(res) {
        this.rewardedVideoAdInfo.loading = false;
        if (res.isEnded) {
            this.rewardedVideoAdInfo.success && this.rewardedVideoAdInfo.success();
        } else {
            this.rewardedVideoAdInfo.fail && this.rewardedVideoAdInfo.fail(-2);
        }
        this.rewardedVideoAdInfo.success = null;
        this.rewardedVideoAdInfo.fail = null;
    }
}
