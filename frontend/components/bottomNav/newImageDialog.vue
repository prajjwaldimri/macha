<template lang="pug">
  v-dialog(v-model="isDialogVisible" width="75%" height="75%" @click:outside="$emit('newImageDialogClosed')")
    v-card
      v-card-title.headline Creating new image post
      v-form(key="imagePostForm").pt-2
        v-container(fluid).px-5
          v-text-field(v-model="imagePostCaption" clearable label="Caption" required outlined :error-messages="imagePostCaptionErrors" @input="$v.imagePostCaption.$touch()" @blur="$v.imagePostCaption.$touch()")
          v-btn(color="primary" @click="createImagePost") POST
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';

export default {
  mixins: [validationMixin],
  validations: {
    imagePostCaption: { minLength: minLength(3) }
  },
  props: {
    isVisible: Boolean
  },
  data() {
    return {
      // https://vuejs.org/v2/guide/components-props.html#One-Way-Data-Flow
      isDialogVisible: this.isVisible,
      imagePostCaption: '',
      imagePostCaptionErrors: ''
    };
  },
  methods: {
    async createImagePost() {}
  },
  watch: {
    // https://vuejs.org/v2/api/#watch
    isVisible: {
      immediate: true,
      handler(value) {
        this.isDialogVisible = this.isVisible;
      }
    }
  }
};
</script>