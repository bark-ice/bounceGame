
window.GameStage = cc.Enum({
    stage_lifeBall1:"stage_lifeball1",
    stage_lifeBall2:"stage_lifeball2",
    stage_lifeBall3:"stage_lifeball3",
    stage_box1:"stage_box1",
    stage_box2:"stage_box2",
    stage_box3:"stage_box3",
    stage_box4:"stage_box4",
    stage_box5:"stage_box5",
    stage_box6:"stage_box6",
    stage_line_hor:"stage_horline",
    stage_line_ver:"stage_verline",
    stage_line_bomb:"stage_bombline",
    stage_line_horAni:"stage_horlineAni",
    stage_line_verAni:"stage_verlineAni",
    stage_line_bombAni:"stage_bombAni",
    
});

cc.Class({
    extends: cc.Component,

    properties: {
        // 所有boll是否均落下
        bollDown: false,
        // 是否开始游戏
        isBegin: false,
        // 是否在游戏中
        isActivity: false,
        // 第一个boll是否触底
        isFirstBoll: false,
        // 第一个触底的boll X坐标
        firstBollPositionX: 0,
        // 所有小球计数
        allBolls: 0,
        // 所有触底小球计数
        tampBolls: 0,
        addBolls: 0,
        level: 1,
        topBoxY:400,
        boxWidth:58,
        boxHeight:58,

        // 标记第一个触底boll的boll
        indexBoll: {
            default: null,
            type: cc.Sprite,
        },

        boxPrefab: {
            default: [],
            type: cc.Prefab,
        },

        bollPrefab: {
            default: null,
            type: cc.Prefab,
        },

        stagePrefabs: {
            default: [],
            type: cc.Prefab,
        },

        lifePrefab: {
            default: null,
            type: cc.Prefab,
        },

        lineBoxAni: {
            default:[],
            type: cc.Prefab,
        },
        
        // 地面
        ground: {
            default: null,
            type: cc.Node
        },

        // 轨迹条
        ballLink: {
            default: null,
            type: cc.Sprite,
        },

        levelLabel: {
            default: null,
            type: cc.Label,
        },

        allBollsLabel: {
            default: null,
            type: cc.Label,
        },

        rockAudio: {
            default: null,
            url: cc.AudioClip,
        },

        circleAudio: {
            default: null,
            url: cc.AudioClip,
        },
    },

    onLoad () {
        // 开启物理
        cc.director.getPhysicsManager().enabled = true;
        // 开启碰撞
        cc.director.getCollisionManager().enabled = true;

        this.indexBoll.node.setPosition(cc.v2(this.firstBollPositionX, -350));
        this.ballLink.node.setPosition(cc.v2(this.firstBollPositionX, -350));   
        this.ballLink.enabled = false;
        this.ground.getComponent('groundSprite').game = this;
        this.initBox();
        this.allBolls = 1;
        this.level = 1;

        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            this.touchStart(event);
        }.bind(this), this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, function(event){
            this.touchMove(event);            
        }.bind(this), this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event){
            this.touchEnd(event);
        }.bind(this), this);
        this.createBall();
    },

    // 生成一层小球
    createBall(){
        var isShowLifeBox = false;
        for (var i = 0; i < 11; i++) {
            let isBox = Math.ceil(Math.random() * 10) % 2;
            if (isBox == 1) {
                let isLife = Math.ceil(Math.random() * 10) % 2;
                if (isLife == true && isShowLifeBox == false) {
                    isShowLifeBox = true;
                    // var lifeBox = cc.instantiate(this.lifePrefab);
                    var lifeBox = cc.instantiate(this.stagePrefabs[0]);
                    lifeBox.setPosition(i * this.boxWidth - 320 + this.boxWidth / 2, this.topBoxY);
                    this.node.addChild(lifeBox);
                    var lineani = cc.instantiate(this.lineBoxAni[0]);
                    lineani.y = this.topBoxY;
                    //线的动画
                    this.node.addChild(lineani);
                } else {
                    var newBox = cc.instantiate(this.boxPrefab[this.randomFrom(0,5)]);
                    var scoreLabel = newBox.children[1];
                    let isDouble = Math.ceil(Math.random() * 10) % 2;
                    if (isDouble == 1) {
                        scoreLabel.getComponent(cc.Label).string = 2 * this.level;
                    } else {
                        scoreLabel.getComponent(cc.Label).string = this.level;
                    }
                    this.node.addChild(newBox);
                    newBox.setPosition(i * this.boxWidth - 320 + this.boxWidth / 2, this.topBoxY);
                    var colorArr = this.hslToRgb(this.level * 0.025, 0.5, 0.5);
                    newBox.setColor(cc.color(colorArr[0], colorArr[1], colorArr[2]));
                }
            }
        }
    },

    isLifeBox(name){
        if (name == window.GameStage.stage_lifeBall1 || name == window.GameStage.stage_lifeBall2 || name == window.GameStage.stage_lifeBall3) {
            return true;
        }
        return false;
    },

    isScoreBox(name){
        if (name == window.GameStage.stage_box1 || name == window.GameStage.stage_box2 || name == window.GameStage.stage_box3 || 
            name == window.GameStage.stage_box4 || name == window.GameStage.stage_box5 || name == window.GameStage.stage_box6) {
            return true;
        }
        return false;
    },

    isStageLine(name){
        if (name == window.GameStage.stage_line_hor || name == window.GameStage.stage_line_ver || name == window.GameStage.stage_line_bomb ){
            return true;
        }
        return false;
    },

    isStageLineAni(name){
        if (name == window.GameStage.stage_line_horAni || name == window.GameStage.stage_line_verAni || name == window.GameStage.stage_line_bombAni ){
            return true;
        }
        return false;
    },

    initBox: function () {   
        this.level ++;
        this.levelLabel.getComponent(cc.Label).string = "分数：" + this.level;
        // 下移box
        if (this.isBegin == true) {
            var childrenNode = this.node.children;
            for (var i = 0; i < childrenNode.length; i++) {
                var node = childrenNode[i];
                if (this.isLifeBox(node.name) || this.isScoreBox(node.name) || this.isStageLine(node.name) ||  this.isStageLineAni(node.name)) {
                    if (node.position.y <= this.topBoxY) {
                        node.y -= this.boxHeight;
                        if (node.y <= -350) {
                            this.showGameOver();
                        }
                    }
                }
            }
            this.createBall();
            // createBox
            // var isShowLifeBox = false;
            // for (var i = 0; i < 11; i++) {
            //     let isBox = Math.ceil(Math.random() * 10) % 2;
            //     if (isBox == 1) {
            //         let isLife = Math.ceil(Math.random() * 10) % 2;
            //         if (isLife == true && isShowLifeBox == false) {
            //             isShowLifeBox = true;
            //             var lifeBox = cc.instantiate(this.lifePrefab);
            //             lifeBox.setPosition(i * this.boxWidth-320+this.boxWidth/2, this.topBoxY);
            //             this.node.addChild(lifeBox);
            //         } else {
            //             var newBox = cc.instantiate(this.boxPrefab);
            //             var scoreLabel = newBox.children[1];
            //             let isDouble = Math.ceil(Math.random() * 10) % 2;
            //             if (isDouble == 1) {
            //                 scoreLabel.getComponent(cc.Label).string = 2 * this.level;
            //             } else {
            //                 scoreLabel.getComponent(cc.Label).string = this.level;
            //             }
            //             this.node.addChild(newBox);
            //             newBox.setPosition(i * this.boxWidth-320+this.boxWidth/2, this.topBoxY);
            //             var colorArr = this.hslToRgb(this.level * 0.025, 0.5, 0.5);
            //             newBox.setColor(cc.color(colorArr[0], colorArr[1], colorArr[2]));
            //         }
            //     }
            // }

            this.bollDown = false;
        }
    },

    playLineAni(node){
        if (node.name != window.GameStage.stage_line_hor && node.name != window.GameStage.stage_line_ver && node.name != window.GameStage.stage_line_bomb) {
            return;
        }
        let anitype = "";
        if (node.name == window.GameStage.stage_line_hor) {
            anitype = window.GameStage.stage_line_horAni;
        }else if (node.name == window.GameStage.stage_line_ver) {
            anitype = window.GameStage.stage_line_verAni;
        }else if (node.name == window.GameStage.stage_line_ver) {
            anitype = window.GameStage.stage_line_bombAni;
        }
        let childrenNode = this.node.children;
        for (var i = 0; i < childrenNode.length; i++) {
            let childnode = childrenNode[i];
            if (childnode.y == node.y && childnode.name == anitype) {
                let lineBoxAnictrl = childnode.getComponent("lineBoxAni");
                lineBoxAnictrl.runAnimation();
            }

            if (childnode.y == node.y && anitype == window.GameStage.stage_line_horAni) {
                this.reduceOneBox(childnode);
            }
        }
    },

    reduceOneBox(node){
        var scoreLabel = node.getChildByName("scoreLabel");
        if (!scoreLabel) {
            return;
        }
        var label = scoreLabel.getComponent(cc.Label);
        var labelValue =  parseInt(label.string);
        // 判断label数值是否为1
        if (labelValue == 1) {
            node.destroy();
        } else {
            label.string = (--labelValue).toString();
        }
        var colorArr = this.hslToRgb(labelValue * 0.025, 0.5, 0.5);
        // otherCollider.node.getChildByName("boxBgView").setColor(cc.color(colorArr[0], colorArr[1], colorArr[2]));
    },

    touchStart: function (event) {
        this.ballLink.node.setPosition(cc.v2(this.firstBollPositionX, -350));
        if (this.isActivity == false) {
            var starttouchX = event.touch._startPoint.x;
            this.ballLink.node.setRotation(starttouchX);
        }
    },

    touchMove: function(event) {
        if (this.isActivity == false) {
            this.ballLink.enabled = true;
            var touchX = event.touch._point.x;
            this.ballLink.node.setRotation(touchX);
            if (this.ballLink.node.rotation < 280) {
                this.ballLink.node.setRotation(280);
            }
            if (this.ballLink.node.rotation > 440) {
                this.ballLink.node.setRotation(440);
            }
        }
    },

    touchEnd: function (event) {
        if (this.isActivity == false) {
            this.ballLink.enabled = false;
            this.allBollsLabel.enabled = false;
            if (this.isBegin == false) {
                this.isBegin = true;
            }
            this.schedule(function(){
                var boll = cc.instantiate(this.bollPrefab);
                this.node.addChild(boll);
                boll.game = this;
                boll.setPosition(cc.v2(this.firstBollPositionX, -350));
                var boxRigidBody = boll.getComponent(cc.RigidBody);
                var angle = -this.ballLink.node.rotation - 270;
                var toX = Math.cos(angle * 0.017453293) * 200;
                var toY = Math.sin(angle * 0.017453293) * 200;
                boxRigidBody.linearVelocity = cc.v2(toX * 20, toY * 20);
            }.bind(this), 0.08, this.allBolls - 1)
            
            this.schedule(function(){
                this.indexBoll.enabled = false;
                this.isFirstBoll = false;
            }.bind(this), 0.08 * (this.allBolls - 1), 1);

            this.isActivity = true;
        }
    },

    showTishiLine(){
        this.ballLink.enabled = true;
    },

    showGameOver: function () {
        cc.director.loadScene('bounceGame');
    },

    update (dt) {
        if (this.bollDown == true) {
            this.initBox();
        }
        
        if(this.isFirstBoll == true) {
            this.indexBoll.enabled = true;
            this.indexBoll.node.setPosition(cc.v2(this.firstBollPositionX, -350));
        }
    },

    hslToRgb: function (h, s, l) {
        var r, g, b;
        if(s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    randomFrom:function(lowerValue,upperValue)
    {
        return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
    },
});
