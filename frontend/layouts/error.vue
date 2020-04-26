<template lang="pug">
  v-container(fluid)
    template( v-if='error.statusCode === 404' )
      v-img(src="require(~assets/404image.jpg)" aspect-ratio="1")
        | {{ pageNotFound }}
    h1(v-else='')
      | {{ otherError }}
    NuxtLink(to='/')
      | Home page
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    };
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title
    };
  }
};
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
