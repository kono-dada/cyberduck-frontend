<template>
  <div
      class="no-whitespace unselectable full-screen"
  >
    <img src="../assets/scan.png" alt="help"
         style="position: absolute; z-index: 5; top: 3%; left: 5%;"
         class="switches"
         @click="scanning = true"
         @init="onInit"
    >
    <v-col style="position: absolute; z-index: 5; top: 3%; right: 5%; width: 48px; margin: 0; padding: 0">
      <img src="../assets/help-circle.png" alt="help"
           class="switches"
           @click="showHelp = true;">
      <img class="switches" alt="languages" @click="language = language==='cn'?'en':'cn'"
           :src="this.getLanguageIcon()" style="padding: 5px">
      <img class="switches" alt="mute" @click="switchMute()"
           :src="this.getMuteIcon()" style="padding: 5px">
      <img class="switches" alt="restart" @click="restartDialog=true;"
           src="../assets/refresh.png" style="padding: 5px">
    </v-col>

    <div id="collection_progress"
         style="position: fixed; right: 5%; top:85%;z-index: 5;background: #ffffff;text-align: center; font-family: Chinese_pixel,serif;padding: 0.2rem 1.5rem;"
         class="nes-container is-rounded elevation-10"
    >
      <p>{{ Object.values(duckStates).filter(_ => _.isFound).length }}/10</p>
    </div>

    <!--    qr scanner-->
    <v-dialog
        v-model="scanning"
        hide-overlay
        fullscreen
        transition="dialog-bottom-transition"
    >
      <img class="switches" alt="mute" @click="scanning=false" src="../assets/close.png"
           style="position: absolute; right: 5%; top: 3%; z-index: 5">
      <qrcode-stream :key="_uid" @decode="onDecode"></qrcode-stream>
    </v-dialog>

    <!--    help-->
    <v-dialog
        v-model="showHelp"
        hide-overlay
        style="background: transparent"
        fullscreen
        transition="dialog-bottom-transition"
    >
      <v-card
          class="mx-2 nes-container is-rounded"
          color="#ffffffff"
          height="95%"
          width="95%"
          style="padding: 5%; margin: 3%"
          elevation="10"
          alignment="center"
      >
        <img class="switches" alt="mute" @click="showHelp=false" src="../assets/close.png"
             style="position: absolute; right: 5%; top: 3%; z-index: 5">
        <v-card-title>
          <h3 style="font-family: Chinese_pixel, serif; margin-top: 50px; margin-right: 80px;">
            {{ helpText.title[language] }}
          </h3>
        </v-card-title>
        <v-card-text class="font-weight-bold text-left"
                     v-html="buildHelpText()"
                     style="background: #ffffff; width: 100%;height: 72%;font-size: medium;font-family: Chinese_pixel, serif; overflow-y: scroll;"></v-card-text>
      </v-card>
    </v-dialog>

    <!--    restart game dialog-->
    <v-dialog
        v-model="restartDialog"
        style="background: transparent"
        hide-overlay
    >
      <v-card>
        <v-card-title style="font-family: Chinese_pixel,serif"
                      v-html="language === 'cn' ? '<h3>重启游戏</h3>' : '<h3>Restart game</h3>'">
        </v-card-title>

        <v-card-text style="font-family: Chinese_pixel,serif">
          {{
            language === "cn" ?
                "你希望清除记录，重启游戏吗？不可恢复" :
                "Do you wish to restart game and clear your data? This is irrevocable."
          }}
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
              class="nes-btn primary"
              style="font-family: Chinese_pixel,serif"
              @click="restartDialog = false"
          >Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
              class="nes-btn error"
              style="font-family: Chinese_pixel,serif"
              @click="restartGame()"
          >Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    duck card-->
    <v-dialog
        v-model="duckCardDialog"
        style="background: transparent"
        hide-overlay
        height="90%"
        v-if="shownDuck != null"
    >
      <v-card
          class="mx-2 nes-container is-rounded"
          color="#ffffffff"
          height="380px"
          width="95%"
          style="margin-top: 150px; padding: 0"
          elevation="10"
          alignment="center"
      >
        <v-img :src="bigImage(shownDuck.duckIconUrl)"
               style="position: absolute; left: 50%; transform: translateX(-50%); top: -120px;" width="150px"
               :aspect-ratio="1"></v-img>
        <i @click="duckCardDialog=false" class="nes-icon close" style="position: absolute; right: 10px; top: 10px"></i>
        <v-card-title>
          <h3 style="font-family: Chinese_pixel, serif; margin-top: 10px">
            {{ shownDuck.title[language] }}
          </h3>
        </v-card-title>
        <v-card-text class="font-weight-bold text-left"
                     v-html="getStory(shownDuck)"
                     style="background: #ffffff; width: 100%;height: 72%;font-size: medium;font-family: Chinese_pixel, serif; overflow-y: scroll;"></v-card-text>
      </v-card>
    </v-dialog>
    <div id="map" class="no-whitespace unselectable" style="height: max-content; width: max-content;">
      <div class="no-whitespace unselectable" style="height: 2044px; width: 3267px;">
        <v-img src="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/map.png" alt="map"
               style="height: 2044px; width: 3267px; padding: 0; margin: 0"></v-img>
      </div>
      <v-img
          :src="duck.info.duckIconUrl"
          @click="duckClicked(duck)"
          :style="{'position': 'absolute', 'left': duck.coordinate.x, 'top': duck.coordinate.y}"
          v-for="duck in Object.values(duckStates).filter(_ => (!_.isHidden) || _.isFound)"
          :key="duck.id"
          height="64px"
          width="64px"
      ></v-img>
    </div>
  </div>
</template>

<script>
import Panzoom from "@panzoom/panzoom"
import axios from "axios"
import {QrcodeStream} from 'vue-qrcode-reader'

const china = require("@/assets/china.png");
const uk = require("@/assets/united-kingdom.png");
const sound = require("@/assets/sound.png");
const mute = require("@/assets/mute.png");
const help = require("@/assets/help.json");
const bgm = [
  "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/bgm2.mp3",
  "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/bgm1.mp3",
  "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/bgm3.mp3",
];
let current_bgm = 0;
const bgmPlayer = new Audio(bgm[current_bgm]);
bgmPlayer.addEventListener("ended", () => {
  // load next bgm
  current_bgm = (current_bgm + 1) % bgm.length;
  bgmPlayer.src = bgm[current_bgm];
  bgmPlayer.load();
  bgmPlayer.play();
})

export default {
  name: 'HelloWorld',
  components: {
    QrcodeStream
  },
  props: {},
  data() {
    return {
      panzoom: null,
      duckCardDialog: false,
      showHelp: false,
      shownDuck: null,
      duckStates: {},
      scanning: false,
      language: 'cn',
      restartDialog: false,
      helpText: help,
      mute: false,
    }
  },
  async mounted() {
    const elem = document.getElementById('map');
    this.panzoom = Panzoom(elem, {
      // disableZoom: true,
      canvas: true,
      animate: true,
      panOnlyWhenZoomed: false,
      minScale: 0.5,
      maxScale: 1.0,
      startScale: 0.8,
      startX: -900,
      startY: -300,
      contain: 'outside'
    });

    await this.loadPreview();

    // auto play attempt
    let playAttempt = setInterval(() => {
      if (this.mute) {
        clearInterval(playAttempt)
      } else {
        bgmPlayer.play().then(() => {
          clearInterval(playAttempt)
        }).catch(() => {
          console.log("Unable to play bgm, User has not interacted yet.");
        });
      }
    }, 1000);

    const params = this.$route.params;
    if ("id" in params) {
      await this.scanDuck(params.id);
    } else {
      await this.fetchBackendApi("https://sso.forkingpark.cn/api/user-info");
    }
  },
  methods: {
    // scanning duck in two ways
    async scanDuck(duckId) {
      await this.fetchBackendApi("https://sso.forkingpark.cn/api/find-duck/" + duckId);
      this.duckClicked(Object.values(this.duckStates).find(d => d.info.id === duckId));
    },

    async restartGame() {
      try {
        await axios.delete(
            "https://sso.forkingpark.cn/api/user-info",
            {withCredentials: true}
        );
        this.duckStates = {};
        await this.loadPreview();
        await this.fetchBackendApi("https://sso.forkingpark.cn/api/user-info");
      } finally {
        this.restartDialog = false;
      }
    },

    // when duck gets clicked
    duckClicked(duck) {
      this.duckCardDialog = true
      this.shownDuck = duck.info
      if (!this.mute) {
        if (duck.isFound) {
          const sound = new Audio("https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/found-duck.m4a");
          sound.play();
        } else {
          const sound = new Audio("https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/unknown-duck.m4a");
          sound.play();
        }
      }
    },

    switchMute() {
      this.mute = !this.mute;
      if (this.mute) {
        bgmPlayer.pause();
      } else {
        bgmPlayer.play();
      }
    },

    // loading preview before fetching user info
    async loadPreview() {
      const duckList = await axios.get("https://sso.forkingpark.cn/api/preview-ducks");

      // load ducks from the preview-duck, only the found ducks have detailed info
      duckList.data.forEach(
          (duck) => {
            this.duckStates[duck.location.id] = {
              id: duck.location.id,
              isFound: false,
              isHidden: duck.isHidden,
              coordinate: duck.location.coordinate,
              info: {
                duckIconUrl: 'https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/unknown.png',
                story: {
                  cn: '来找我玩鸭，我在：' + duck.location.description.cn,
                  en: 'Come and see me. I am at ' + duck.location.description.en
                },
                title: {
                  cn: '未知鸭子',
                  en: 'unknown duck'
                }
              }
            }
          }
      );
      this.$forceUpdate();
    },

    async onInit(promise) {
      try {
        await promise
        // successfully initialized
      } finally {
        // close scanner on error
        this.scanning = false;
      }
    },

    // fetch backend api or redirect to login
    async fetchBackendApi(url) {
      try {
        const response = await axios.get(
            url,
            {withCredentials: true}
        );
        response.data.duckHistory.map(d => d.duck).forEach((duck) => {
          this.duckStates[duck.location.id].isFound = true;
          this.duckStates[duck.location.id].info = duck;
        });
        this.$forceUpdate();
      } catch (e) {
        // on 401 error, go to login page
        if (e.response && e.response.status === 401) {
          const current_url = window.location.href;
          window.location.href = "https://sso.forkingpark.cn/login?redirect_url=" + current_url;
        } else if (e.response && e.response.status === 404) {
          console.error("404 not found: " + e);
          window.location.href = "https://duck.forkingpark.cn";
        } else {
          console.error("unexpected error: " + e);
        }
      }
    },

    // helper function to rename icon with '3x-' prefix
    bigImage(url) {
      const splits = url.split("/");
      const name = "3x-" + splits.pop();
      splits.push(name);
      return splits.join("/");
    },

    //  get language icon based on language state
    getLanguageIcon() {
      return this.language === 'cn' ? china : uk;
    },

    // get mut icon based on mute state
    getMuteIcon() {
      return this.mute ? mute : sound;
    },

    // on QR-code detection
    async onDecode(code) {
      const prefix = "https://duck.forkingpark.cn/duck/";
      if (code.startsWith(prefix)) {
        const duckId = code.substring(prefix.length);
        this.scanning = false;
        await this.scanDuck(duckId);
      }
    },

    buildHelpText() {
      let text = "";
      text += this.language === "cn" ? "<h3>怎么玩</h3>" : "<h3>How to play</h3>"
      text += help.abstract[this.language]
      text += this.language === "cn" ? "<h3>展览介绍</h3>" : "<h3>Intro</h3>"
      text += help.sign[this.language]
      return text;
    },

    // compose the story html based on database content
    getStory(shownDuck) {
      let story = shownDuck.story[this.language];
      // hint next location
      const nextDuckStory = shownDuck.nextDuckStory;
      if (nextDuckStory) {
        const nextLocation = nextDuckStory.location.description[this.language];
        story = story.replace("xxx", nextLocation);
      }
      // add exhibit info
      const relatedExhibit = shownDuck.relatedExhibit;
      if (relatedExhibit) {
        if (this.language === "cn") {
          story += "<br /><br />相关展品：";
          story += relatedExhibit.title[this.language];
          story += "<br />展品位置：";
          story += relatedExhibit.location[this.language];
        } else {
          story += "<br /><br />Related Exhibit：";
          story += relatedExhibit.title[this.language];
          story += "<br />Exhibit Location：";
          story += relatedExhibit.location[this.language];
        }
      }
      return story;
    }
  }
}
</script>

<style scoped>
html * {
  font-family: Chinese_pixel, !important;
}

.no-whitespace {
  margin: 0;
  padding: 0;
}

.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.full-screen {
  width: 100vm;
  height: 100vm;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.switches {
  height: 48px;
  width: 48px;
  filter: drop-shadow(2px 2px 2px gray);
  elevation: above;
  image-rendering: pixelated
}

@font-face {
  font-family: "Chinese_pixel";
  src: url("https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/Chinese_pixel.ttf");
}
</style>
