
cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume:1.0,
        sfxVolume:1.0,
        bgmAudioID:-1,
        defaultMusicIndex:0,
    },

    start () {

    },

    getUrl:function(url){
        return cc.url.raw("resources/" + url);
    },

    playMJBGM(index){
        index = 0;
        var url = "bgmusic/game_backmusic_"+index+".mp3";
        this.playBGM(url,index);
    },

    playBGM(url,order){
        var audioUrl = this.getUrl(url);
        if (this.bgmAudioID != -1) {
            cc.audioEngine.stop(this.bgmAudioID);            
        }
        this.bgmAudioID = cc.audioEngine.play(audioUrl,true,window.bgMusicvol);
        this.setBGMVolume(window.bgMusicvol);
    },

    stopBGM(){
        if(this.bgmAudioID >= 0){
            cc.audioEngine.stop(this.bgmAudioID);
        }
    },
    
    playSFX(url){
        var audioUrl = this.getUrl(url);
        cc.audioEngine.play(audioUrl,false,1);    
    },
    
    setSFXVolume: function (v) {
        console.log('setSFXVolume = ' + v);
        if(this.sfxVolume != v){
            // cc.sys.localStorage.setItem("sfxVolume",v);
        }
        this.sfxVolume = v;
        if (window.bgFxvolRecord != v) {
            window.bgFxvol = v;
        }
    },
    
    setBGMVolume:function(v){
        let voice = 0;
        if (cc.nab.audioManager.getBGMSetting().backGroundMusicVolume == 0) {
            voice = 0;     
        }else{
            if (window.voiceMode == '1') {
                voice = window.bgMusicvolRealTime;
            }else{
                voice = v;
            }
        }
        cc.audioEngine.setVolume(this.bgmAudioID,voice);
    },
    
    pauseAll:function(){
        cc.audioEngine.pauseAll();
    },
    
    resumeAll:function(){
        cc.audioEngine.resumeAll();
    },

    playGameEffectType(stageType){
        var url = "";
        if (stageType == window.GameStageType.stage_1_box || stageType == window.GameStageType.stage_2_double_box || stageType == window.GameStageType.stage_3_box_left_down ||
            stageType == window.GameStageType.stage_4_box_right_down || stageType == window.GameStageType.stage_5_box_right_up || stageType == window.GameStageType.stage_6_box_left_up ||
            stageType == window.GameStageType.stage_11_box_type1 || stageType == window.GameStageType.stage_12_box_type2 || stageType == window.GameStageType.stage_13_box_type3 ||
            stageType == window.GameStageType.stage_16_box_type4 || stageType == window.GameStageType.stage_17_box_type5 || stageType == window.GameStageType.stage_20_box_type6 ) {
                url = "pfx/01.mp3";
        }else if (stageType == window.GameStageType.stage_7_line_hor || stageType == window.GameStageType.stage_8_line_ver ) {
            url = "pfx/04.mp3";
        }else if (stageType == window.GameStageType.stage_7_line_hor || stageType == window.GameStageType.stage_9_line_bomb ) {
            url = "pfx/03.mp3";
        }else if (stageType == window.GameStageType.stage_21_ball_add1 || stageType == window.GameStageType.stage_24_ball_fensan) {
            url = "pfx/10.mp3";
        }
        if (url != "") {
            this.playSFX(url);    
        }
    },

    playGameWinEffect(){
        var url = "pfx/11.mp3";
        this.playSFX(url);
    },

    playGameFailEffect(){
        var url = "pfx/09.mp3";
        this.playSFX(url);
    },

    //按钮点击音效
    playClickEffect(){
        var url = "pfx/01.mp3";
        this.playSFX(url);
    },

    //npc播放音效
    playClickNpc(){
        var url = "Npc/npc-stand.mp3";
        this.playSFX(url);
    },

    //碰杠操作
    playMjOperatorEffect:function(operatorVale,sex){
        var pathUrl = '';
        var sexStr = 'women';
        if (sex == 1) {
            sexStr = 'man';
        }
        pathUrl = 'mjSounds/'+sexStr+'/'+sexStr+'_'+operatorVale+'.mp3';
        this.playSFX(pathUrl);
    },
    // update (dt) {},
});
