cc.Class({
    extends: cc.Component,
    properties: {
        contentView:{
            default:null,
            type:cc.Node,
        },
        editView:{
            default:null,
            type:cc.Node,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if(!cc.game.audioManager){
            var AudioManager = require('AudioManager');
            cc.audioManager = new AudioManager();
        }
        
        var childrenNode = this.contentView.children;
        for (let index = 0; index < childrenNode.length; index++) {
            childrenNode[index].getChildByName("label").getComponent(cc.Label).string = index+1;
        }
    },

    start () {

    },

    clickItem(e,a){
        let level = e.target.getChildByName("label").getComponent(cc.Label).string;
        console.log("level = "+level);
        window.gameLevel = level;
        cc.director.loadScene('bounceGameAll');
        cc.audioManager.playClickEffect();
    },

    clickEnterLevel(){
        let str = this.editView.getComponent(cc.EditBox).string;
        try {
            let num = parseInt(str);
            if (num > 0 && num < 3000) {
                window.gameLevel = num;
                cc.director.loadScene('bounceGameAll');
                cc.audioManager.playClickEffect();
            }
        } catch (error) {
            console.log(error)
        }
    },
    // update (dt) {},
});
