
namespace ffb {
    /**
     *  Platform的方法为所有平台的合集，可以用 isFunctionOverride 来查询子类是否实现了该方法
     */
    interface Platform {
        /**
         * 此函数返回此方法是否被子类实现。
         * @param name 方法名
         */
        isFunctionOverride(name: string): boolean;
        login(param?: pf.LoginParam);
        loadSubpackage(param: pf.LoadSubpackageParam): pf.LoadSubpackageTask;
        getUserInfo(param: { success: (data: pf.LittleGameUserInfo) => void, fail: () => void });
        /**
         * 获取用户信息和节点绑定
         * @param node 绑定的节点，上面要添加一个button组件
         * @param success 获取用户信息成功后的回调
         * @param fail 失败后的回调。1001：获取用户信息失败 1002：用户未授权
         */
        bindGetUserInfoNode(node: cc.Node, success: (data: pf.LittleGameUserInfoData) => void, fail: (errCode: 1001 | 1002) => void);

        applyAuthorize(scope: pf.WXAuthType & pf.TTAuthType, success: () => void, fail: () => void);
        applyAuthorizeSync(scope: pf.WXAuthType & pf.TTAuthType): boolean;

        /**
         * @returns left 安全区域左上角横坐标 right 安全区域右下角横坐标 top 安全区域左上角纵坐标 bottom 安全区域右下角纵坐标 width 安全区域的宽度，单位逻辑像素 height 安全区域的高度，单位逻辑像素
         */
        getSafeArea(): { left: number, right: number, top: number, bottom: number, width: number, height: number };
    }

    namespace PlatformTools {
        enum PlatformType {
            WX = 0,
            TT = 1,
            QQ = 2,
            Native = 3,
            Browser = 4,
            Others = 5,
        }
        enum OSSystem {
            iOS = 0,
            Android = 1,
            Windows = 2,
            Others = 3,
        }
    }

    class PlatformTools {
        static createPlatform(): Platform;
        static getCurrentPlatform(): PlatformTools.PlatformType;
        static getOSSystem(): PlatformTools.OSSystem;
        static isLittleGame(): boolean;
    }

    class DataDealer extends cc.Component {
        valueChangeComponent: (compName: string, value: any) => any;
    }

    export let platform: Platform;
}


// 
namespace pf {

    // type NoneParmaFun = () => void;
    type LoadSubpackageParam = LoadSubpackageObject;

    interface LoginParam {
        type?: number,
        success?: (data: { code: string }) => void,
        fail?: () => void,
        complete?: Function,
    }
}







// little game 
namespace pf {


    interface LoadSubpackageObject {
        name: string,
        success?: Function,
        fail?: Function,
        complete?: Function,
    }

    interface LoadSubpackageTask {
        onProgressUpdate(listener: (res: { progress: number, totalBytesWritten: number, totalBytesExpectedToWrite: number }) => void);
    }

    interface LittleGameUserInfo {
        nickName: string,
        avatarUrl: string,
    }

    interface LittleGameUserInfoData {
        userInfo: LittleGameUserInfo,
        rawData?: string,
        signature?: string,
        encryptedData?: string,
        iv?: string,
    }

    interface SystemInfoData {
        safeArea: { left: number, right: number, top: number, bottom: number, width: number, height: number }
    }

    /**
     * 共有api
     */
    interface LittleGameApi {
        loadSubpackage(object: LoadSubpackageObject): LoadSubpackageTask;
        getSystemInfoSync(): SystemInfoData;
    }

}


namespace pf {

    interface WXLoginObject {
        timeout?: number,
        success?: (data: { code: string }) => void,
        fail?: (data: { errMsg: string, errno: number }) => void,
        complete?: Function,
    }

    interface WXUserInfoData extends LittleGameUserInfoData {
        cloudID?: string,
    }

    interface WXGetUserInfoObject {
        withCredentials?: boolean,
        lang?: 'en' | 'zh_CN' | 'zh_TW',
        success?: (data: WXUserInfoData) => void,
        fail?: () => void,
        complete?: () => void,
    }

    interface WXCreateUserInfoButtonObject {
        type: 'text' | 'image',
        text?: string,
        image?: string,
        style: {
            left: number,
            top: number,
            width: number,
            height: number,
        },
        withCredentials?: boolean,
        lang?: 'en' | 'zh_CN' | 'zh_TW',
    }

    interface WXGetSettingData {
        authSetting: { [key: string]: boolean },
        subscriptionsSetting: any,
    }

    interface WXGetSettingObject {
        withSubscriptions?: boolean,
        success?: (data: WXGetSettingData) => void,
        fail?: () => void,
        complete?: () => void,
    }

    interface WXUserInfoButton {
        show();
        hide();
        destroy();
        onTap(func: (res: WXUserInfoData) => void);
        offTap(func: (res: WXUserInfoData) => void);
    }

    interface WXAuthorizeObject {
        scope: WXAuthType,
        success: () => void,
        fail: () => void
    }

    type WXAuthType = 'scope.userInfo' | 'scope.userLocation' | 'scope.werun' | 'scope.writePhotosAlbum' | 'scope.WxFriendInteraction' | 'scope.gameClubData'

    /**
     * 微信api
     */
    interface WX extends LittleGameApi {
        login(object?: WXLoginObject);
        getUserInfo(object: WXGetUserInfoObject);
        createUserInfoButton(object: WXCreateUserInfoButtonObject): WXUserInfoButton;
        getSetting(object: WXGetSettingObject);
        authorize(object: WXAuthorizeObject);
    }
    export let wx: WX;
}

namespace pf {

    /**
     * QQ api
     */
    interface QQ extends WX {

    }

    export let qq: QQ;
}

namespace pf {

    type TTAuthType = 'scope.userInfo' | 'scope.userLocation' | 'scope.address' | 'scope.record' | 'scope.album' | 'scope.camera' | 'scope.clipboard' | 'scope.pip'

    interface TTResult {
        errMsg: string
    }

    interface TTResultWithCode extends TTResult {
        errCode: number,
    }

    interface TTLoginData extends TTResult {
        code: string,
        anonymousCode: string,
        isLogin: boolean
    }

    interface TTLoginObject {
        force?: boolean,
        success?: (data: TTLoginData) => void,
        fail?: (data: TTResult) => void,
        complete?: Function,
    }

    interface TTUserInfoData extends LittleGameUserInfoData {
        realNameAuthenticationStatus: "certified" | "uncertified",
    }

    interface TTGetUserInfoObject {
        withCredentials?: boolean,
        withRealNameAuthenticationInfo?: boolean,
        success?: (data: TTUserInfoData) => void,
        fail?: (data: TTResult) => void,
    }

    interface TTGetSettingData {
        authSetting: { [key: string]: boolean },
    }

    interface TTGetSettingObject {
        success?: (data: TTGetSettingData) => void,
        fail?: (data: TTResultWithCode) => void,
        complete?: () => void,
    }

    interface TTAuthorizeObject {
        scope: TTAuthType,
        success: () => void,
        fail: () => void
    }

    /**
     * 字节api
     */
    interface TT extends LittleGameApi {
        login(object: TTLoginObject);
        getUserInfo(object: TTGetUserInfoObject);
        getSetting(object: TTGetSettingObject);
        authorize(object: TTAuthorizeObject);
    }

    export let tt: TT;
}