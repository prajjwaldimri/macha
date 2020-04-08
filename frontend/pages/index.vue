<template lang="pug">
  div
    v-container(fluid)
      v-row(v-for="(post, index) in posts" :key="index")
        ImagePost(v-if="postsType[index] === 'ImagePost'" :postId="post")
        TextPost(v-else-if="postsType[index] === 'TextPost'")
    v-card(v-intersect="onIntersect" )
      v-card-title Loading....
    bottomNav
</template>

<script>
import bottomNav from '../components/bottomNav/bottomNav';
import ImagePost from '../components/feed/imagePost';
import TextPost from '../components/feed/textPost';

import getFeed from '../gql/getFeed';

export default {
  components: {
    bottomNav,
    ImagePost,
    TextPost
  },
  data() {
    return {
      posts: [],
      postsType: [],
      isIntersecting: false
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
    } catch (e) {
      this.$notifier.showErrorMessage({
        content: e.graphQLErrors[0].message
      });
    }
  },
  methods: {
    onIntersect(entries, observer) {
      this.isIntersecting = entries[0].isIntersecting;
    }
  },
  watch: {
    async isIntersecting(val) {
      if (val) {
        console.log('loading new');
      }
    }
  }
};
</script>
