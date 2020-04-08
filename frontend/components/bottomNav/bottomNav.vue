<template lang="pug">
  div
    v-dialog(v-model="newImageDialogVisible" hide-overlay fullscreen )
      v-card(height="120%")
        v-form(key="imagePostForm").pt-2
          v-container.image-input-container.pa-0
            v-image-input(v-model="imageData" :imageQuality="0.99" clearable fullHeight fullWidth :imageHeight="550" :imageWidth="300" imageMinScaling="contain" :debounce="250" overlayPadding="0")
          v-container(fluid).py-2
            v-text-field(v-model="caption" clearable label="Caption" required outlined :error-messages="captionErrors" @input="$v.caption.$touch()" @blur="$v.caption.$touch()" small)
        v-toolbar(color="primary" bottom)
          v-btn(icon @click="newImageDialogVisible=false")
            v-icon mdi-close
          v-toolbar-title Posting Image
          v-spacer
          v-btn(outlined @click="createImagePost" :loading="newImageDialogLoading")
            | Post
            v-icon(small).pl-2 mdi-send

    #newPostText.mb-3
      v-text-field(outlined label="What's new with you?" hide-details height="48" v-model="caption" :error-messages="captionErrors" @input="$v.caption.$touch()" @blur="$v.caption.$touch()").newPost
        v-btn(fab color="primary" x-small slot="prepend-inner" @click.stop="createTextPost" nuxt to="/profile")
          v-avatar(v-if="user" size="32")
            img(:src="user.profileImage")
        newPostSpeedDial(slot="append" @newImageDialogOpened="newImageDialogVisible=true" @newTextPostCreation="createTextPost()")
</template>

<script>
import newPostSpeedDial from './newPostSpeedDial';

import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';

import createTextPostMutation from '../../gql/createTextPost';
import createImagePostMutation from '../../gql/createImagePost';
import profileQuery from '../../gql/profile';

export default {
  mixins: [validationMixin],
  validations: {
    caption: { minLength: minLength(3) }
  },
  components: {
    newPostSpeedDial
  },
  data() {
    return {
      newImageDialogVisible: false,
      newImageDialogLoading: false,
      newVideoDialogVisible: false,
      caption: '',
      captionErrors: '',
      imageData: '',
      user: {}
    };
  },
  async mounted() {
    try {
      const token = this.$apolloHelpers.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      this.user = await this.$apollo
        .query({
          query: profileQuery
        })
        .then(({ data }) => data.me);
      if (!this.user.profileImage) {
        this.user.profileImage = `https://api.adorable.io/avatars/128/${this.user.username}.png`;
      }
    } catch (e) {
      console.log(e);
      await this.$apolloHelpers.onLogout();
      this.$router.replace('/login');
      this.$notifier.showErrorMessage({
        content: 'Please login first'
      });
    }
  },
  methods: {
    async createTextPost() {
      try {
        await this.$apollo
          .mutate({
            mutation: createTextPostMutation,
            variables: {
              content: this.caption
            }
          })
          .then(() => {
            this.$notifier.showSuccessMessage({
              content: 'Post uploaded successfully'
            });
            this.caption = '';
          });
      } catch (e) {
        console.log(e);
        this.$notifier.showErrorMessage({
          content: e.graphQLErrors[0].message
        });
      }
    },
    async createImagePost() {
      try {
        this.newImageDialogLoading = true;
        await this.$apollo
          .mutate({
            mutation: createImagePostMutation,
            variables: {
              file: this.imageData,
              caption: this.caption
            }
          })
          .then(() => {
            this.$notifier.showSuccessMessage({
              content: 'Post uploaded successfully'
            });
          });
      } catch (e) {
        console.log(e);
        this.$notifier.showErrorMessage({
          content: e.graphQLErrors[0].message
        });
      } finally {
        this.newImageDialogVisible = false;
        this.newImageDialogLoading = false;
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

.image-input-container {
  height: 95vh;
  width: 100vw;
}
</style>