
interface Task {
    func: Function,
    resolve: Function,
    argArray?: any[],
    thisObj: any,
}

const MAX_SPEND_TIME = 12;           //Task最大的消耗时间

interface TaskQueen {
    list: Task[]
    tag: string,
}

//添加任务队列，优先级
export default class TaskDispatcher {

    MAX_PRIORITY = 10;
    MIN_PRIORITY = 0;

    priorityQueens: TaskQueen[][] = [];
    timerTaskSpendTime = 13;

    init() {
        // let schedule = cc.director.getScheduler();
        // schedule.enableForTarget(this);
        // schedule.schedule(this.update, this, 0);
        cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this.afterUpdate, this);
        for (let i = 0; i <= this.MAX_PRIORITY; ++i) {
            this.priorityQueens.push([]);
        }
    }

    //根据上一帧的耗时来评估当前帧所能耗费的时间。每帧最少执行一个任务。
    afterUpdate(dt) {
        let deltaTime = Math.floor((cc.director.getDeltaTime() - 1 / cc.game.getFrameRate()) * 10000) / 10;
        let task: Task = this.getNextTask();
        if (!task) {
            if (deltaTime < 0.3) {
                this.timerTaskSpendTime = Math.min(this.timerTaskSpendTime + 3, MAX_SPEND_TIME);
            }
            return;
        }

        if (deltaTime > 0.3) {
            this.timerTaskSpendTime = Math.max(0, this.timerTaskSpendTime - deltaTime);
        } else if (this.timerTaskSpendTime < MAX_SPEND_TIME) {
            this.timerTaskSpendTime = Math.min(this.timerTaskSpendTime + 3, MAX_SPEND_TIME);
        }

        if (cc.sys.os == cc.sys.OS_WINDOWS) {
            this.timerTaskSpendTime = 13;
        }

        let beginTime = performance.now();

        // let count = 0;
        while (task) {
            // count ++;
            task.resolve(task.func.apply(task.thisObj, task.argArray));
            let now = performance.now();
            if (CC_DEBUG && task && now - beginTime > 1 / cc.game.getFrameRate() * 1000) {
                console.warn("TaskDispatcher: " + task.func.name + " spent a lot of time");
                break;
            }
            if (now - beginTime >= this.timerTaskSpendTime) {
                break;
            }
            task = this.getNextTask();
        }
        // console.log(count);
    }

    private getNextTask(): Task {
        let len = this.priorityQueens.length;
        for (let i = len - 1; i >= 0; --i) {
            let taskQueens = this.priorityQueens[i];
            for (let j = 0; j < taskQueens.length; ++j) {
                let queen = taskQueens[j];
                if (queen === undefined) {
                    continue;
                }
                let task = queen.list.shift();
                if (task) {
                    // console.log('getNextTask', i, queen.tag);
                    return task;
                } else {
                    taskQueens.splice(j, 1);
                    j--;
                }
            }
        }
        return null;
    }

    addTaskToPriorityQueens<T>(priority: number, tag: string, func: (...argArray: any[]) => T, thisObj?: any, ...argArray: any[]): Promise<T> {
        // console.log(tag, argArray && argArray.length > 0 && argArray[0] instanceof cc.Node && (argArray[0].uuid + ' ' + argArray[0].name));
        return new Promise((resolve, reject) => {
            let task: Task = { func, resolve, argArray, thisObj };
            let queen: TaskQueen = this.getTaskQueen(priority, tag);
            if (queen) {
                queen.list.push(task);
            } else {
                this.priorityQueens[priority].push({ tag: tag, list: [task] });
            }
        });
    }

    clearTaskQueens<T>(tag: string) {
        let queen: TaskQueen = this.getTaskQueenByTag(tag);
        if (queen) {
            let len = queen.list.length;
            for (let i = 0; i < len; ++i) {
                queen.list[i].resolve();
            }
            queen.list.length = 0;
        }
    }

    getTaskQueen(priority: number, tag: string): TaskQueen {
        let taskQueens = this.priorityQueens[priority];
        if (taskQueens.length > 0) {
            for (let i = 0; i < taskQueens.length; ++i) {
                let queen = taskQueens[i];
                if (queen.tag === tag) {
                    return queen;
                }
            }
        }
        return null
    }

    getTaskQueenByTag(tag: string): TaskQueen {
        for (let i = 0; i < this.priorityQueens.length; ++i) {
            let taskQueens = this.priorityQueens[i];
            for (let j = 0; j < taskQueens.length; ++j) {
                let queen = taskQueens[j];
                if (queen.tag === tag) {
                    return queen;
                }
            }
        }
        return null
    }

    changeQueenPriority(tag: string, newPriority: number, index?: number) {
        let queen = this.getTaskQueenByTag(tag);
        if (queen) {
            index = index || 0;
            let queens = this.priorityQueens[newPriority];
            if (index >= queens.length) {
                queens.push(queen);
            } else {
                queens.splice(index, 0, queen)
            }
        }
    }

}
