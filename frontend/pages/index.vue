<template lang="pug">
  .feed
    .feed-container(style="padding-bottom:50px").pt-0.px-0.mx-0
      v-row(v-for="(post, index) in posts" :key="post")
        ImagePost(v-if="postsType[index] === 'ImagePost'" :postId="post" @postDeleted="removePost(post)")
        TextPost(v-else-if="postsType[index] === 'TextPost'" :postId="post" @postDeleted="removePost(post)")
    v-progress-linear(v-intersect="onIntersect" indeterminate v-if="!isPostsEndingReached")
    bottomPoster(@refreshFeed="refresh('network-only', 0)")
</template>

<script>
import bottomPoster from '../components/bottomPoster/bottomPoster';
import ImagePost from '../components/feed/imagePost';
import TextPost from '../components/feed/textPost';

import getFeed from '../gql/getFeed';

export default {
  components: {
    bottomPoster,
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
    await this.refresh();
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first', skipValue = this.skip) {
      try {
        this.skip = skipValue;
        await this.$apollo
          .query({
            query: getFeed,
            variables: {
              skip: this.skip,
              limit: this.limit
            },
            fetchPolicy
          })
          .then(({ data }) => {
            this.posts = data.getFeed.posts;
            this.postsType = data.getFeed.postsType;
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: e
        });
      }
    },
    onIntersect(entries, observer) {
      this.isIntersecting = entries[0].isIntersecting;
    },
    async removePost(postId) {
      const index = this.posts.indexOf(postId);
      this.$delete(this.posts, index);
      this.$delete(this.postsType, index);
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
