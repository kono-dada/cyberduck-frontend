<template>
  <div
      class="no-whitespace unselectable full-screen"
  >
    <v-row style="position: absolute; top: 5%;z-index: 5;left: 0;padding: 0; width: 90%" class="mx-5">
      <p id="language"
         class="language-button"
         @click="language = language==='cn'?'en':'cn'; languagePrompt = language==='cn'?'🇬🇧':'🇨🇳'"
      >
        {{ languagePrompt }}
      </p>
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
      <p>{{ Object.values(duckStates).filter(_ => _.isFound).length }}/10</p>
    </div>
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
          style="margin-top: 150px"
          elevation="10"
          alignment="center"
      >
        <div style="text-align: center">
          <v-img :src="bigImage(shownDuck.duckIconUrl)"
                 style="position: absolute; alignment: center; top: -120px;" width="150px" :aspect-ratio="1"></v-img>
        </div>
        <i @click="dialog=false" class="nes-icon close" style="position: absolute; right: 10px; top: 10px"></i>
        <v-card-title>
          <h3 style="font-family: Chinese_pixel, serif; margin-top: 10px">
            {{ shownDuck.title[language] }}
          </h3>
        </v-card-title>
        <v-card-text class="font-weight-bold text-left"
                     style="background: #ffffff; width: 100%;height: 72%;font-size: medium;font-family: Chinese_pixel, serif; overflow-y: scroll;">
          {{ getStory(shownDuck) }}
        </v-card-text>
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

export default {
  name: 'HelloWorld',
  components: {},
  props: {},
  data() {
    return {
      panzoom: null,
      dialog: false,
      shownDuck: null,
      duckStates: {},
      duckId: this.$route.params.id,
      language: 'cn',
      languagePrompt: '🇬🇧'
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

    // 登陆代码
    try {
      const response = await axios.get(
          "https://sso.forkingpark.cn/api/user-info",
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
      } else {
        console.error("unexpected error: " + e)
      }
    }

    // 电脑zoom in
    // document.addEventListener('wheel', this.panzoom.zoomWithWheel)
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
    },
    getStory(shownDuck) {
      let story = shownDuck.story[this.language];
      // hint next location
      const nextDuckStory = shownDuck.nextDuckStory;
      if (nextDuckStory !== null) {
        const nextLocation = nextDuckStory.location.description[this.language];
        story = story.replace("xxx", nextLocation);
      }
      // add exhibit info
      const relatedExhibit = shownDuck.relatedExhibit;
      if (relatedExhibit !== null) {
        if (this.language === "cn") {
          story += "\n\n相关展品：";
          story += relatedExhibit.title[this.language];
          story += "\n展品位置：";
          story += relatedExhibit.location[this.language];
        } else {
          story += "\n\nRelated Exhibit：";
          story += relatedExhibit.title[this.language];
          story += "\nExhibit Location：";
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

.language-button {
  text-align: center;
  font-family: Chinese_pixel, serif;
  font-size: xx-large;
  border-style: none;
  background: transparent
}

@font-face {
  font-family: "Chinese_pixel";
  src: url("https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/Chinese_pixel.ttf");
}
</style>
