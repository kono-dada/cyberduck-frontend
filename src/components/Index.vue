<template>
  <div>
    <v-row style="position: absolute; top: 5%;z-index: 5;left: 0;padding: 0; width: 90%" class="mx-5">
      <v-btn id="language"
             elevation="10"
             style="background: #ffffff;text-align: center; font-family: Chinese_pixel,serif; width: 90px;font-size: small"
             class="nes-container is-rounded"
             @click="language = language==='cn'?'en':'cn'; languagePrompt = language==='cn'?'English':'中文'"
      >
        {{ languagePrompt }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon color="#eebb00" fab x-small dark elevation="10" style="" class="mt-1">
        <v-icon x-large>
          mdi-help-circle
        </v-icon>
      </v-btn>
    </v-row>

    <div id="collection_progress"
         style="position: fixed; right: 5%; top:85%;z-index: 5;background: #ffffff;text-align: center; font-family: Chinese_pixel,serif;padding: 0.2rem 1.5rem;"
         class="nes-container is-rounded elevation-10"
    >
      <p>1/10</p>
    </div>
    <v-dialog
        v-model="dialog"
        width="80vm"
        style="background: transparent"
        hide-overlay
        v-if="shownDuck != null"
        persistent
    >
      <div style="max-height: 490px">
        <v-row style="height: 81px"></v-row>
        <v-card
            class="mx-2 nes-container is-rounded"
            color="#ffffffff"
            height="400px"
            max-height="400px"
            elevation="10"
            align="center"
        >
          <v-row style="height: 81px;position:absolute;width: 100%;padding: 0;left: 0" align="center" class="ma-0">
            <v-col>
              <v-img :src="bigImage(shownDuck.duckIconUrl)"
                     style=" top: -100px;" width="150px" :aspect-ratio="1"></v-img>
            </v-col>
          </v-row>
          <v-card-title>
            <v-spacer></v-spacer>
            <v-btn
                icon
                text
                x-small
                @click="dialog=false"
                class="mt-0"
            >
              <v-img :src="require('../assets/close_button.png')"></v-img>
            </v-btn>

          </v-card-title>
          <v-container class="text-center">
            <h2>{{ shownDuck.title[language] }}</h2>
            <h3>Subtitle</h3>
          </v-container>

          <v-card-text class="font-weight-bold overflow-y-auto text-left"
                       style="height: 200px; background: #d9d9d9; width: 100%;font-size: large">
            {{ shownDuck.story[language] }}
          </v-card-text>
        </v-card>

      </div>
    </v-dialog>
    <div
        class="no-whitespace unselectable full-screen"
    >
      <div id="map" class="no-whitespace unselectable" style="height: max-content; width: max-content;">
        <div class="no-whitespace unselectable" style="height: 2044px; width: 3267px;">
          <v-img src="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/map.png)" alt="map"
                 style="height: 2044px; width: 3267px; padding: 0; margin: 0"></v-img>
        </div>
        <v-img
            :src="duck.duckIconUrl"
            @click="duckClicked(duck)"
            :style="{'position': 'absolute', 'left': duck.coordinate.x, 'top': duck.coordinate.y}"
            v-for="duck in Object.values(duckStates).filter(_ => !_.isHidden)"
            :key="duck.id"
            width="100"
        ></v-img>
      </div>
    </div>
  </div>
</template>

<script>
import Panzoom from "@panzoom/panzoom"
import axios from "axios"

export default {
  name: 'HelloWorld',
  components: {},
  props: {},
  data() {
    return {
      duckHistory: [],
      panzoom: null,
      dialog: false,
      shownDuck: null,
      duckStates: {},
      duckInfo: {},
      duckId: this.$route.params.id,
      language: 'cn',
      languagePrompt: 'English'
    }
  },
  async mounted() {
    const elem = document.getElementById('map');
    this.panzoom = Panzoom(elem, {
      // disableZoom: true,
      canvas: true,
      animate: true,
      panOnlyWhenZoomed: false,
      minScale: 0.3,
      maxScale: 1.5,
      startX: -2500,
      startY: -1500,
      startScale: 0.4,
      contain: 'outside'
    });
    const duckList = (await axios.get("https://sso.forkingpark.cn/api/preview-ducks")).data

    let duckInformation = {}
    // 登陆代码
    try {
      const response = await axios.get(
          "https://sso.forkingpark.cn/api/user-info",
          {withCredentials: true}
      )
      duckInformation = response.data
    } catch (e) {
      // on 401 error, go to login page
      if (e.response && e.response.status === 401) {
        const current_url = window.location.href;
        window.location.href = "https://sso.forkingpark.cn/login?redirect_url=" + current_url;
      } else {
        console.error("unexpected error: " + e)
      }
    }

    // load ducks from the preview-duck, only the found ducks have detailed info
    duckList.forEach(
        (duck) => {
          this.duckStates[duck.location.id] = {
            id: duck.location.id,
            isFound: false,
            isHidden: duck.isHidden,
            coordinate: duck.location.coordinate,
            info: {
              duckIconUrl: 'https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/unknown.png',
              story: {
                cn: '还没发现这只鸭子，也许在...',
                en: ''
              },
              title: {
                cn: '未知鸭子',
                en: ''
              }
            }
          }
        }
    )

    // load info of found ducks
    duckInformation.duckHistory.map(d => d.duck).forEach((duck) => {
      this.duckStates[duck.location.id].isFound = true
      this.duckStates[duck.location.id].info = duck
      this.duckStates[duck.location.id].id = duck.id
    })

    // 电脑zoom in
    // document.addEventListener('wheel', this.panzoom.zoomWithWheel)
    this.$forceUpdate()
    console.log("log", this.duckStates)

  },
  methods: {
    duckClicked(duck) {
      this.dialog = true
      this.shownDuck = duck.info
    },
    bigImage(url) {
      const splits = url.split("/");
      const name = "3x-" + splits.pop();
      splits.push(name);
      return splits.join("/");
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

@font-face {
  font-family: "Chinese_pixel";
  src: url("../assets/Chinese_pixel.ttf")
}
</style>
