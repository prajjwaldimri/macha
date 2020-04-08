<template lang="pug">
  v-speed-dial(v-model="newPost" transition="slide-x-reverse-transition" direction="left")
    template(v-slot:activator)
      v-btn(v-model="newPost" fab color="primary" x-small)
        v-icon(v-if="newPost") mdi-close
        v-icon(v-else) mdi-plus

    v-btn(color="primary" x-small fab @click.stop="$emit('newImageDialogOpened')")
      v-icon mdi-image-plus
    v-btn(color="primary" x-small fab @click.stop="newVideoDialog=true")
      v-icon mdi-video-plus
    v-btn(color="primary" x-small fab @click.stop="$emit('newTextPostCreation')")
      v-icon mdi-message-text
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