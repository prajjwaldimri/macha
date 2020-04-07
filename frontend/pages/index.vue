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
      posts: [],
      postsType: []
    };
  },
  async mounted() {
    try {
      await this.$apollo
        .query({
          query: getFeed,
          variables: {
            skip: 0
          }
        })
        .then(({ data }) => {
          this.posts = data.getFeed.posts;
          this.postsType = data.getFeed.postsType;
        });
    } catch (err) {
      console.log(err);
    }
  }
};
</script>
