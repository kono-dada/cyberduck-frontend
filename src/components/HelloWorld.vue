<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Ducks Viewed Are Listed Below</h2>
    <div v-for="duck in duckHistory" v-bind:key="duck.id">
      <h3>鸭子名字：{{ duck.title.cn }}</h3>
      <h4>鸭子图片</h4>
      <div>
        <img :src="duck.duckIconUrl" alt="鸭子图片">
      </div>
      <h4>鸭子故事</h4>
      <p>{{ duck.story.cn }}</p>
      <h4>鸭子位置</h4>
      <p>位置ID：{{ duck.location.id }}</p>
      <p>位置描述：{{ duck.location.description.cn }}</p>
      <div v-if="duck.relatedExhibit">
        <h4>相关展品</h4>
        <p>名称：{{ duck.relatedExhibit.title.cn }}</p>
        <p>地点：{{ duck.relatedExhibit.location.cn }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      duckHistory: [],
    }
  },
  async mounted() {
    try {
      const response = await axios.get(
          "https://sso.forkingpark.cn/api/user-info",
          {withCredentials: true}
      );
      this.duckHistory = response.data.duckHistory.map(d => d.duck)
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
