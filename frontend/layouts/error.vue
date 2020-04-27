<template lang="pug">
  .errorPage
    div(v-if='error.statusCode === 404')
      notFound
    h1(v-else='')
      | {{ otherError }}
      NuxtLink(to='/')
        | Home page
</template>

<script>
import notFound from '../components/error/notFound';

export default {
  layout: 'empty',
  components: {
    notFound
  },
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
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
