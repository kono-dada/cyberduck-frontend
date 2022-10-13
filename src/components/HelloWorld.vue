<template>
<!--  测试登陆数据代码-->
  <!--  <div class="hello">-->
  <!--    <h1>{{ msg }}</h1>-->
  <!--    <h2>Ducks Viewed Are Listed Below</h2>-->
  <!--    <div v-for="duck in duckHistory" v-bind:key="duck.id">-->
  <!--      <h3>鸭子名字：{{ duck.title.cn }}</h3>-->
  <!--      <h4>鸭子图片</h4>-->
  <!--      <div>-->
  <!--        <img :src="duck.duckIconUrl" alt="鸭子图片" style="width: 10rem">-->
  <!--      </div>-->
  <!--      <h4>鸭子故事</h4>-->
  <!--      <p>{{ duck.story.cn }}</p>-->
  <!--      <h4>鸭子位置</h4>-->
  <!--      <p>位置ID：{{ duck.location.id }}</p>-->
  <!--      <p>位置描述：{{ duck.location.description.cn }}</p>-->
  <!--      <div v-if="duck.relatedExhibit">-->
  <!--        <h4>相关展品</h4>-->
  <!--        <p>名称：{{ duck.relatedExhibit.title.cn }}</p>-->
  <!--        <p>地点：{{ duck.relatedExhibit.location.cn }}</p>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--    <h2>Map Below</h2>-->
  <!--    <div style="width: 100vm; height: 100vm; position: fixed;">-->
  <div
      style="width: 100vm; height: 100vm; position: fixed; z-index: -1; padding: 0; margin: 0; top: 0; left: 0; bottom: 0; right: 0">
    <!--  <div>-->
    <div id="map" style="height: 2044px; width: 3267px; padding: 0; margin: 0; overflow: clip">
      <img src="../assets/map.png" alt="map" style="height: 2044px; width: 3267px; padding: 0; margin: 0">
      <img src="../assets/duck.gif" style="position: absolute; left: 1000px; top: 1000px"
           onclick="alert('duck clicked');">
      <img src="../assets/duck.gif" style="position: absolute; left: 500px; top: 500px"
           onclick="alert('duck clicked');">
      <img src="../assets/duck.gif" style="position: absolute; left: 700px; top: 900px"
           onclick="alert('duck clicked');">
      <img src="../assets/duck.gif" style="position: absolute; left: 2000px; top: 1500px"
           onclick="alert('duck clicked');">
      <img src="../assets/duck.gif" style="position: absolute; left: 2200px; top: 1300px"
           onclick="alert('duck clicked');">
    </div>
  </div>
  <!--    </div>-->
  <!--  </div>-->
</template>

<script>
// 请求包
// import axios from "axios";

// npm install --save @panzoom/panzoom
import Panzoom from "@panzoom/panzoom"

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      duckHistory: [],
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
      maxScale: 1.5,
      startX: -2500,
      startY: -1500,
      startScale: 0.4,
    });
    // 电脑zoom in
    document.addEventListener('wheel', this.panzoom.zoomWithWheel)

    // 登陆代码
    // try {
    //   const response = await axios.get(
    //       "https://sso.forkingpark.cn/api/user-info",
    //       {withCredentials: true}
    //   );
    //   this.duckHistory = response.data.duckHistory.map(d => d.duck)
    // } catch (e) {
    //   // on 401 error, go to login page
    //   if (e.response && e.response.status === 401) {
    //     const current_url = window.location.href;
    //     window.location.href = "https://sso.forkingpark.cn/login?redirect_url=" + current_url;
    //   } else {
    //     console.error("unexpected error: " + e)
    //   }
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
