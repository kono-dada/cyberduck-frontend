<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Ducks Viewed Are Listed Below</h2>
    <div v-for="duck in this.userState.duckHistory" v-bind:key="duck.id">
      <h3>{{duck.title.cn}}</h3>
      <p>{{duck.story.cn}}</p>
      <div v-if="duck.relatedExhibit">
        <h4>相关展品</h4>
        <div>名称：duck.relatedExhibit.title.cn</div>
        <div>地点：duck.relatedExhibit.location.cn</div>
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
      userState: {
        duckHistory: []
      },
    }
  },
  mounted() {
    try {
      getUserInfo(renderUserState);
    } catch (e) {
      console.log("failed to get user info: " + e);
    }
  }
}

function renderUserState(dat) {
  this.userState = dat;
}

async function getUserInfo(renderUserState) {
  const response = await axios.get("https://sso.forkingpark.cn/api/user-info");
  if (response.status === 404) {
    const current_url = window.location.href;
    window.location.href = "https://sso.forkingpark.cn/login?redirect_url=" + current_url;
  } else if (response.status === 200) {
    renderUserState(response.data.json())
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
