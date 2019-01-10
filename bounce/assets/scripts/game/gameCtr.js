// 道具类型
window.GameStageType = cc.Enum({
    stage_0_space:"0",//空白
    stage_1_box:"1",//方块数字
    stage_2_double_box:"2",//2倍方块数字
    stage_3_box_left_down:"3",//左下三角数字
    stage_4_box_right_down:"4",//右下三角数字
    stage_5_box_right_up:"5",//右上三角数字
    stage_6_box_left_up:"6",//左上三角数字
    stage_7_line_hor:"7",//横向射线道具
    stage_8_line_ver:"8",//竖向射线道具
    stage_9_line_bomb:"9",
    stage_11_box_type1:"11",//固定可打击砖块    可打击，但不会下降
    stage_12_box_type2:"12",//合状态固定砖块    固定砖块，不会下降
    stage_13_box_type3:"13",//开状态固定砖块    固定砖块，不会下降，打击无效
    stage_16_box_type4:"16",//可下降合砖块
    stage_17_box_type5:"17",//可下降闭砖块
    stage_20_box_type6:"20",//固定砖块          固定砖块，不会下降，不可打击
    stage_21_ball_add1:"21",//加1道具
    stage_24_ball_fensan:"24",//分散道具

    stage_100_ani_line_hor:"stage_horlineAni",//
    stage_100_ani_line_ver:"stage_verlineAni",//
    stage_100_ani_line_bomb:"stage_bomblineAni",//
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
        tempFrstBollPositionX: 0,
        // 所有小球计数
        allBolls: 0,
        // 所有触底小球计数
        tampBolls: 0,
        addBolls: 0,
        level: 1,
        ballPositonY:-302,
        topBoxY:380,
        boxWidth:58,
        boxHeight:58,

        // 标记第一个触底boll的boll
        indexBoll: {
            default: null,
            type: cc.Sprite,
        },

        bollPrefab: {
            default: null,
            type: cc.Prefab,
        },

        //配置道具预制 三角形 正方形，生生命球等等
        gameStagePrefabs: {
            default: [],
            type: cc.Prefab,
        },

        //横竖射线动画
        lineBoxAni: {
            default:[],
            type: cc.Prefab,
        },
        
        // 地面
        ground: {
            default: null,
            type: cc.Node
        },

        //游戏结束
        gameOverNode: {
            default: null,
            type: cc.Node
        },

        //游戏暂停
        gamePauseNode: {
            default: null,
            type: cc.Node
        },

        // 轨迹条
        ballLink: {
            default: null,
            type: cc.Sprite,
        },

        //关卡
        levelLabel: {
            default: null,
            type: cc.Label,
        },

        //球总数
        allBollsLabel: {
            default: null,
            type: cc.Label,
        },

        //配置的当前关卡的道具数量数组
        numArray:[],
        //配置的当前关卡的道具类型数组
        typeArray:[],
        startNum:0,
    },

    //开始游戏之前，清理之前游戏留下的残余，初始话
    cleanGame(){
        this.isActivity = false;
        this.firstBollPositionX = 0;
        this.allBollsLabel.node.x = this.firstBollPositionX + 40;
        let childrenNode = this.node.children;
        for (var i = childrenNode.length; i > 0; i--) {
            var node = childrenNode[i];
            if (node) {
                if (this.isCanDownNode(node) || this.isAllowDownNode(node)) {
                    node.removeFromParent();
                    node.destroy();
                }
                if (node.name == "bollSprite" ) {
                    if (node.uuid == this.indexBoll.node.uuid) {
                        this.indexBoll.node.setPosition(cc.v2(0, this.ballPositonY));
                        this.indexBoll.enabled = true;
                    }else{
                        node.removeFromParent();
                        node.destroy();
                    }
                }
            }
        }

    },

    //分享读取的当前关卡的配置
    analysisMapData(mapdataArray){
        this.cleanGame();
        this.numArray = [];
        this.typeArray = [];
        let isNumData = false;
        for (let index = 0; index < mapdataArray.length; index++) {
            if (mapdataArray[index].indexOf("data=")!= -1 || mapdataArray[index].indexOf("[layer]") != -1 || mapdataArray[index].indexOf("type=Tile Layer 1")!= -1) {
                continue;
            }else if (mapdataArray[index].indexOf("type=Tile Layer 2")!= -1) {
                isNumData = true;
            }else if (isNumData == true ) {//次数
                let horNumArray = mapdataArray[index].split(",");
                this.numArray.push(horNumArray);
            }else {//类型
                let hortypeArray = mapdataArray[index].split(",");
                this.typeArray.push(hortypeArray);
            }
        }
        this.isBegin = true;
        let startArrayNum = 0;
        //生成关卡
        for (let index = this.typeArray.length; index >= 0; index--) {
            if (startArrayNum == 12) {
                break;
            }
            startArrayNum ++;
            this.boxDownMove(true);
            this.startNum = index;
            this.createCellBall(this.typeArray[index],this.numArray[index]);
        }
    },

    // 生成关卡的一层
    createCellBall(cellTypeArray,cellNumArray){
        for (var i = 0; i < 11; i++) {
            try {
                let stageType = cellTypeArray[i];
                if (!this.gameStagePrefabs[stageType]) {
                    continue;
                }
                var stageNode = cc.instantiate(this.gameStagePrefabs[stageType]);
                stageNode.setPosition(i * this.boxWidth - 320 + this.boxWidth / 2, this.topBoxY);
                this.node.addChild(stageNode);
                if (stageType == window.GameStageType.stage_7_line_hor || stageType == window.GameStageType.stage_8_line_ver || stageType == window.GameStageType.stage_9_line_bomb ) {
                    this.createStageLine(i,stageType);                    
                }
                let scoreLabel = stageNode.getChildByName("scoreLabel");
                if ( scoreLabel){
                    scoreLabel.getComponent(cc.Label).string = cellNumArray[i];
                }
            } catch (error) {
                
            }
        }
    },

    //向下移动
    boxDownMove: function (gameInit) {   
        this.level ++;
        let gameOver = false;
        if (this.isBegin == true) {
            let gameWin = true;
            var childrenNode = this.node.children;
            for (var i = 0; i < childrenNode.length; i++) {
                var node = childrenNode[i];
                if (this.isCanDownNode(node) || (gameInit == true && this.isAllowDownNode(node))) {
                    gameWin = false;
                    if (node.position.y <= this.topBoxY) {
                        node.y -= this.boxHeight;
                        if (node.y <= this.ballPositonY) {
                            gameOver = true;
                        }
                    }
                }
                if (gameInit != true) {
                    if (node.name == window.GameStageType.stage_16_box_type4 || node.name == window.GameStageType.stage_17_box_type5) {
                        node.getChildByName("imgclose").active = !node.getChildByName("imgclose").active;
                    }
                }
            }
            this.bollDown = false;
            if (gameOver) {
                this.showGameOver();
            }
            if (gameWin && gameInit != true) {
                window.gameLevel = window.gameLevel + 1;
                this.readLevelConfig();
                console.log("过关");
                cc.audioManager.playGameWinEffect();
            }
        }
    },

    //是否是可向下移动的box 有些固定的Box不允许移动 ,竖着的动画不向下移动
    isCanDownNode(node){
        if (node.name == window.GameStageType.stage_1_box || node.name == window.GameStageType.stage_2_double_box || node.name == window.GameStageType.stage_3_box_left_down ||
            node.name == window.GameStageType.stage_4_box_right_down || node.name == window.GameStageType.stage_5_box_right_up || node.name == window.GameStageType.stage_6_box_left_up ||
            node.name == window.GameStageType.stage_7_line_hor || node.name == window.GameStageType.stage_8_line_ver || node.name == window.GameStageType.stage_9_line_bomb || node.name == window.GameStageType.stage_16_box_type4 ||
            node.name == window.GameStageType.stage_17_box_type5 || node.name == window.GameStageType.stage_21_ball_add1 || node.name == window.GameStageType.stage_24_ball_fensan ||
            node.name == window.GameStageType.stage_100_ani_line_hor || node.name == window.GameStageType.stage_100_ani_line_bomb ){
            return true;
        }
        return false;
    },

    //是否是允许下落的node  
    isAllowDownNode(node){
        if (node.name == window.GameStageType.stage_11_box_type1 || node.name == window.GameStageType.stage_12_box_type2 || node.name == window.GameStageType.stage_13_box_type3 ||
            node.name == window.GameStageType.stage_16_box_type4 || node.name == window.GameStageType.stage_17_box_type5 || node.name == window.GameStageType.stage_20_box_type6 ||
            node.name == window.GameStageType.stage_7_line_hor || node.name == window.GameStageType.stage_8_line_ver || node.name == window.GameStageType.stage_9_line_bomb || node.name == window.GameStageType.stage_16_box_type4 ||
            node.name == window.GameStageType.stage_17_box_type5 || node.name == window.GameStageType.stage_21_ball_add1 || node.name == window.GameStageType.stage_24_ball_fensan ||
            node.name == window.GameStageType.stage_100_ani_line_hor || node.name == window.GameStageType.stage_100_ani_line_bomb ){
            return true;
        }
        return false;
    },

    onLoad () {
        this.readLevelConfig();
        // 开启物理
        cc.director.getPhysicsManager().enabled = true;
        // 开启碰撞
        cc.director.getCollisionManager().enabled = true;

        this.indexBoll.node.setPosition(cc.v2(this.firstBollPositionX, this.ballPositonY));
        this.ballLink.node.setPosition(cc.v2(this.firstBollPositionX, this.ballPositonY));   
        this.ballLink.enabled = false;
        this.ground.getComponent('groundSprite').game = this;
        this.allBolls = 30;
        this.allBollsLabel.getComponent(cc.Label).string = "x"+this.allBolls;
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
    },

    //读取关卡配置
    readLevelConfig(){
        var self = this;
        this.levelLabel.getComponent(cc.Label).string = "关卡："+window.gameLevel;
        cc.loader.loadRes("map/mapdata"+window.gameLevel, function (err, maptxt) {
            let mapdataArray = maptxt.split("\n");
            self.analysisMapData(mapdataArray);
            console.log("1");
        });
    },

    //生成消灭一条线的道具
    createStageLine(i,stagelineType){
        if (stagelineType == window.GameStageType.stage_7_line_hor) {
            stagelineType = 0;
        }else if (stagelineType == window.GameStageType.stage_8_line_ver) {
            stagelineType = 1;
        }else {
            return;
        }
        var lineani = cc.instantiate(this.lineBoxAni[stagelineType]);
        let lineAniX = 0;
        let lineAniY = 0;
        if (stagelineType == 0) {   //横线
            lineAniX = 0;
            lineAniY = this.topBoxY;
        }else if(stagelineType == 1){
            lineAniX = i * this.boxWidth - 320 + this.boxWidth / 2;
            lineAniY = 80;
        }
        lineani.x = lineAniX;
        lineani.y = lineAniY;
        //线的动画
        this.node.addChild(lineani);
    },

    //分散射线道具  随机 45,90,135度反射
    randomLine(node,ballNode){
        if (node.name == window.GameStageType.stage_24_ball_fensan) {
            let randomDirection = this.randomFrom(0,2);
            randomDirection = 2
            let xVelocityOld = ballNode.body.linearVelocity.x;
            let yVelocityOld = ballNode.body.linearVelocity.y;
            if (xVelocityOld<0 ) {
                xVelocityOld = -xVelocityOld;
            }
            if (yVelocityOld<0 ) {
                yVelocityOld = -yVelocityOld;
            }
            let newVelocity = xVelocityOld + yVelocityOld;
            let xVelocity = 0;
            let yVelocity = 0;
            if (randomDirection == 0) {
                xVelocity = -newVelocity/2;
                yVelocity = newVelocity/2;
            }else if (randomDirection == 1) {
                xVelocity = 0;
                yVelocity = newVelocity;
            }else if (randomDirection == 2) {
                xVelocity = newVelocity/2;
                yVelocity = newVelocity/2;
            }
            ballNode.body.linearVelocity = cc.v2(xVelocity,yVelocity);
        }
    },

    //播放横竖射线的动画
    playLineAni(node,ballNode){
        this.randomLine(node,ballNode);
        if (node.name != window.GameStageType.stage_7_line_hor && node.name != window.GameStageType.stage_8_line_ver && node.name != window.GameStageType.stage_9_line_bomb) {
            return;
        }
        let anitype = "";
        if (node.name == window.GameStageType.stage_7_line_hor) {
            anitype = window.GameStageType.stage_100_ani_line_hor;
        }else if (node.name == window.GameStageType.stage_8_line_ver) {
            anitype = window.GameStageType.stage_100_ani_line_ver;
        }else if (node.name == window.GameStageType.stage_9_line_bomb) {
            anitype = window.GameStageType.stage_100_ani_line_bomb;
        }
        let childrenNode = this.node.children;
        for (var i = 0; i < childrenNode.length; i++) {
            let childnode = childrenNode[i];
            if (childnode.y == node.y && childnode.name == anitype) {//横线
                let lineBoxAnictrl = childnode.getComponent("lineBoxAni");
                lineBoxAnictrl.runAnimation();
            }else if (childnode.x == node.x && childnode.name == anitype) {//竖线
                let lineBoxAnictrl = childnode.getComponent("lineBoxAni");
                lineBoxAnictrl.runAnimation();
            }

            if (childnode.y == node.y && anitype == window.GameStageType.stage_100_ani_line_hor) {
                this.reduceOneBox(childnode);
            }
            if (childnode.x == node.x && anitype == window.GameStageType.stage_100_ani_line_ver) {
                this.reduceOneBox(childnode);
            }
            if (childnode.y == node.y && anitype == window.GameStageType.stage_100_ani_line_bomb) {
                this.reduceBox(childnode);
            }
        }
    },

    //碰撞 减少砖块的一个数字
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

    //移除这个砖块
    reduceBox(node){
        if (!node) {
            return;
        }
        node.destroy();
    },

    //触碰开始
    touchStart: function (event) {
        this.ballLink.node.setPosition(cc.v2(this.firstBollPositionX, this.ballPositonY));
        if (this.isActivity == false) {
            var starttouchX = event.touch._startPoint.x;
            this.ballLink.node.setRotation(starttouchX);
        }
    },

    //触碰移动
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

    //触碰结束
    touchEnd: function (event) {
        if (this.isActivity == false) {
            this.ballLink.enabled = false;
            this.allBollsLabel.enabled = false;
            if (this.isBegin == false) {
                this.isBegin = true;
            }
            this.tempFrstBollPositionX = this.firstBollPositionX;
            this.schedule(this.bollStartRun, 0.1, this.allBolls - 1)
            this.isFirstBoll = false;
            this.indexBoll.enabled = false;
            this.isActivity = true;
        }
    },

    //小球开始 运动，射出
    bollStartRun(){
        var boll = cc.instantiate(this.bollPrefab);
        this.node.addChild(boll);
        boll.game = this;
        boll.setPosition(cc.v2(this.tempFrstBollPositionX, this.ballPositonY));
        var boxRigidBody = boll.getComponent(cc.RigidBody);
        var angle = -this.ballLink.node.rotation - 270;
        var toX = Math.cos(angle * 0.017453293) * 200;
        var toY = Math.sin(angle * 0.017453293) * 200;
        boxRigidBody.linearVelocity = cc.v2(toX * 15, toY * 15);
    },

    //显示提示的那个直线
    showTishiLine(){
        this.ballLink.enabled = true;
    },

    showGameOver: function () {
        // cc.director.loadScene('bounceGame');
        console.log("游戏结束");
        cc.audioManager.playGameFailEffect();
    },

    update (dt) {
        if (this.bollDown == true) {
            this.boxDownMove();
            this.startNum --;
            if (this.startNum >= 0) {
                this.createCellBall(this.typeArray[this.startNum],this.numArray[this.startNum]);                
            }
        }
        
        if(this.isFirstBoll == true) {
            this.indexBoll.enabled = true;
            this.indexBoll.node.setPosition(cc.v2(this.firstBollPositionX, this.ballPositonY));
        }
    },

    showGameOver(){
        this.gameOverNode.active = true;
    },

    showGamePause(){
        this.gamePauseNode.active = true;
    },

    clickBtnContinue(){
        this.gamePauseNode.active = false;
        this.gameOverNode.active = false;
    },

    clickBtnRestart(){
        this.unschedule(this.bollStartRun)
        this.readLevelConfig();
        this.gamePauseNode.active = false;
    },

    clickBtnBack(){
        cc.director.loadScene('hall');
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

    //随机 [lowerValue,upperValue]
    randomFrom:function(lowerValue,upperValue)
    {
        return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
    },
});
