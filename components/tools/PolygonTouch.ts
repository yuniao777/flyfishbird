
const { ccclass, property, menu } = cc._decorator;

var _mat4_temp = cc.mat4();
var _htVec3a = new cc.Vec3();
var _htVec3b = new cc.Vec3();

/**
 * 此组件并不监听点击事件，只修改点击有效区域
 * 快速描边方法，先给节点添加一个 PolygonCollider （碰撞组件 -> Polygon Collider），然后点击第一行的那个蓝色按钮，会根据threshold参数自动描边。
 * 再经过微调后，reset组件，就会将 PolygonCollider 的points属性同步到此组件。
 */
@ccclass
@menu('ffb ui组件/PolygonTouch')
export default class PolygonTouch extends cc.Component {

    @property({ editorOnly: true }) _showArea = false;

    @property
    set showArea(v) {
        this._showArea = v;

        if (!this._showArea) {
            let node = this.node.getChildByName("DEBUG_NODE");
            node && node.destroy();
            return;
        }

        if (this.points.length <= 1) {
            return;
        }

        let node = this.node.getChildByName("DEBUG_NODE");
        let graphics = null;
        if (!node) {
            node = new cc.Node();
            node.name = "DEBUG_NODE";
            graphics = node.addComponent(cc.Graphics);
        } else {
            graphics = node.getComponent(cc.Graphics);
        }

        this.node.addChild(node);

        for (let i = 0; i < this.points.length; ++i) {
            if (i === 0) {
                graphics.moveTo(this.points[i].x, this.points[i].y);
            } else {
                graphics.lineTo(this.points[i].x, this.points[i].y);
            }
        }
        graphics.moveTo(this.points[0].x, this.points[0].y);

        graphics.fill();
    }

    @property
    get showArea() {
        return this._showArea;
    }

    @property(cc.Vec2) points: cc.Vec2[] = [];

    protected resetInEditor(): void {
        let polygon = this.node.getComponent(cc.PolygonCollider);
        if (!polygon) {
            return;
        }
        for (let i = 0; i < polygon.points.length; ++i) {
            let point = polygon.points[i];
            this.points.push(cc.v2(point.x, point.y));
        }
    }

    protected start(): void {
        let points = this.points;
        this.node._hitTest = function (point, listener,) {
            return _hitTest(this, point, listener, points);
        };
    }
}

function _hitTest(node: cc.Node, point, listener, points: cc.Vec2[]) {
    let cameraPt = _htVec3a, testPt = _htVec3b;

    let camera = cc.Camera.findCamera(node);
    if (camera) {
        camera.getScreenToWorldPoint(point, cameraPt);
    } else {
        cameraPt.set(point);
    }

    node._updateWorldMatrix();
    // If scale is 0, it can't be hit.
    if (!cc.Mat4.invert(_mat4_temp, node._worldMatrix)) {
        return false;
    }
    cc.Vec2.transformMat4(testPt, cameraPt, _mat4_temp);

    let hit = false;
    if (test(testPt, points)) {
        hit = true;
        if (listener && listener.mask) {
            let mask = listener.mask;
            let parent = node;
            let length = mask ? mask.length : 0;
            // find mask parent, should hit test it
            for (let i = 0, j = 0; parent && j < length; ++i, parent = parent.parent) {
                let temp = mask[j];
                if (i === temp.index) {
                    if (parent === temp.node) {
                        let comp = parent.getComponent(cc.Mask);
                        if (comp && comp.enabled && !comp._hitTest(cameraPt)) {
                            hit = false;
                            break
                        }

                        j++;
                    } else {
                        // mask parent no longer exists
                        mask.length = j;
                        break
                    }
                } else if (i > temp.index) {
                    // mask parent no longer exists
                    mask.length = j;
                    break
                }
            }
        }
    }

    return hit;
}

function test(point: cc.Vec3, v: cc.Vec2[]) {
    let nCross = 0;
    let arrayLen = v.length;
    for (let i = 0; i < arrayLen; i++) {
        let v1 = v[i];
        let v2 = v[(i + 1) % arrayLen];

        if (v1.y == v2.y) continue;

        if (point.y < Math.min(v1.y, v2.y)) continue;
        if (point.y > Math.max(v1.y, v2.y)) continue;

        let x = (point.y - v1.y) * (v2.x - v1.x) / (v2.y - v1.y) + v1.x;
        if (x > point.x) {
            ++nCross;
        }
    }

    return nCross % 2 == 1;
}
