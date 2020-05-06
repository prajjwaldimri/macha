<template lang="pug">
  .feed
    .feed-container(v-if="true" style="margin-bottom:50px").pt-0.px-0.mx-0
      .px-0(v-for="(post, index) in posts" :key="post")
        ImagePost(v-if="postsType[index] === 'ImagePost'" :postId="post" @postDeleted="removePost(post)" @postUpdated="updatePost()")
        TextPost(v-else-if="postsType[index] === 'TextPost'" :postId="post" @postDeleted="removePost(post)" @postUpdated="updatePost()")
 
    v-progress-linear(v-intersect="onIntersect" indeterminate v-if="!isPostsEndingReached")
    bottomPoster( @refreshFeed="refresh('network-only')")
    v-tour(name="newPostTour" :steps="steps" :options="tourOptions" :callbacks="tourCallbacks")
    //- .no-post(v-else) No post yet

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
      finalTextPostId: '',
      finalImagePostId: '',
      finalVideoPostId: '',
      limit: 10,
      isPostsEndingReached: false,
      isFirstRender: true,
      steps: [
        {
          target: '[data-v-step="1"]',
          header: {
            title: "Let's get you familiar with macha"
          },
          content: 'You can post your status update by typing in this box.',
          params: {
            placement: 'top'
          }
        },
        {
          target: '[data-v-step="2"]',
          content: 'Press this button to add images to your posts',
          params: {
            placement: 'top'
          }
        },
        {
          target: '[data-v-step="3"]',
          content:
            'On the bottom navigation the second button loads the profile page',
          highlight: false,
          params: {
            placement: 'bottom'
          }
        },
        {
          target: '[data-v-step="4"]',
          content: 'To add friends click on this button'
        }
      ],
      tourOptions: {
        enabledButtons: {
          buttonSkip: false
        }
      },
      tourCallbacks: {
        onNextStep: this.onTourNextStep
      }
    };
  },
  async mounted() {
    await this.refresh();
    const ptr = PullToRefresh.init({
      mainElement: '.feed-container',
      onRefresh() {
        window.location.reload();
      }
    });
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
      try {
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
            if (!this.$cookies.get('homePageTourCompleted')) {
              this.$tours['newPostTour'].start();
            }
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Unable to fetch the feed. Please try again.'
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
    },
    async updatePost() {
      this.refresh('network-only');
    },
    onTourNextStep(currentStep) {
      if (currentStep === 2) {
        this.$router.push('/profile');
        this.$cookies.set('homePageTourCompleted', true, { maxAge: 99999999 });
      }
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
              query: getFeed,
              variables: {
                finalTextPostId: this.finalTextPostId,
                finalImagePostId: this.finalImagePostId,
                finalVideoPostId: this.finalVideoPostId,
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
          this.$store.dispatch('error/addError', e);
          this.$notifier.showErrorMessage({
            content: e.graphQLErrors[0].message
          });
        }
      }
    }
  }
};
</script>

<style lang="scss">
// Overrides for pulltorefresh.js
.ptr--ptr {
  box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12);
  pointer-events: none;
  font-size: 0.85em;
  font-weight: bold;
  top: 48px;
  height: 0;
  transition: height 0.3s, min-height 0.3s;
  text-align: center;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  align-content: stretch;
}

.ptr--text {
  margin-top: 0.33em;
  color: white !important;
}

.ptr--icon {
  color: white !important;
  transition: transform 0.3s;
}

.no-post {
  background-image: url('~assets/emptyState/noPost.svg');
  height: 100%;
  background-size: contain;
  padding-top: 70%;
  margin-top: 10%;
  margin-left: 15%;
  margin-right: 15%;
}
</style>
