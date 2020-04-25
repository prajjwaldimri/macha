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
      textPostSkip: 0,
      imagePostSkip: 0,
      videoPostSkip: 0,
      limit: 10,
      isPostsEndingReached: false,
      isFirstRender: true
    };
  },
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first', skipValue = 0) {
      try {
        this.textPostSkip = skipValue;
        this.imagePostSkip = skipValue;
        this.videoPostSkip = skipValue;
        await this.$apollo
          .query({
            query: getFeed,
            variables: {
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
      if (this.isFirstRender) {
        this.isFirstRender = false;
        return;
      }
      if (val) {
        // We will calculate how many textPosts, imagePosts or videoPosts should the backend skip based on how many we already have here

        this.textPostSkip = this.postsType.filter(
          value => value === 'TextPost'
        ).length;
        this.imagePostSkip = this.postsType.filter(
          value => value === 'ImagePost'
        ).length;
        this.videoPostSkip = this.postsType.filter(
          value => value === 'VideoPost'
        ).length;
        try {
          await this.$apollo
            .query({
              query: getFeed,
              variables: {
                textPostSkip: this.textPostSkip,
                imagePostSkip: this.imagePostSkip,
                videoPostSkip: this.videoPostSkip,
                limit: this.limit
              },
              fetchPolicy: 'network-only'
            })
            .then(({ data }) => {
              console.log(data);
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
