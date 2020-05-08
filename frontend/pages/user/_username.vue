<template lang="pug">
  div
    .noPostExist(v-if="noPostYet") 
      .noPostExistImage
      p This user has no post yet.   
    v-container(fluid style="padding-bottom:50px").pt-0
      v-row(v-for="(post, index) in posts" :key="post")
        ImagePost(v-if="postsType[index] === 'ImagePost'" :postId="post")
        TextPost(v-else-if="postsType[index] === 'TextPost'" :postId="post")
    v-progress-linear(v-intersect="onIntersect" indeterminate v-if="!isPostsEndingReached" v-show="!noPostYet")
    .all-caught-up(v-else v-show="!noPostYet").pb-12
      p You are all caught up.
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
      finalTextPostId: '',
      finalImagePostId: '',
      finalVideoPostId: '',
      limit: 10,
      isPostsEndingReached: false,
      isFirstRender: true,
      noPostYet: false,
    };
  },
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
      try {
        await this.$apollo
          .query({
            query: getFeedOfOneUser,
            variables: {
              limit: this.limit,
              username: this.$route.params.username
            },
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => {
            this.posts = data.getFeedOfOneUser.posts;
            this.postsType = data.getFeedOfOneUser.postsType;
            if(data.getFeedOfOneUser.posts.length <= 0){
              this.noPostYet = true;
            }
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        error();
        this.$notifier.showErrorMessage({
          content:
            'Unable to fetch the feed of the user. Please try again after some time.'
        });
      }
    },
    onIntersect(entries, observer) {
      this.isIntersecting = entries[0].isIntersecting;
    }
  },
  watch: {
    async isIntersecting(val) {
      if (this.isFirstRender) {
        this.isFirstRender = false;
        return;
      }
      if (val) {
        // Get the id of the last posts in each category
        this.finalTextPostId = this.posts[
          this.postsType.lastIndexOf('TextPost')
        ];
        this.finalImagePostId = this.posts[
          this.postsType.lastIndexOf('ImagePost')
        ];
        this.finalVideoPostId = this.posts[
          this.postsType.lastIndexOf('VideoPost')
        ];
        try {
          await this.$apollo
            .query({
              query: getFeedOfOneUser,
              variables: {
                finalTextPostId: this.finalTextPostId,
                finalImagePostId: this.finalImagePostId,
                finalVideoPostId: this.finalVideoPostId,
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
          this.$store.dispatch('error/addError', e);
          this.$notifier.showErrorMessage({
            content: 'Unable to fetch the feed of the user.'
          });
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.noPostExist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 35%;
}
.noPostExist .noPostExistImage {
  display: flex;
  background-image: url('~assets/emptyState/noPost.svg');
  height: 100%;
  width: 80%;
  background-size: contain;
  padding-top: 70%;
  margin-top: 10%;
}
.noPostExist p {
  display: flex;
  line-height: 0pt;
}
.all-caught-up {
  background-image: url('~assets/emptyState/caughtUp.svg');
  background-size: contain;
  padding-top: 50%;
  margin-left: 15%;
  margin-right: 15%;
}
.all-caught-up p {
  display: flex;
  justify-content: center;
}
</style>