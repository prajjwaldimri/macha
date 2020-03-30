<template lang="pug">
  div
    v-dialog(v-model="newTextDialog" width="75%" height="75%")
      v-card
        v-card-title.headline Creating new text post
        v-form(key="textPostForm").pt-2
          v-container(fluid).px-5
            v-textarea(v-model="textPost" clearable label="Text Post" required outlined :error-messages="textPostErrors" autofocus @input="$v.textPost.$touch()" @blur="$v.textPost.$touch()")
            v-btn(color="primary" @click="createTextPost" :disabled="$v.textPost.$anyError") POST

      v-dialog(v-model="newImageDialog" width="75%" height="75%")
        v-card
          v-card-title.headline Creating new image post
          v-form(key="imagePostForm").pt-2
            v-container(fluid).px-5
              v-text-field(v-model="imagePostCaption" clearable label="Caption" required outlined :error-messages="imagePostCaptionErrors" @input="$v.imagePostCaption.$touch()" @blur="$v.imagePostCaption.$touch()")
              v-btn(color="primary" @click="createImagePost") POST

    #newPostText.mb-3
      v-text-field(solo outlined label="What's new with you?" hide-details height="48").newPost
        v-btn(fab color="primary" x-small slot="prepend-inner")
          v-icon mdi-plus
        newPost(slot="append")
</template>

<style lang="scss">
#newPostText {
  display: flex;
  width: 90vw;
  position: fixed;
  bottom: 0;
  margin: auto;
  left: 0;
  right: 0;
}

#newPostText .v-input__control .v-input__slot .v-text-field__slot {
  padding: 12px;
}

#newPostText .v-input__control .v-input__slot .v-text-field__slot label {
  padding-left: 12px;
}

#newPostText .v-input__control .v-input__slot .v-input__append-inner,
#newPostText .v-input__control .v-input__slot .v-input__prepend-inner {
  margin: auto;
}
</style>


<script>
import newPost from './newPost';
import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';

import createTextPostMutation from '../../gql/createTextPost';
import createImagePostMutation from '../../gql/createImagePost';

export default {
  mixins: [validationMixin],
  validations: {
    textPost: { required, minLength: minLength(3) },
    imagePostCaption: { minLength: minLength(3) }
  },
  components: {
    newPost
  },
  data() {
    return {
      newTextDialog: false,
      newImageDialog: true,
      newVideoDialog: false,
      isTextPostValid: false,
      textPost: '',
      imagePostCaption: ''
    };
  },
  computed: {
    textPostErrors() {
      const errors = [];
      if (!this.$v.textPost.$dirty) return errors;
      !this.$v.textPost.minLength &&
        errors.push('Text post must be more than 3 characters');
      !this.$v.textPost.required && errors.push('Text post is required');
      return errors;
    }
  },
  methods: {
    async createTextPost() {
      this.$v.$touch();
      if (this.$v.textPost.$anyError) return;

      try {
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: e.graphQLErrors[0].message
        });
      }
    }
  }
};
</script>