<template lang="pug">
  v-app-bar(app elevate-on-scroll dense)
    v-btn(icon @click="goBack" tile :disabled="isBackButtonDisabled")
      v-icon mdi-arrow-left
    v-toolbar-title(@click="$router.push('/')" style="cursor: pointer").px-5
      v-badge(icon="mdi-alpha" color="transparent" offset-x="3" offset-y="13" tile bottom)
        span macha.in
    v-spacer
    v-btn(icon @click="goForward" tile)
      v-icon mdi-arrow-right
</template>

<script>
export default {
  data() {
    return {
      isBackButtonDisabled: false
    };
  },
  methods: {
    goBack() {
      if (window.history.length > 0) {
        this.$router.go(-1);
      }
    },
    goForward() {
      this.$router.go(1);
    }
  }
};
</script>