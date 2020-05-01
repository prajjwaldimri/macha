<template lang="pug">
  v-app
    AppBar
    v-content
      v-snackbar(v-model="show" top absolute :color="color")
        | {{message}}
        v-btn(text @click="show = false") Close
      nuxt
    BottomNav
    v-bottom-sheet(v-model="sheet")
      v-list
        v-subheader Share with
        v-list-item(@click="share('facebook')")
          v-list-item-avatar
            v-avatar(size="32px" tile)
              v-icon mdi-facebook
          v-list-item-title Facebook
        v-list-item(@click="share('twitter')")
          v-list-item-avatar
            v-avatar(size="32px" tile)
              v-icon mdi-twitter
          v-list-item-title Twitter
        v-list-item(@click="share('whatsapp')")
          v-list-item-avatar
            v-avatar(size="32px" tile)
              v-icon mdi-whatsapp
          v-list-item-title Whatsapp
        v-list-item(@click="share('telegram')")
          v-list-item-avatar
            v-avatar(size="32px" tile)
              v-icon mdi-telegram
          v-list-item-title Telegram

</template>

<script>
import AppBar from '../components/appBar';
import BottomNav from '../components/bottomNav';
import { mapState } from 'vuex';

export default {
  components: {
    AppBar,
    BottomNav
  },
  computed: mapState({
    theme: state => state.theme.isDarkThemeEnabled
  }),
  data() {
    return {
      show: false,
      message: '',
      color: '',
      sheet: false,
      shareUrl: '',
      shareText: ''
    };
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'snackbar/showNotification') {
        this.message = state.snackbar.content;
        this.color = state.snackbar.color;
        this.show = true;
      }
      if (mutation.type === 'share/showSheet') {
        this.shareUrl = state.share.url;
        this.shareText = state.share.text;
        this.sheet = true;
      }
      if (mutation.type === 'theme/setDarkTheme') {
        this.$vuetify.theme.dark =
          localStorage.getItem('isDarkThemeEnabled') === 'true';
      }
      if (mutation.type === 'theme/setLightTheme') {
        this.$vuetify.theme.dark =
          localStorage.getItem('isDarkThemeEnabled') === 'true';
      }
    });
  },
  mounted() {
    if (!localStorage.getItem('isDarkThemeEnabled')) {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        localStorage.setItem('isDarkThemeEnabled', true);
        this.$vuetify.theme.dark = true;
        this.$store.commit('theme/setDarkTheme');
      } else {
        localStorage.setItem('isDarkThemeEnabled', false);
        this.$vuetify.theme.dark = false;
        this.$store.commit('theme/setLightTheme');
      }
    } else {
      this.$vuetify.theme.dark =
        localStorage.getItem('isDarkThemeEnabled') === 'true';
    }
  },
  methods: {
    async share(type) {
      switch (type) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer.php?u=${this.shareUrl}`);
          break;
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${this.shareUrl}&text=${this.shareText}`
          );
          break;
        case 'whatsapp':
          window.open(`whatsapp://send?text=${this.shareUrl}`);
          break;
        case 'telegram':
          window.open(
            `https://telegram.me/share/url?url=${this.shareUrl}&text=${this.shareText}`
          );
          break;
        default:
          break;
      }
      this.sheet = false;
    }
  }
};
</script>

<style lang="scss">
.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s;
}
.page-enter,
.page-leave-to {
  opacity: 0;
}
</style>
