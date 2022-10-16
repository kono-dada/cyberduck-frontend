<template>
  <div
      class="no-whitespace unselectable full-screen"
  >
    <v-dialog
        v-model="dialog"
        width="80vm"
        style="background: transparent"
        hide-overlay
    >
      <div style="max-height: 490px">
        <v-row style="height: 81px"></v-row>
        <v-card
            class="mx-2 nes-container is-rounded"
            color="#ffffffff"
            height="409px"
            max-height="409px"
            elevation="0"
            align="center"

        >
          <v-row style="height: 81px;position:absolute;width: 100%;padding: 0;left: 0" align="center" class="ma-0">
            <v-col>
              <v-img :src="shownDuck.duckIconUrl"
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
            <h3>{{ shownDuck.title.cn }}</h3>
            <h3>New Decoration</h3>
          </v-container>

          <v-card-text class="text-h5 font-weight-bold overflow-y-auto text-left"
                       style="max-height: 200px; background: #d9d9d9; width: 100%">
            {{ shownDuck.story.cn }}
          </v-card-text>
        </v-card>

      </div>
    </v-dialog>
    <div id="map" class="no-whitespace unselectable" style="height: max-content; width: max-content;">
      <div class="no-whitespace unselectable" style="height: 2044px; width: 3267px;">
        <v-img :src="require('../assets/map.png')" alt="map" style="height: 2044px; width: 3267px; padding: 0; margin: 0"></v-img>
      </div>

      <!--      `https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/${duck.id}.gif`-->
      <v-img
          :src="duck.info.duckIconUrl"
          @click="duckClicked(duck)"
          :style="{'position': 'absolute', 'left': duck.coordinate.x, 'top': duck.coordinate.y}"
          v-for="duck in duckStates"
          :key="duck.id"
          width="100"
      ></v-img>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import Panzoom from "@panzoom/panzoom"

export default {
  name: 'HelloWorld',
  components: {},
  props: {
    msg: String
  },
  data() {
    return {
      duckHistory: [],
      panzoom: null,
      dialog: false,
      shownDuck: {
        "id": "",
        "title": {"cn": "", "en": ""},
        "story": {"cn": "", "en": ""},
        "location": {
          "id": "",
          "coordinate": {"x": "", "y": ""},
          "description": {"cn": "", "en": ""}
        },
        "topics": [{"cn": "", "en": ""}],
        "duckIconUrl": "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/63445d0023bd9e91254db991.gif",
        "isHidden": false,
        "relatedExhibit": {
          "location": {"cn": "涓嬫矇骞垮満鏍戜笅", "en": "Under the tree in the sunken square"},
          "title": {"cn": "鑰虫満绾�", "en": "Plunged in"},
          "sign": {
            "cn": "鎴戜滑鎬绘妸鑷繁鎶涜繘璧涘崥涓栫晫閲岋細鎻掍笂鍏呯數绾裤€佽繛涓妛ifi銆佹墦寮€钃濈墮鎴栬€呮彃涓婅€虫満绾匡紝鍒╃敤鍥涢潰鐢靛瓙鍣煶澧欎笌涓栭殧缁濄€傚儚鏄竴棰楅椋樺拷涓嶅畾鐨勭數瀛愬皹鍩冿紝鐥曡抗娲掗亶缃戠粶銆俓n\n涓嶈繃锛屽皹鍩冩湁娌℃湁鍙兘鐩搁亣锛岀粨浼存垚涓烘澗杞殑灏樺厰锛屾垨鑰呭寲鎴愪簯鏈碉紝浼寸潃闊充箰涓€璧蜂綆绌洪琛岋紵鍦ㄥ叕鍥紝鎶婅€虫満绾跨粐鎴愯繛缁撲綘鎴戠殑缃戯紝鍏变韩姣忔澹伴煶鐨勯渿鍔紝鍦ㄥ簽澶х殑璧涘崥涓栫晫涓畾浣嶅郊姝ゃ€傝鎵爜杩涘叆鍏变韩姝屽崟灏忕▼搴忥紝plug in鍒板埆浜虹殑闊充箰涓栫晫~",
            "en": ""
          },
          "artists": [{"cn": "闄堟瞾婧�", "en": ""}]
        },
        "nextDuckStory": {
          "id": "63453f1d8decd058e75edc1f",
          "title": {"cn": "yyds楦腑", "en": ""},
          "location": {"id": "63462c624a9a6bda2db28e81", "coordinate": {"x": "1000px", "y": "1000px"}},
          "topics": [{"cn": "缃戠粶榛戣瘽", "en": ""}],
          "isHidden": true
        }
      },
      duckStates: {},
      duckInfo: {}
    }
  },
  async mounted() {

    // const duckList = [{
    //   "title": {"cn": "鸭鸭料理店店主", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e7a", "coordinate": {"x": "300px", "y": "300px"}},
    //   "topics": [{"cn": "疫情封闭", "en": ""}],
    //   "isHidden": false
    // }, {
    //   "title": {"cn": "AI艺术家鸭鸭", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e7c", "coordinate": {"x": "500px", "y": "500px"}},
    //   "topics": [{"cn": "科技向善", "en": ""}, {"cn": "人地关系", "en": ""}],
    //   "isHidden": false
    // }, {
    //   "title": {"cn": "高冷耳机鸭鸭", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e7f", "coordinate": {"x": "800px", "y": "800px"}},
    //   "topics": [{"cn": "听歌社交", "en": ""}],
    //   "isHidden": false
    // }, {
    //   "title": {"cn": "用户duck123", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e79", "coordinate": {"x": "200px", "y": "200px"}},
    //   "topics": [{"cn": "网络交友", "en": ""}],
    //   "isHidden": false
    // }, {
    //   "title": {"cn": "麻了鸭鸭", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e7e", "coordinate": {"x": "700px", "y": "700px"}},
    //   "topics": [{"cn": "信息过载", "en": ""}],
    //   "isHidden": false
    // }, {
    //   "title": {"cn": "鸭岗大学毕业生", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e7b", "coordinate": {"x": "400px", "y": "400px"}},
    //   "topics": [{"cn": "求职焦虑", "en": ""}],
    //   "isHidden": false
    // }, {
    //   "title": {"cn": "三舅鸭鸭", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e80", "coordinate": {"x": "900px", "y": "900px"}},
    //   "topics": [{"cn": "精神内耗", "en": ""}],
    //   "isHidden": true
    // }, {
    //   "title": {"cn": "老年鸭鸭", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e7d", "coordinate": {"x": "600px", "y": "600px"}},
    //   "topics": [{"cn": "数字鸿沟", "en": ""}],
    //   "isHidden": true
    // }, {
    //   "title": {"cn": "yyds鸭鸭", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e81", "coordinate": {"x": "1000px", "y": "1000px"}},
    //   "topics": [{"cn": "网络黑话", "en": ""}],
    //   "isHidden": true
    // }, {
    //   "title": {"cn": "斗蛐蛐鸭鸭", "en": ""},
    //   "location": {"id": "63462c624a9a6bda2db28e78", "coordinate": {"x": "100px", "y": "100px"}},
    //   "topics": [{"cn": "网络黑市", "en": ""}],
    //   "isHidden": true
    // }]

    const duckInformation = {
      "id": "63455cd74a9a6bda2db28e75",
      "createdAt": "2022-10-11T12:08:55.431+00:00",
      "wechatOpenId": "o3QVY6yJiuQ9B6lvUeyrziPxxo64",
      "duckHistory": [{
        "createdAt": "2022-10-12T15:26:04.337+00:00",
        "duck": {
          "id": "63453f1d8decd058e75edc19",
          "title": {"cn": "楂樺喎鑰虫満楦腑", "en": ""},
          "story": {
            "cn": "楦腑鎬绘槸鎴寸潃鑰虫満琛岃蛋鍦ㄦ牎鍥箣涓紝澶у閮借寰楀畠澶珮鍐蜂簡锛岀畝鐩存槸鈥滀袱鑰充笉闂荤獥澶栦簨锛屼竴蹇冨彧鍚ソ闊充箰鈥濄€傚叾瀹炶€虫満楦腑骞朵笉鏄ぞ浜ょ粷缂樹綋锛屽畠鍙槸涔犳儻浠ラ煶涔愪负濯掍粙鍦ㄧ綉缁滀笂浜ゆ湅鍙嬶紝鍥犱负瀹冨潥淇″彧鏈夐煶涔愬搧鍛充竴鑷寸殑浜烘墠鍚堝緱鏉ワ紒鏈夋椂鍊欏畠鐨勭敓娲昏繃寰椾竴鍦伴腑姣涳紝鎴翠笂鑰虫満鐨勪竴鐬棿灏变豢浣涙殏鏃朵粠鐜板疄涓栫晫涓娊绂诲嚭鏉ヤ簡锛岄偅浜涚儲蹇冧簨涔熼殢涔嬫姏璇歌剳鍚庯紱鍐嶆墦寮€杞欢绉佷俊鐪嬪埌鏈嬪弸鍒嗕韩缁欒嚜宸辩殑闊充箰锛屽畠鎰熷埌濡傛杞绘澗鍦拌鎳傚緱鍜屾不鎰堛€傛槰澶╋紝涓€涓箰鍙嬪湪缁欒€虫満楦腑鍒嗕韩鏃惰閬撯€滆繖棣栨瓕绠€鐩磞yds锛佲€濓紝瀹冨苟娌℃湁璇绘噦杩欏洓涓嫳鏂囧瓧姣嶇粍鍚堬紝鑻︽€濆啣鎯充簡涓€澶╀篃娌℃壘鍒扮瓟妗堚€︹€︼紙鎻愮ず锛氱┖闂茬殑鏃跺€欏幓xxx闄勮繎杞浆锛屼翰鑷悜yyds楦腑璇锋暀鍚锛�",
            "en": ""
          },
          "location": {
            "id": "63462c624a9a6bda2db28e7f",
            "coordinate": {"x": "800px", "y": "800px"},
            "description": {"cn": "TD鍦伴潰", "en": "TD Ground Floor"}
          },
          "topics": [{"cn": "鍚瓕绀句氦", "en": ""}],
          "duckIconUrl": "https://parklife-1303545624.cos.ap-guangzhou.myqcloud.com/63445d0023bd9e91254db991.gif",
          "isHidden": false,
          "relatedExhibit": {
            "location": {"cn": "涓嬫矇骞垮満鏍戜笅", "en": "Under the tree in the sunken square"},
            "title": {"cn": "鑰虫満绾�", "en": "Plunged in"},
            "sign": {
              "cn": "鎴戜滑鎬绘妸鑷繁鎶涜繘璧涘崥涓栫晫閲岋細鎻掍笂鍏呯數绾裤€佽繛涓妛ifi銆佹墦寮€钃濈墮鎴栬€呮彃涓婅€虫満绾匡紝鍒╃敤鍥涢潰鐢靛瓙鍣煶澧欎笌涓栭殧缁濄€傚儚鏄竴棰楅椋樺拷涓嶅畾鐨勭數瀛愬皹鍩冿紝鐥曡抗娲掗亶缃戠粶銆俓n\n涓嶈繃锛屽皹鍩冩湁娌℃湁鍙兘鐩搁亣锛岀粨浼存垚涓烘澗杞殑灏樺厰锛屾垨鑰呭寲鎴愪簯鏈碉紝浼寸潃闊充箰涓€璧蜂綆绌洪琛岋紵鍦ㄥ叕鍥紝鎶婅€虫満绾跨粐鎴愯繛缁撲綘鎴戠殑缃戯紝鍏变韩姣忔澹伴煶鐨勯渿鍔紝鍦ㄥ簽澶х殑璧涘崥涓栫晫涓畾浣嶅郊姝ゃ€傝鎵爜杩涘叆鍏变韩姝屽崟灏忕▼搴忥紝plug in鍒板埆浜虹殑闊充箰涓栫晫~",
              "en": ""
            },
            "artists": [{"cn": "闄堟瞾婧�", "en": ""}]
          },
          "nextDuckStory": {
            "id": "63453f1d8decd058e75edc1f",
            "title": {"cn": "yyds楦腑", "en": ""},
            "location": {"id": "63462c624a9a6bda2db28e81", "coordinate": {"x": "1000px", "y": "1000px"}},
            "topics": [{"cn": "缃戠粶榛戣瘽", "en": ""}],
            "isHidden": true
          }
        }
      }]
    }

    duckInformation.duckHistory.map(d => d.duck).forEach((duck) => {
      this.duckStates[duck.location.id] = {
        id: duck.location.id,
        isFound: true,
        idHidden: false,
        coordinate: duck.location.coordinate,
        info: duck,
      }
    })

    // duckList.forEach(
    //     (duck) => {
    //       this.duckStates[duck.location.id] = {
    //         id: duck.location.id,
    //         isFound: !duck.isHidden,
    //         idHidden: duck.isHidden,
    //         coordinate: duck.location.coordinate,
    //         info: null,
    //       }
    //     }
    // )

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
    this.$forceUpdate()
    // 登陆代码
    // try {
    //   const response = await axios.get(
    //       "https://sso.forkingpark.cn/api/user-info",
    //       {withCredentials: true}
    //   );
    //   response.data.duckHistory.map(d => d.duck).forEach((duck) => {
    //     this.duckStates[duck.location.id] = {
    //       isFound: true,
    //       idHidden: false,
    //       coordinate: duck.location.coordinate,
    //       info: duck,
    //     }
    //   });
    // } catch (e) {
    //   // on 401 error, go to login page
    //   if (e.response && e.response.status === 401) {
    //     const current_url = window.location.href;
    //     window.location.href = "https://sso.forkingpark.cn/login?redirect_url=" + current_url;
    //   } else {
    //     console.error("unexpected error: " + e)
    //   }
    // }
  },
  methods: {
    duckClicked(duck) {
      if (duck.isFound) {
        this.dialog = true
        this.shownDuck = duck.info
      }
    }
  }
}
</script>

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
</style>
