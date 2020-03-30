<template lang="pug">
  div
    newImageDialog(:isVisible="newImageDialogVisible" @newImageDialogClosed="newImageDialogVisible=false")

    #newPostText.mb-3
      v-text-field(solo outlined label="What's new with you?" hide-details height="48").newPost
        v-btn(fab color="primary" x-small slot="prepend-inner" @click.stop="createTextPost")
          v-icon mdi-plus
        newPost(slot="append" @newImageDialogOpened="newImageDialogVisible=true")
</template>

<script>
import newPost from './newPost';
import newImageDialog from './newImageDialog';

import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';

import createTextPostMutation from '../../gql/createTextPost';
import createImagePostMutation from '../../gql/createImagePost';

export default {
  mixins: [validationMixin],
  validations: {
    imagePostCaption: { minLength: minLength(3) }
  },
  components: {
    newPost,
    newImageDialog
  },
  data() {
    return {
      newImageDialogVisible: false,
      newVideoDialogVisible: false,
      imagePostCaption: ''
    };
  },
  methods: {
    async createTextPost() {
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

<style lang="scss">
#newPostText {
  display: flex;
  width: 95vw;
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