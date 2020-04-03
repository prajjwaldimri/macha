<template lang="pug">
  .image
    v-img(:src="imagePost.image").main-image
</template>

<style lang="scss">
.main-image {
  height: 75vh;
}
</style>

<script>
import getImagePost from '../../gql/getImagePost';

export default {
  async mounted() {
    this.imagePost = await this.$apollo
      .query({
        query: getImagePost,
        variables: {
          identifier: this.$route.params.id
        }
      })
      .then(({ data }) => data.getImagePost);
  },
  data() {
    return {
      imagePost: {}
    };
  }
};
</script>