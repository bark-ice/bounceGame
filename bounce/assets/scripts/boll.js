cc.Class({
    extends: cc.Component,

    properties: {

    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        cc.audioManager.playGameEffectType(otherCollider.node.name);
        if (this.isGetScoreNode(otherCollider.node)) {
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
        }else if (this.isLifeBall(otherCollider.node)) {
            otherCollider.node.destroy();
            selfCollider.node.game.addBolls ++;
        }
        selfCollider.node.game.playLineAni(otherCollider.node,selfCollider);
    },

    //是否是得分的Node
    isGetScoreNode(node){
        if (node.name == window.GameStageType.stage_1_box || node.name == window.GameStageType.stage_2_double_box || node.name == window.GameStageType.stage_3_box_left_down ||
            node.name == window.GameStageType.stage_4_box_right_down || node.name == window.GameStageType.stage_5_box_right_up || node.name == window.GameStageType.stage_6_box_left_up||
            node.name == window.GameStageType.stage_11_box_type1){
            return true;
        }
        if (node.name == window.GameStageType.stage_12_box_type2 || node.name == window.GameStageType.stage_13_box_type3||
            node.name == window.GameStageType.stage_16_box_type4 || node.name == window.GameStageType.stage_17_box_type5) {
            if (node.getChildByName("imgclose").active == false) {
                return true;
            }
        }
        return false;
    },

    //加球
    isLifeBall(node){
        if (node.name == window.GameStageType.stage_21_ball_add1 ) {
            return true;
        }
        return false;
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
