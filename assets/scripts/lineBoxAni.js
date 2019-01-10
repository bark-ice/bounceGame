cc.Class({
    extends: cc.Component,

    properties: {
       _anum:0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.active = false;
    },

    onEnable(){
        // this.runAnimation();
    },

    runAnimation(){
        this.node.active = true;
        var seq = cc.sequence(cc.scaleTo(0.1,1,0), cc.scaleTo(0.1,1,1));
        var repeat = cc.repeat(seq,5);
        this.node.runAction(repeat);
        var seqOpa = cc.sequence(cc.fadeIn(0.1), cc.fadeOut(0.1));
        var repeatOpa = cc.repeat(seqOpa,2);
        this.node.runAction(repeatOpa);
    },

    start () {

    },

    update (dt) {   
        
    },
});












