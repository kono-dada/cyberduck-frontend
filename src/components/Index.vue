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
           onclick="">
      <img class="switches" alt="languages" @click="language = language==='cn'?'en':'cn'"
           :src="this.getLanguageIcon()" style="padding: 5px">
      <img class="switches" alt="mute" @click="mute = !mute"
           :src="this.getMuteIcon()" style="padding: 5px">
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
      <i @click="scanning=false" class="nes-icon close" style="position: absolute; right: 10px; top: 10px; z-index: 5"></i>
      <qrcode-stream :key="_uid" @decode="onDecode"></qrcode-stream>
    </v-dialog>

    <!--    duck card-->
    <v-dialog
        v-model="dialog"
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
        <i @click="dialog=false" class="nes-icon close" style="position: absolute; right: 10px; top: 10px"></i>
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

const unknownDuck = require("@/assets/unknown-duck.mp3");
const foundDuck = require("@/assets/found-duck.mp3");
const china = require("@/assets/china.png");
const uk = require("@/assets/united-kingdom.png");
const sound = require("@/assets/sound.png");
const mute = require("@/assets/mute.png");

export default {
  name: 'HelloWorld',
  components: {
    QrcodeStream
  },
  props: {},
  data() {
    return {
      panzoom: null,
      dialog: false,
      shownDuck: null,
      duckStates: {},
      scanning: false,
      language: 'cn',
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

    // when duck gets clicked
    duckClicked(duck) {
      this.dialog = true
      this.shownDuck = duck.info
      if (!this.mute) {
        if (duck.isFound) {
          const sound = new Audio(foundDuck);
          sound.play();
        } else {
          const sound = new Audio(unknownDuck);
          sound.play();
        }
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
