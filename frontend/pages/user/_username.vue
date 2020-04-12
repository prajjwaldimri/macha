<template lang="pug">
  div
    v-container(fluid style="padding-bottom:50px").pt-0
      v-row(v-for="(post, index) in posts" :key="post")
        ImagePost(v-if="postsType[index] === 'ImagePost'" :postId="post")
        TextPost(v-else-if="postsType[index] === 'TextPost'" :postId="post")
    v-progress-linear(v-intersect="onIntersect" indeterminate v-if="!isPostsEndingReached")
</template>

<script>
import ImagePost from '../../components/feed/imagePost';
import TextPost from '../../components/feed/textPost';

import getFeedOfOneUser from '../../gql/getFeedOfOneUser';

export default {
  components: {
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
            query: getFeedOfOneUser,
            variables: {
              skip: this.skip,
              limit: this.limit,
              username: this.$route.params.username
            },
            fetchPolicy
          })
          .then(({ data }) => {
            this.posts = data.getFeedOfOneUser.posts;
            this.postsType = data.getFeedOfOneUser.postsType;
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: e
        });
      }
    },
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
              query: getFeedOfOneUser,
              variables: {
                skip: this.skip,
                limit: this.limit,
                username: this.$route.params.username
              },
              fetchPolicy: 'network-only'
            })
            .then(({ data }) => {
              if (data.getFeedOfOneUser.posts.length <= 0) {
                this.isPostsEndingReached = true;
              } else {
                this.posts.push(...data.getFeedOfOneUser.posts);
                this.postsType.push(...data.getFeedOfOneUser.postsType);
              }
            });
        } catch (e) {
          this.$notifier.showErrorMessage({
            content: e
          });
        }
      }
    }
  }
};
</script>
