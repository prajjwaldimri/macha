<template lang="pug">
  v-container(fluid)
    v-card(:loading="isImageLoading" flat).ma-3
      v-list-item(v-if="imagePost.authorDetails" href="/profile" nuxt)
        v-list-item-avatar()
          img(:src="imagePost.authorDetails.profileImage")
        v-list-item-content
          v-list-item-title() {{imagePost.authorDetails.name}}
          v-list-item-subtitle() @{{imagePost.authorDetails.username}}
      v-img(:src="imagePost.image" height="450px" :lazy-src="imagePost.lazyImage")
        template(v-slot:placeholder)
          v-row(align="center" justify="center").fill-height.ma-0
            v-progress-circular(indeterminate color="primary")
      v-card-actions
        v-btn(icon v-if="imagePost.hasCurrentUserLikedImage" @click="toggleLikeImagePost" color="pink" :disabled="isImageLoading" :loading="isLikeLoading")
          v-icon mdi-heart
          span.pl-1 {{imagePost.likeCount}}
        v-btn(icon v-else @click="toggleLikeImagePost" color="pink" :disabled="isImageLoading" :loading="isLikeLoading")
          v-icon mdi-heart-outline
          span.pl-1 {{imagePost.likeCount}}
        v-btn(icon :disabled="isImageLoading")
          v-icon mdi-comment
        v-btn(icon :disabled="isImageLoading" @click="share")
          v-icon mdi-share
        v-spacer
        v-btn(icon v-if="imagePost.isCurrentUserAuthor" @click="deleteImagePost" color="error" :disabled="isImageLoading")
          v-icon mdi-delete

      v-card-subtitle.pt-0 {{imagePost.caption}}
</template>

<style lang="scss">
</style>

<script>
import getImagePost from '../../gql/getImagePost';
import likePost from '../../gql/likePost';
import unlikePost from '../../gql/unlikePost';
import isCurrentUserLiker from '../../gql/isCurrentUserLiker';
import deleteImagePost from '../../gql/deleteImagePost';

export default {
  props: {
    postId: String
  },
  async mounted() {
    await this.refresh();
  },
  data() {
    return {
      imagePost: {},
      isImageLoading: false,
      isLikeLoading: false
    };
  },
  methods: {
    async refresh() {
      try {
        this.isImageLoading = true;
        await this.$apollo
          .query({
            query: getImagePost,
            variables: {
              identifier: this.postId
            }
          })
          .then(({ data }) => {
            this.imagePost = data.getImagePost;
            const firstSlash =
              this.imagePost.image.indexOf('upload') + 'upload'.length + 1;
            const lastSlash = this.imagePost.image.lastIndexOf('/');
            this.imagePost.lazyImage = this.imagePost.image.replace(
              this.imagePost.image.slice(firstSlash, lastSlash),
              'w_0.1,h_0.1'
            );
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Error loading your image'
        });
      } finally {
        this.isImageLoading = false;
      }
    },
    async deleteImagePost() {
      try {
        this.isImageLoading = true;
        await this.$apollo
          .mutate({
            mutation: deleteImagePost,
            variables: {
              uri: this.imagePost.uri
            }
          })
          .then(({ data }) => {
            if (data.deleteImagePost) {
              this.$emit('postDeleted');
              this.$notifier.showSuccessMessage({
                content: 'Successfully deleted your image'
              });
            } else {
              this.$notifier.showErrorMessage({
                content: 'Error deleting your image'
              });
            }
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Error deleting your image'
        });
      } finally {
        this.isImageLoading = false;
      }
    },
    async toggleLikeImagePost() {
      try {
        this.isLikeLoading = true;
        if (this.imagePost.hasCurrentUserLikedImage) {
          await this.$apollo.mutate({
            mutation: unlikePost,
            variables: {
              postId: this.imagePost.id
            }
          });
        } else {
          await this.$apollo.mutate({
            mutation: likePost,
            variables: {
              postId: this.imagePost.id
            }
          });
        }
        this.imagePost.hasCurrentUserLikedImage = await this.$apollo
          .query({
            query: isCurrentUserLiker,
            variables: {
              identifier: this.imagePost.id
            }
          })
          .then(({ data }) => data.isCurrentUserLiker);
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Error chaging the status of like on the image.'
        });
      } finally {
        this.isLikeLoading = false;
      }
    },
    async share() {
      if (navigator.share) {
        await navigator.share({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/image/${this.imagePost.uri}`
        });
      } else {
        this.$sharer.showSheet({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/image/${this.imagePost.uri}`
        });
      }
    }
  }
};
</script>