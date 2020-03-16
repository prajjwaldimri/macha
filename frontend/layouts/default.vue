<template lang="pug">
  v-app
    v-content
      v-snackbar(v-model="show" top absolute :color="color")
        | {{message}}
        v-btn(text @click="show = false") Close
      nuxt
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      show: false,
      message: '',
      color: ''
    };
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'snackbar/showNotification') {
        this.message = state.snackbar.content;
        this.color = state.snackbar.color;
        this.show = true;
      }
    });
  },
  mounted() {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      this.$vuetify.theme.dark = true;
    }

    window.matchMedia('(prefers-color-scheme: dark)').addListener(function(e) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.$vuetify.theme.dark = true;
      } else {
        this.$vuetify.theme.dark = false;
      }
    });
  },
  computed: mapState(['notification'])
};
</script>
