<template lang="pug">
  .bottomPoster
    v-dialog(v-model="newImageDialogVisible" hide-overlay fullscreen )
      v-card(max-height="500%")
        v-toolbar(top)
          v-btn(icon @click="newImageDialogVisible=false")
            v-icon mdi-close
          v-toolbar-title Posting Image
          v-spacer
          v-btn(outlined @click="createImagePost" :loading="newImageDialogLoading")
            | Post
            v-icon(small).pl-2 mdi-send
        v-form(key="imagePostForm").pt-2
          v-container(fluid).px-4
            v-file-input(accept="image/*" placeholder="First pick an image by clicking here" prepend-icon="mdi-camera" label="Image" outlined ref="imageInput" @change="setImage" show-size :clearable="false" :disabled="newImageDialogLoading" :loading="newImageDialogLoading")
          v-container.image-input-container.pa-0
            VueCropper(ref="cropper" :src="imageData" :zoomOnWheel="false" :zoomOnTouch="false" :minCropBoxWidth="100" :minCropBoxHeight="100")
            v-container(fluid)
              v-row.px-3.justify-center
                v-btn(icon tile @click.prevent="zoom(0.2)")
                  v-icon mdi-magnify-plus-outline
                v-divider(vertical)
                v-btn(icon tile @click.prevent="zoom(-0.2)")
                  v-icon mdi-magnify-minus-outline
                v-divider(vertical)
                v-btn(icon tile @click.prevent="rotate(-90)")
                  v-icon mdi-rotate-left
                v-divider(vertical)
                v-btn(icon tile @click.prevent="rotate(90)")
                  v-icon mdi-rotate-right
          v-container(fluid).py-2
            v-text-field(v-model="caption" clearable label="Caption" required outlined :error-messages="captionErrors" @input="$v.caption.$touch()" @blur="$v.caption.$touch()" small :disabled="newImageDialogLoading" :loading="newImageDialogLoading")
        v-toolbar(color="primary" bottom)
          v-btn(icon @click="newImageDialogVisible=false")
            v-icon mdi-close
          v-toolbar-title Posting Image
          v-spacer
          v-btn(outlined @click="createImagePost" :loading="newImageDialogLoading")
            | Post
            v-icon(small).pl-2 mdi-send

    #newPostText.mb-3
      v-text-field(outlined rounded solo dense label="What's new with you?" hide-details height="48" v-model="caption" :error-messages="captionErrors" @input="$v.caption.$touch()" @blur="$v.caption.$touch()" :loading="isLoading").newPost
        v-btn(icon x-small slot="prepend-inner" nuxt to="/profile" :loading="isLoading")
          v-list-item-avatar(v-if="user" size="32")
            v-img(v-if="user.profileImage" :src="user.profileImage" aspect-ratio="1")
            v-icon(v-else large color="orange" right) mdi-halloween
        newPostSpeedDial(slot="append" @newImageDialogOpened="newImageDialogVisible=true" @newTextPostCreation="createTextPost()" :newPostStatus.sync="newPostButtonStatus")
</template>

<script>
import newPostSpeedDial from './newPostSpeedDial';

import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';

import createTextPostMutation from '../../gql/createTextPost';
import createImagePostMutation from '../../gql/createImagePost';
import profileQuery from '../../gql/profile';

import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
  mixins: [validationMixin],
  validations: {
    caption: { minLength: minLength(3) }
  },
  components: {
    newPostSpeedDial,
    VueCropper
  },
  data() {
    return {
      newImageDialogVisible: false,
      newImageDialogLoading: false,
      newVideoDialogVisible: false,
      caption: '',
      captionErrors: '',
      imageData: '',
      user: {},
      isLoading: false,
      newPostButtonStatus: false
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

    } catch (e) {
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
        this.isLoading = true;
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
            this.$emit('refreshFeed');
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: e.graphQLErrors[0].message
        });
      } finally {
        this.isLoading = false;
        this.newPostButtonStatus = false;
      }
    },
    async createImagePost() {
      try {
        this.isLoading = true;
        this.newImageDialogLoading = true;
        await this.$apollo
          .mutate({
            mutation: createImagePostMutation,
            variables: {
              file: this.$refs.cropper.getCroppedCanvas().toDataURL(),
              caption: this.caption
            }
          })
          .then(() => {
            this.$notifier.showSuccessMessage({
              content: 'Post uploaded successfully'
            });
            this.caption = '';
            this.$emit('refreshFeed');
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: e.graphQLErrors[0].message
        });
      } finally {
        this.newImageDialogVisible = false;
        this.newImageDialogLoading = false;
        this.isLoading = false;
        this.newPostButtonStatus = false;
      }
    },
    setImage(file){
      if(!file){
        return;
      }
      if(file.type.indexOf('image/') === -1){
        this.$notifier.showErrorMessage({
          content: "Please select a correct image file"
        });
      }

      if(typeof FileReader === 'function'){
        const reader = new FileReader();
        reader.onload = (event) => {
          this.imgData = event.target.result;
          this.$refs.cropper.replace(event.target.result);
        }

        reader.readAsDataURL(file);
      } else{
        this.$notifier.showErrorMessage({
          content: "Sorry. Your browser doesn't support file uploading"
        });
      }
    },
    rotate(deg) {
      this.$refs.cropper.rotate(deg);
    },
    zoom(percent) {
      this.$refs.cropper.relativeZoom(percent);
    },
  }
};
</script>

<style lang="scss">
#newPostText {
  display: flex;
  width: 95vw;
  position: fixed;
  bottom: 42px;
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
  // height: 55vh;
  width: 100vw;
}
#newPostText .v-input__slot {
  padding-right: 10px;
}
</style>