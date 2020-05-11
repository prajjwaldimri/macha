<template lang="pug">
  v-app-bar(app dense flat)
    //- v-btn(icon @click="goBack" tile :disabled="isBackButtonDisabled")
    //-   v-icon mdi-arrow-left
    v-toolbar-side-icon
      v-img(:src="require('~/assets/macha-logo.svg')" height="24" width="24")
    v-toolbar-title(@click="$router.push('/')" style="cursor: pointer").px-2
      v-badge(content="α" color="transparent" offset-x="7" offset-y="12" tile bottom)
        span macha.in
    //- v-spacer
    //- v-btn(icon @click="goForward" tile)
    //-   v-icon mdi-arrow-right
</template>

<script>
export default {
  data() {
    return {
      isBackButtonDisabled: false
    };
  },
  mounted() {
    if (window && window.history.length <= 2) {
      this.isBackButtonDisabled = true;
    } else {
      this.isBackButtonDisabled = false;
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 2) {
        this.$router.go(-1);
      }
    },
    goForward() {
      this.$router.go(1);
    }
  },
  watch: {
    $route: {
      handler(to, from) {
        if (window && window.history.length <= 2) {
          this.isBackButtonDisabled = true;
        } else {
          this.isBackButtonDisabled = false;
        }
      }
    }
  }
};
</script>
