<template lang="pug">
  .errorPage
    div(v-if='error.statusCode === 404')
      notFound
    v-card(v-else).pb-3.pt-3
      .otherError
        span.title Oops, we've encountered an error.
        v-btn(color="primary" block to="/feedback" nuxt).mt-3.mb-3 Give Feedback
        v-btn(color="primary" block to="/" nuxt) Go Home

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
  }
};
</script>

<style lang="scss" scoped>
.otherError {
  width: 95vw;
  left: 0;
  right: 0;
  margin: auto;
}
</style>