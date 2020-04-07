<template lang="pug">
  div
    h1 Hello
    bottomNav
</template>

<script>
import bottomNav from '../components/bottomNav/bottomNav';

import getFeed from '../gql/getFeed';

export default {
  components: {
    bottomNav
  },
  data() {
    return {
      posts: []
    };
  },
  async mounted() {
    try {
      this.posts = await this.$apollo
        .query({
          query: getFeed
        })
        .then(({ data }) => data.getFeed.posts);
    } catch (err) {
      console.log(err);
    }
  }
};
</script>
