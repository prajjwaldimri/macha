<template lang="pug">
  v-container(fluid)
    v-row
      v-col(v-for="image in images" :key="image.image" class="d-flex child-flex" cols="4")
        v-card(flat tile @click="$router.push('/image/' + image.uri)").d-flex
          v-img(:src="image.image" :lazy-src="image.lazyImage" aspect-ratio="1" @click="$router.push('/image/' + image.uri)").grey.lighten-2
            template(v-slot:placeholder)
              v-row(align="center" justify="center").fill-height.ma-0
                v-progress-circular(indeterminate color="primary")
</template>

<script>
import getImagePostsOfUser from '../../gql/getImagePostsOfUser';

export default {
  async mounted() {
    try {
      await this.$apollo
        .query({
          query: getImagePostsOfUser
        })
        .then(({ data }) => {
          let images = data.getImagePostsOfUser.imagePosts;
          for (let element of images) {
            // https://cloudinary.com/documentation/image_transformation_reference
            const firstSlash =
              element.image.indexOf('upload') + 'upload'.length + 1;
            const lastSlash = element.image.lastIndexOf('/');
            element.lazyImage = element.image.replace(
              element.image.slice(firstSlash, lastSlash),
              'w_0.1,h_0.1'
            );
          }
          this.images = images;
        });
    } catch (e) {
      this.$store.dispatch('error/addError', e);
      this.$notifier.showErrorMessage({
        content: e
      });
    }
  },
  data() {
    return {
      images: []
    };
  }
};
</script>