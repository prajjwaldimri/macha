<template lang="pug">
  v-speed-dial(v-model="newPost" transition="slide-x-reverse-transition" direction="left")
    template(v-slot:activator)
      v-btn(v-model="newPost" fab color="primary" x-small)
        v-icon(v-if="newPost") mdi-close
        v-icon(v-else) mdi-post

    v-btn(color="primary" x-small fab @click.stop="newTextDialog=true")
      v-icon mdi-file-document-box-plus
    v-btn(color="primary" x-small fab @click.stop="newImageDialog=true")
      v-icon mdi-image-plus
    v-btn(color="primary" x-small fab @click.stop="newVideoDialog=true")
      v-icon mdi-video-plus
</template>

<script>
export default {
  data() {
    return {
      newPost: false
    };
  }
};
</script>