<template lang="pug">
  div
    v-container(fluid).pt-0
      v-row(v-for="(post, index) in posts" :key="index")
        ImagePost(v-if="postsType[index] === 'ImagePost'" :postId="post")
        TextPost(v-else-if="postsType[index] === 'TextPost'")
    v-progress-linear(v-intersect="onIntersect" indeterminate v-if="!isPostsEndingReached")
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
      isIntersecting: false,
      skip: 0,
      limit: 10,
      isPostsEndingReached: false
    };
  },
  async mounted() {
    try {
      await this.$apollo
        .query({
          query: getFeed,
          variables: {
            skip: this.skip,
            limit: this.limit
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
        this.skip += this.limit;
        try {
          await this.$apollo
            .query({
              query: getFeed,
              variables: {
                skip: this.skip,
                limit: this.limit
              },
              fetchPolicy: 'network-only'
            })
            .then(({ data }) => {
              if (data.getFeed.posts.length <= 0) {
                this.isPostsEndingReached = true;
              } else {
                this.posts.push(...data.getFeed.posts);
                this.postsType.push(...data.getFeed.postsType);
              }
            });
        } catch (e) {
          this.$notifier.showErrorMessage({
            content: e.graphQLErrors[0].message
          });
        }
      }
    }
  }
};
</script>
