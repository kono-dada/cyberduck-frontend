<template>
  <div
      class="no-whitespace unselectable full-screen"
  >
    <img :src="scanIcon()" alt="scan"
         style="position: absolute; z-index: 5; top: 3%; left: 5%;"
         class="switches"
         @click="scanning = true"
    >
    <v-col style="position: absolute; z-index: 5; top: 3%; right: 5%; width: 48px; margin: 0; padding: 0">
      <img :src="questionMarkIcon()" alt="help"
           class="switches" @click="showHelp = true;">
      <img class="switches" alt="languages" @click="language = language==='cn'?'en':'cn'"
           :src="this.getLanguageIcon()">
      <img class="switches" alt="mute" @click="switchMute()"
           :src="this.getMuteIcon()">
      <img class="switches" alt="restart" @click="restartDialog=true;"
           :src="this.refreshIcon()">
      <a href="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/qrduck.jpg">
        <img class="switches" alt="share" :src="shareIcon()">
      </a>
    </v-col>

    <div id="collection_progress"
         class="nes-container is-rounded collection-progress"
         :style="{backgroundColor: Object.values(duckStates).filter(_ => _.isFound).length === Object.values(duckStates).length ? '#fef251' : '#ffffff'}"
         @click="showDuckListTrue()"
    >
      <p>{{ Object.values(duckStates).filter(_ => _.isFound).length }}/{{ Object.values(duckStates).length }}</p>
    </div>

    <!--    qr scanner-->
    <v-dialog
        v-model="scanning"
        fullscreen
        transition="dialog-bottom-transition"
    >
      <img id="scanClose" class="switches" alt="close" @click="scanning=false" :src="closeIcon()"
           style="position: absolute; right: 5%; top: 3%; z-index: 5; display: none">
      <img id="scanDuck" class="switches" alt="happyDuck" :src="happyDuckIcon()" @click="refreshDuckPosition()"
           style="position: absolute; z-index: 5; transform: translate(-50%, -50%); display: none"
           :style="happyDuckPosition">
      <qrcode-stream :key="_uid" v-if="scanning" @decode="onDecode" @init="onInit"></qrcode-stream>
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
        <img class="switches" alt="close" @click="showHelp=false" :src="closeIcon()"
             style="position: absolute; right: 5%; top: 3%; z-index: 5;">
        <v-card-title>
          <h3 style="font-family: Chinese_pixel, serif; padding-top: 0; margin-top: 3%; margin-right: 80px;">
            {{ helpText.title[language] }}
          </h3>
        </v-card-title>
        <v-card-text class="font-weight-bold text-left help" v-html="buildHelpText()"></v-card-text>
      </v-card>
    </v-dialog>

    <!--    ranking display-->
    <v-dialog
        v-model="showRanking"
    >
      <v-card
          style="text-align: center; padding: 3%"
          class="mx-2 nes-container is-rounded"
          width="95%"
      >
        <img class="switches" alt="close" @click="showRanking=false;showDuckList=true;" :src="closeIcon()"
             style="position: absolute; right: 5%; top: 3%; z-index: 5;">
        <img
            src="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/ducking.png"
            style="position: absolute; left: 50%; transform: translateX(-50%); top: 20px; image-rendering: pixelated"
            alt="duck-king"
        >
        <v-card-subtitle style="position: relative; margin-top: 275px; line-height: 2rem; text-align: center">
          <h2>{{ language === 'cn' ? '鸭鸭之友' : 'Duck Collector' }}</h2>
        </v-card-subtitle>
        <v-card-text style="text-align: center">
          <p style="font-size: larger">
            {{ language === 'cn' ? '恭喜你' : 'Congratulations!' }}
            <br/>
            {{ language === 'cn' ? "成为第 " : "You are the " }}
            <span style='font-size: xx-large; font-weight: bolder; transform-origin: center'>
              {{ language === 'cn' ? '' + userRanking : '#' + userRanking }}
            </span>
            {{ language === 'cn' ? "集齐鸭鸭故事的人" : " person to have heard all duck stories." }}
          </p>
        </v-card-text>
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
      <div class="full-screen unselectable no-whitespace">
        <v-layout column class="fill-height unselectable"
                  style="background-color:white;padding: 0 0 10px;max-width: none">
          <v-flex class="flex shrink unselectable">
            <h3 class="col-10 unselectable"
                style="font-family: Chinese_pixel, serif; font-size: xx-large; margin-left: 10px; margin-top: 3%; padding-top: 5px; margin-right: 50px;">
              {{ language === 'cn' ? "鸭鸭家族" : "The Duck Family" }}
            </h3>
            <img class="switches" alt="close" @click="showDuckList=false" :src="closeIcon()"
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
                style="margin: 10px 5px;padding: 5px; display:inline-block"
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
                "Do you wish to restart the game and clear your data? This is irrevocable."
          }}
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
              class="nes-btn primary"
              style="font-family: Chinese_pixel,serif; padding: 2px"
              @click="restartDialog = false"
          >{{ language === 'cn' ? '取消' : 'Cancel' }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
              class="nes-btn error"
              style="font-family: Chinese_pixel,serif; padding: 2px"
              @click="restartGame()"
          >{{ language === 'cn' ? '确认' : 'Confirm' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    duck card-->
    <v-dialog
        v-model="duckCardDialog"
        height="90%"
        v-if="shownDuck != null"
    >
      <v-card
          class="mx-2 nes-container is-rounded"
          color="#ffffffff"
          :height="duckCardPositioning.height"
          width="95%"
          style="margin-top: 130px; padding: 0"
          elevation="10"
          alignment="center"
      >
        <v-img :src="bigImage(shownDuck.duckIconUrl)"
               style="position: absolute; left: 50%; transform: translateX(-50%); top: -120px; image-rendering: pixelated"
               width="150px"
               :aspect-ratio="1"></v-img>
        <i @click="duckCardDialog=false" class="nes-icon close is-small"
           style="position: absolute; right: 10px; top: 10px; transform-origin: right top; transform: scale(1.5)"></i>
        <v-card-title>
          <h4 style="font-family: Chinese_pixel, serif; padding-top: 10px" id="duck-card-title">
            {{ shownDuck.title[language] }}
          </h4>
        </v-card-title>
        <v-card-text class="font-weight-bold text-left"
                     v-html="getStory(shownDuck)"
                     style="background: #ffffff; width: 100%;font-size: medium;font-family: Chinese_pixel, serif; overflow-y: scroll;"
                     :style="{'height': duckCardTextHeight.height+'px'}"
        ></v-card-text>
      </v-card>
    </v-dialog>
    <div id="map" class="no-whitespace unselectable" style="height: max-content; width: max-content;">
      <div class="no-whitespace unselectable" style="height: 2044px; width: 3267px;">
        <v-img src="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/map.png" alt="map"
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
import close from "@/assets/close.svg";
import china from "@/assets/cn.svg";
import uk from "@/assets/en.svg";
import sound from "@/assets/vol.svg";
import mute from "@/assets/voldown.svg";
import scan from "@/assets/scan.svg";
import refresh from "@/assets/refresh.svg";
import questionMark from "@/assets/questionmark.svg";
import help from "@/assets/help.json";
import share from "@/assets/share.svg";
import happyDuck from "@/assets/happyDuck.gif";
import foundDuck from "@/assets/found-duck.mp3";
import unknownDuck from "@/assets/unknown-duck.mp3";

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
    QrcodeStream,
  },
  props: {},
  computed: {
    happyDuckPosition() {
      return "left: " + this.happyDuckPos[0] + "px;" + "top: " + this.happyDuckPos[1] + "px;";
    },
    duckCardPositioning() {
      const height = Math.max(Math.min(Math.round(this.windowHeight * 0.85) - 230 - 15, 500), 200);
      const width = Math.min(Math.round(this.windowWidth * 0.90) - 16, 500 - 16);
      const left = (this.windowWidth - width - 16) / 2;
      const topRemaining = this.windowHeight * 0.85 - height - 130 - 15;
      const top = topRemaining > 100 ? (this.windowHeight - height - 130 - 15) / 2 : topRemaining;
      return {
        left: left,
        top: top,
        width: width,
        height: height,
      };
    },
    duckCardTextHeight() {
      const cardHeight = Math.max(Math.min(Math.round(this.windowHeight * 0.85) - 230 - 15, 500), 200);
      const containerWidth = Math.min(Math.round(this.windowWidth * 0.90) - 16, 500 - 16);
      const margin = 10;
      const titleHeight = 76;
      const width = containerWidth - margin * 2;
      const textHeight = cardHeight - 8 - titleHeight - 20;
      return {
        width: width,
        height: textHeight,
        margin: margin,
      };
    },
  },
  data() {
    return {
      panzoom: null,
      duckCardDialog: false,
      showHelp: false,
      shownDuck: null,
      duckStates: {},
      userRanking: null,
      scanning: false,
      showRanking: false,
      showDuckList: false,
      language: 'cn',
      restartDialog: false,
      helpText: help,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      happyDuckPos: this.randomHappyDuckPosition(),
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
      await this.fetchBackendApi("https://cyberduck-backend.sunneversets.cn/api/user-info");
    }

    // log transform string
    setInterval(() => {
      this.queryMapTransform();
    }, 500);

    window.addEventListener('resize', () => {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
    })
  },
  methods: {
    // scanning duck in two ways
    async scanDuck(duckId) {
      await this.fetchBackendApi("https://cyberduck-backend.sunneversets.cn/api/find-duck/" + duckId);
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

    showDuckListTrue() {
      const states = Object.values(this.duckStates);
      const foundCount = states.filter(_ => _.isFound).length;
      const total = states.length;
      if (this.userRanking && foundCount === total) {
        this.showRanking = true;
      } else {
        this.showDuckList = true;
      }
    },

    closeIcon() {
      return close;
    },

    scanIcon() {
      return scan;
    },

    refreshIcon() {
      return refresh;
    },

    shareIcon() {
      return share;
    },

    questionMarkIcon() {
      return questionMark;
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
            "https://cyberduck-backend.sunneversets.cn/api/user-info",
            {withCredentials: true}
        );
        this.duckStates = {};
        localStorage.clear();
        await this.loadPreview();
        await this.fetchBackendApi("https://cyberduck-backend.sunneversets.cn/api/user-info");
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
          this.playFoundDuckSound();
        } else {
          this.playUnknownDuckSound();
        }
      }
    },

    playFoundDuckSound() {
      const sound = new Audio(foundDuck);
      sound.play();
    },

    playUnknownDuckSound() {
      const sound = new Audio(unknownDuck);
      sound.play();
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
      const duckList = await axios.get("https://cyberduck-backend.sunneversets.cn/api/preview-ducks");

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
        document.getElementById("scanClose").style.display = "inline-block";
        document.getElementById("scanDuck").style.display = "inline-block";
        // successfully initialized
      } catch (e) {
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
        if (response.data.ranking) {
          this.userRanking = response.data.ranking.ranking;
        }
        this.$forceUpdate();
      } catch (e) {
        // on 401 error, go to login page
        if (e.response && e.response.status === 401) {
          const current_url = window.location.href;
          window.location.href = "https://cyberduck-backend.sunneversets.cn/login?redirect_url=" + current_url;
        } else if (e.response && e.response.status === 404) {
          console.error("404 not found: " + e);
          window.location.href = "https://cyberduck.sunneversets.cn";
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

    happyDuckIcon() {
      return happyDuck;
    },

    refreshDuckPosition() {
      this.playFoundDuckSound();
      this.happyDuckPos = this.randomHappyDuckPosition();
    },

    randomHappyDuckPosition() {
      const topMost = 0.05 * window.innerHeight + 60;
      const bottomMost = window.innerHeight - 50;
      const leftMost = 50;
      const rightMost = window.innerWidth - 50;
      const randX = Math.random();
      const randY = Math.random();
      const x = randX * leftMost + (1 - randX) * rightMost;
      const y = randY * topMost + (1 - randY) * bottomMost;
      return [x, y];
    },

    // on QR-code detection
    async onDecode(code) {
      const prefix = "https://cyberduck.sunneversets.cn/duck/";
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
      text += ("<div style='margin-bottom: 10px'><a href='https://mp.weixin.qq.com/s/aW2I3r1D8SVhBtJJRDcgiA'>"
          + (this.language === "cn" ? "<u>点我查看更多</u>" : "<u>Click me for more</u>")
          + "</a></div>")
      text += help.thanks[this.language]
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

.help {
  background: #ffffff;
  width: 100%;
  height: 72%;
  font-size: medium;
  line-height: 2rem;
  font-family: Chinese_pixel, serif;
  overflow-y: scroll;
}

.collection-progress {
  position: fixed;
  right: 5%;
  top: 85%;
  z-index: 5;
  text-align: center;
  font-family: Chinese_pixel, serif;
  font-weight: bolder;
  padding: 0.2rem 1.5rem;
}

@font-face {
  font-family: "Chinese_pixel";
  src: url("https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/Chinese_pixel.ttf");
}

@keyframes darken {
  from {
    background-color: rgba(0, 0, 0, 0);
  }
  to {
    background-color: rgba(0, 0, 0, 0.5);
  }
}
</style>
