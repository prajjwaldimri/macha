<template lang="pug">
  v-card(:loading="isImageLoading" flat)
    v-list-item(v-if="imagePost.authorDetails")
      v-list-item-avatar
        img(:src="imagePost.authorDetails.profileImage")
      v-list-item-content
        v-list-item-title {{imagePost.authorDetails.name}}
        v-list-item-subtitle @{{imagePost.authorDetails.username}}
    v-img(:src="imagePost.image" height="450px" :lazy-src="imagePost.lazyImage")
    v-card-actions
      v-btn(icon)
        v-icon mdi-heart
      v-btn(icon)
        v-icon mdi-comment
      v-btn(icon)
        v-icon mdi-share
      v-spacer
      v-btn(icon)
        v-icon mdi-delete

    v-card-subtitle.pt-0 {{imagePost.caption}}
</template>

<style lang="scss">
</style>

<script>
import getImagePost from '../../gql/getImagePost';

export default {
  async mounted() {
    try {
      this.isImageLoading = true;
      await this.$apollo
        .query({
          query: getImagePost,
          variables: {
            identifier: this.$route.params.id
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
    } finally {
      this.isImageLoading = false;
    }
  },
  data() {
    return {
      imagePost: {},
      isImageLoading: false
    };
  }
};
</script>