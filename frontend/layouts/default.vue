<template lang="pug">
  v-app(dark)
    nuxt
</template>

<script>
export default {
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
  }
};
</script>
