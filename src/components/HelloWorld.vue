<template>
  <!--  测试登陆数据代码-->
  <div class="hello">
    <h1>This is duck-map</h1>
    <div style="width: 100vm; height: 100vm; position: fixed;">
      <div class="full-screen no-whitespace unselectable">
        <div id="map" class="no-whitespace unselectable" style="height: max-content; width: max-content;">
          <img class="no-whitespace" src="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/map.png" alt="map"
               style="scale: 100%; z-index: -2">
          <div v-for="duck in duckStates" v-bind:key="duck.id">
            <img v-if="!duck.isFound && !duck.isHidden" class="no-whitespace back"
                 src="https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/unknown.png" alt="unknown-duck"
                 :style="{position: 'absolute', height: '64px', width: '64px', zIndex: -1, left: duck.coordinate.x, top: duck.coordinate.y}"
            >
            <img v-if="duck.isFound" class="no-whitespace back"
                 :src="duck.info.duckIconUrl" alt="duck"
                 :style="{position: 'absolute', zIndex: -1, left: duck.coordinate.x, top: duck.coordinate.y}"
                 v-on:click="alert('this is duck: ' + duck.info.title.cn);"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 请求包
import axios from "axios";

// npm install --save @panzoom/panzoom
import Panzoom from "@panzoom/panzoom"

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      duckStates: {},
      panzoom: null,
    }
  },
  async mounted() {
    const elem = document.getElementById('map');
    this.panzoom = Panzoom(elem, {
      // disableZoom: true,
      canvas: true,
      animate: true,
      contain: "outside",
      panOnlyWhenZoomed: false,
      minScale: 0.3,
      maxScale: 1.0,
      startX: -1000,
      startY: -500,
      startScale: 0.8,
    });
    // 电脑zoom in
    document.addEventListener('wheel', this.panzoom.zoomWithWheel)

    // init duck states
    const duckList = await axios.get("https://sso.forkingpark.cn/api/preview-ducks");
    duckList.data.forEach(
        (duck) => {
          this.duckStates[duck.location.id] = {
            isFound: false,
            idHidden: duck.isHidden,
            coordinate: duck.location.coordinate,
            info: null,
          }
        }
    );

    // 登陆代码
    try {
      const response = await axios.get(
          "https://sso.forkingpark.cn/api/user-info",
          {withCredentials: true}
      );
      response.data.duckHistory.map(d => d.duck).forEach((duck) => {
        this.duckStates[duck.location.id] = {
          isFound: true,
          idHidden: false,
          coordinate: duck.location.coordinate,
          info: duck,
        }
      });
    } catch (e) {
      // on 401 error, go to login page
      if (e.response && e.response.status === 401) {
        const current_url = window.location.href;
        window.location.href = "https://sso.forkingpark.cn/login?redirect_url=" + current_url;
      } else {
        console.error("unexpected error: " + e)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
