<template lang="pug">
  v-container(fluid)
    v-progress-linear(indeterminate v-if="isLoading")
    v-row(v-else-if="imagePostExist")
      v-col(v-for="image in images" :key="image.image" class="d-flex child-flex" cols="4")
        v-card(flat tile @click="$router.push('/image/' + image.uri)").d-flex
          v-img(:src="image.image" :lazy-src="image.lazyImage" aspect-ratio="1" @click="$router.push('/image/' + image.uri)").grey.lighten-2
            template(v-slot:placeholder)
              v-row(align="center" justify="center").fill-height.ma-0
                v-progress-circular(indeterminate color="primary")
    .noPhotos(v-else style="display: flex; justify-content: center;").subtitle-2.pa-1 You have not posted any photos yet.
</template>

<script>
import getImagePostsOfUser from '../../gql/getImagePostsOfUser';

export default {
  async mounted() {
    try {
      this.isLoading = true;
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
          if (this.images.length > 0) {
            this.imagePostExist = true;
          }
        });
    } catch (e) {
      this.$store.dispatch('error/addError', e);
      this.$notifier.showErrorMessage({
        content: 'Not able to get the photos'
      });
    } finally {
        this.isLoading = false;
      }
  },
  data() {
    return {
      images: [],
      imagePostExist:false,
      isLoading: false
    };
  }
};
</script>