<template>
  <div
      class="no-whitespace unselectable full-screen"
  >
    <img src="../assets/scan.svg" alt="help"
         style="position: absolute; z-index: 5; top: 3%; left: 5%;"
         class="switches"
         @click="scanning = true"
         @init="onInit"
    >
    <v-col style="position: absolute; z-index: 5; top: 3%; right: 5%; width: 48px; margin: 0; padding: 0">
      <img src="../assets/questionmark.svg" alt="help"
           class="switches"
           @click="showHelp = true;">
      <img class="switches" alt="languages" @click="language = language==='cn'?'en':'cn'"
           :src="this.getLanguageIcon()">
      <img class="switches" alt="mute" @click="switchMute()"
           :src="this.getMuteIcon()">
      <img class="switches" alt="restart" @click="restartDialog=true;"
           src="../assets/refresh.svg">
    </v-col>

    <div id="collection_progress"
         class="nes-container is-rounded elevation-10 collection-progress"
         @click="showDuckList=true"
    >
      <p>{{ Object.values(duckStates).filter(_ => _.isFound).length }}/{{ Object.values(duckStates).length }}</p>
    </div>

    <!--    qr scanner-->
    <v-dialog
        v-model="scanning"
        hide-overlay
        fullscreen
        transition="dialog-bottom-transition"
    >
      <img class="switches" alt="mute" @click="scanning=false" src="../assets/close.svg"
           style="position: absolute; right: 5%; top: 3%; z-index: 5;">
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
        <img class="switches" alt="mute" @click="showHelp=false" src="../assets/close.svg"
             style="position: absolute; right: 5%; top: 3%; z-index: 5;">
        <v-card-title>
          <h3 style="font-family: Chinese_pixel, serif; padding-top: 0; margin-top: 3%; margin-right: 80px;">
            {{ helpText.title[language] }}
          </h3>
        </v-card-title>
        <v-card-text class="font-weight-bold text-left help" v-html="buildHelpText()"></v-card-text>
      </v-card>
    </v-dialog>

    <!--    duck list-->
    <v-dialog
        v-model="showDuckList"
        hide-overlay
        fullscreen
        transition="dialog-bottom-transition"
        style="margin: 0; padding: 0"
    >
      <div class="fill-height unselectable no-whitespace">
        <v-layout column class="fill-height unselectable"
                  style="background-color:white;padding: 0 0 10px;max-width: none">
          <v-flex class="flex shrink unselectable">
            <h3 class="col-10 unselectable"
                style="font-family: Chinese_pixel, serif; font-size: xx-large; margin-left: 10px; margin-top: 3%; padding-top: 5px; margin-right: 50px;">
              {{ language === 'cn' ? "鸭鸭家族" : "The Duck Family" }}
            </h3>
            <img class="switches" alt="mute" @click="showDuckList=false" src="../assets/close.svg"
                 style="position: absolute; right: 5%; top: 3%; z-index: 5;">
          </v-flex>
          <v-flex
              class="white flex"
              style="padding-left: 10px; padding-right: 20px; text-align: center; overflow-y: scroll; overflow-x: clip"
          >
            <v-container
                class="nes-container is-rounded col-12 col-sm-5"
                v-for="duck in Object.values(duckStates)"
                :key="'duck-list-item' + duck.id"
                style="margin: 5px; padding: 5px; display:inline-block"
            >
              <v-row style="height: 60px" @click="showDuckIfNotHidden(duck)">
                <v-col class="col-3">
                  <v-img
                      :src="bigImage(duck.info.duckIconUrl)"
                      :key="'duck-profile' + duck.id"
                      style="image-rendering: pixelated"
                      height="50px"
                      width="50px"
                  ></v-img>
                </v-col>
                <v-col class="col-9"
                       style="text-align: left; padding: 20px; font-family: Chinese_pixel, serif; font-size: large">
                  {{
                    (duck.isHidden && !duck.isFound) ?
                        (language === "cn" ? "隐藏鸭" : "Hidden Duck")
                        : duck.info.title[language]
                  }}
                </v-col>
              </v-row>
            </v-container>
          </v-flex>
        </v-layout>
      </div>
    </v-dialog>

    <!--    restart game dialog-->
    <v-dialog
        v-model="restartDialog"
        style="background: transparent; padding: 10px; margin: 0"
        hide-overlay
    >
      <v-card
          class="nes-container is-rounded"
          color="#ffffffff"
          elevation="10"
          style="left: 50%; transform: translateX(-50%); width: 250px; padding: 5px; margin: 5px"
      >
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
          :height="shownDuck.title.cn === '未知鸭子' ? '200px' : '380px'"
          width="95%"
          style="margin-top: 150px; padding: 0"
          elevation="10"
          alignment="center"
      >
        <v-img :src="bigImage(shownDuck.duckIconUrl)"
               style="position: absolute; left: 50%; transform: translateX(-50%); top: -120px; image-rendering: pixelated"
               width="150px"
               :aspect-ratio="1"></v-img>
        <i @click="duckCardDialog=false" class="nes-icon close" style="position: absolute; right: 10px; top: 10px"></i>
        <v-card-title>
          <h3 style="font-family: Chinese_pixel, serif; margin-top: 10px">
            {{ shownDuck.title[language] }}
          </h3>
        </v-card-title>
        <v-card-text class="font-weight-bold text-left"
                     v-html="getStory(shownDuck)"
                     style="background: #ffffff; width: 100%;font-size: medium;font-family: Chinese_pixel, serif; overflow-y: scroll;"
                     :style="shownDuck.title.cn === '未知鸭子' ? 'height: 50%' : 'height: 72%'"
        ></v-card-text>
      </v-card>
    </v-dialog>
    <div id="map" class="no-whitespace unselectable" style="height: max-content; width: max-content;">
      <div class="no-whitespace unselectable" style="height: 2044px; width: 3267px;">
        <v-img src="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/map.jpg" alt="map"
               style="height: 2044px; width: 3267px; padding: 0; margin: 0; position: absolute; left: 0; top: 0"></v-img>
      </div>
      <v-img
          :src="duck.info.duckIconUrl"
          @click="duckClicked(duck)"
          :style="{'left': duck.coordinate.x, 'top': duck.coordinate.y}"
          v-for="duck in Object.values(duckStates).filter(_ => (!_.isHidden) || _.isFound)"
          :key="duck.id"
          :height="Math.round(64 / panzoom.getScale()).toString() + 'px'"
          :width="Math.round(64 / panzoom.getScale()).toString() + 'px'"
          style="image-rendering: pixelated; position: absolute; transform: translate(-50%, -50%)"
      ></v-img>
    </div>
  </div>
</template>

<script>
import Panzoom from "@panzoom/panzoom"
import axios from "axios"
import {QrcodeStream} from 'vue-qrcode-reader'

const china = require("@/assets/cn.svg");
const uk = require("@/assets/en.svg");
const sound = require("@/assets/vol.svg");
const mute = require("@/assets/voldown.svg");
const help = require("@/assets/help.json");
const bgm = [
  "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/bgm2.mp3",
  "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/bgm1.mp3",
  "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/bgm3.mp3",
];
let current_bgm = 0;
const bgmPlayer = new Audio(bgm[current_bgm]);
const [mapWidth, mapHeight] = [3267, 2044];
const [startX, startY] = [2705, 1046];
const zoomScale = 0.6;
bgmPlayer.addEventListener("ended", () => {
  // load next bgm
  current_bgm = (current_bgm + 1) % bgm.length;
  bgmPlayer.src = bgm[current_bgm];
  bgmPlayer.load();
  bgmPlayer.play();
})

function computePan(mapX, mapY, scale) {
  const halfWindowSize = [window.innerWidth / 2, window.innerHeight / 2];
  const halfMapSize = [mapWidth / 2, mapHeight / 2];
  return {
    x: -halfMapSize[0] / scale * (1 - scale) + halfWindowSize[0] / scale - mapX,
    y: -halfMapSize[1] / scale * (1 - scale) + halfWindowSize[1] / scale - mapY,
  }
}

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
      showDuckList: false,
      language: 'cn',
      restartDialog: false,
      helpText: help,
      mute: false,
    }
  },
  async mounted() {
    const elem = document.getElementById('map');
    const startPos = computePan(startX, startY, zoomScale);
    let defaultStart = {
      x: startPos.x,
      y: startPos.y,
      scale: zoomScale,
    };
    const map_transform = localStorage.getItem("PANZOOM");
    if (map_transform) {
      defaultStart = JSON.parse(map_transform);
    }
    this.panzoom = Panzoom(elem, {
      // disableZoom: true,
      canvas: true,
      animate: true,
      panOnlyWhenZoomed: false,
      minScale: 0.5,
      maxScale: 1.0,
      startScale: zoomScale,
      startX: defaultStart.x,
      startY: defaultStart.y,
      disableZoom: true,
      contain: 'outside'
    });

    // remember last time position

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

    // log transform string
    setInterval(() => {
      this.queryMapTransform();
    }, 500);
  },
  methods: {
    // scanning duck in two ways
    async scanDuck(duckId) {
      await this.fetchBackendApi("https://sso.forkingpark.cn/api/find-duck/" + duckId);
      const duck = Object.values(this.duckStates).find(d => d.info.id === duckId);
      this.moveMapToDuck(duck);
      this.duckClicked(duck);
    },

    // show duck position only if duck is not hidden or has been found
    showDuckIfNotHidden(duck) {
      if (!duck.isHidden || duck.isFound) {
        this.showDuckList = false;
        this.moveMapToDuck(duck);
      }
    },

    moveMapToDuck(duck) {
      const mapX = parseInt(duck.coordinate.x.slice(0, -2));
      const mapY = parseInt(duck.coordinate.y.slice(0, -2));
      const panPosition = computePan(mapX, mapY, zoomScale);
      this.panzoom.pan(panPosition.x, panPosition.y);
    },

    async restartGame() {
      try {
        await axios.delete(
            "https://sso.forkingpark.cn/api/user-info",
            {withCredentials: true}
        );
        this.duckStates = {};
        localStorage.clear();
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

    queryMapTransform() {
      const {x, y} = this.panzoom.getPan();
      const scale = this.panzoom.getScale();
      const panzoomData = {
        x: x,
        y: y,
        scale: scale,
      };
      localStorage.setItem("PANZOOM", JSON.stringify(panzoomData));
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
      return this.language === 'cn' ? uk : china;
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
          story += "<v-divider></v-divider>";
          story += "<br />展品位置：";
          story += relatedExhibit.location[this.language];
        } else {
          story += "<br /><br />Related Exhibit：";
          story += relatedExhibit.title[this.language];
          story += "<v-divider></v-divider>";
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
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
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
  /*filter: drop-shadow(2px 2px 2px gray);*/
  elevation: above;
  image-rendering: pixelated;
  padding: 5px;
}

.collection-progress {
  position: fixed;
  right: 5%;
  top: 85%;
  z-index: 5;
  background: #ffffff;
  text-align: center;
  font-family: Chinese_pixel, serif;
  font-weight: bolder;
  padding: 0.2rem 1.5rem;
}

.help {
  background: #ffffff;
  width: 100%;
  height: 72%;
  font-size: medium;
  line-height: 2rem;
  font-family: Chinese_pixel, serif;
  overflow-y: scroll;
}

@font-face {
  font-family: "Chinese_pixel";
  src: url("https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/Chinese_pixel.ttf");
}
</style>
