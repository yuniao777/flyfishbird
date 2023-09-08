import Platform from "./Platform";

export default class BrowserPlatform extends Platform {

    login(param?: pf.LoginParam): void {
        param.success && param.success({ code: '' });
        param.complete && param.complete();
    }

    loadSubpackage(param: pf.LoadSubpackageParam): pf.LoadSubpackageTask {
        param.success && param.success();
        param.complete && param.complete();
        return null;
    }
}
