cc.Class({
    extends: cc.Component,

    properties: {

    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        if (this.isstageBox(otherCollider.node.name)) {
            // cc.audioEngine.playEffect(selfCollider.node.game.rockAudio, false);
            var box = otherCollider.getComponent(cc.Sprite);
            var scoreLabel = otherCollider.node.getChildByName("scoreLabel");
            var label = scoreLabel.getComponent(cc.Label);
            var labelValue =  parseInt(label.string);
            // 判断label数值是否为1
            if (labelValue == 1) {
                box.node.destroy();
            } else {
                label.string = (--labelValue).toString();
            }
            var colorArr = this.hslToRgb(labelValue * 0.025, 0.5, 0.5);
            otherCollider.node.getChildByName("boxBgView").setColor(cc.color(colorArr[0], colorArr[1], colorArr[2]));
        }else if (this.isLifeBall(otherCollider.node.name)) {
            otherCollider.node.destroy();
            selfCollider.node.game.addBolls ++;
        }
        selfCollider.node.game.playLineAni(otherCollider.node);
    },

    isstageBox(nodeName){
        if (nodeName == window.GameStage.stage_box1 || nodeName == window.GameStage.stage_box2 || nodeName == window.GameStage.stage_box3 || nodeName == window.GameStage.stage_box4 ||
            nodeName == window.GameStage.stage_box5 || nodeName == window.GameStage.stage_box6 ) {
            return true;
        }
        return false;
    },

    isLifeBall(nodeName){
        if (nodeName == window.GameStage.stage_lifeBall1 || nodeName == window.GameStage.stage_lifeBall2 || nodeName == window.GameStage.stage_lifeBall3 ) {
            return true;
        }
        return false;
    },

    playLineAni(node){
        
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
    }


});
