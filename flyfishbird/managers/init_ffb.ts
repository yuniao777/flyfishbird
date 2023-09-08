import DataDealer from "../components/DataDealer";
import PlatformTools from "../platform/PlatformTools";
import DataManager from "./DataManager";
import GameManager from "./GameManager";
import LangManager from "./LangManager";
import ResManager from "./ResManager";
import TaskDispatcher from "./TaskDispatcher";
import Tools from "./Tools";

if (!CC_EDITOR) {
    let ffb = {
        gameManager: new GameManager(),
        dataManager: new DataManager(),
        resManager: new ResManager(),
        langManager: new LangManager(),
        taskDispatcher: new TaskDispatcher(),
        Tools: Tools,
        platform: PlatformTools.createPlatform(),
        PlatformTools: PlatformTools,
        DataDealer: DataDealer,
    };

    window.ffb = ffb;

    cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
        ffb.gameManager.init();
        ffb.platform.init();
    });

}

