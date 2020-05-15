<template lang="pug">
  v-container.px-0
    v-card(:loading="isImageLoading" flat).mx-3
      v-list-item(v-if="imagePost.authorDetails" :to="'/user/' + imagePost.authorDetails.username" nuxt)
        v-list-item-avatar()
          v-img(v-if="imagePost.authorDetails.profileImage" :src="imagePost.authorDetails.profileImage" aspect-ratio="1")
          v-icon(v-else large color="orange" left) mdi-halloween
        v-list-item-content
          v-list-item-title() {{imagePost.authorDetails.name}}
          v-list-item-subtitle.d-flex.align-baseline
            span.body-2 @{{imagePost.authorDetails.username}}
            v-icon(x-small color="grey").ml-2 mdi-clock
            span.caption.ml-1 {{updatedAt}}
      v-img(:src="imagePost.image" max-height="450px" :lazy-src="imagePost.lazyImage" @click="$router.push('/image/'+ imagePost.uri)")
        template(v-slot:placeholder)
          v-row(align="center" justify="center").fill-height.ma-0
            v-progress-circular(indeterminate color="primary")
      v-card-actions
        v-btn(icon v-if="imagePost.hasCurrentUserLikedImage" @click="toggleLikeImagePost" color="pink" :disabled="isImageLoading" :loading="isLikeLoading")
          v-icon mdi-heart
          span.pl-1 {{imagePost.likeCount}}
        v-btn(icon v-else @click="toggleLikeImagePost" color="pink" :disabled="isImageLoading" :loading="isLikeLoading")
          v-icon mdi-heart-outline
          span.pl-1 {{imagePost.likeCount}}
        v-btn(icon v-if="imagePost" :disabled="isImageLoading" :to="'/image/' + imagePost.uri" nuxt).pl-4
          v-icon mdi-comment
          span.pl-1 {{imagePost.commentCount}}
        v-btn(icon :disabled="isImageLoading" @click="share")
          v-icon mdi-share
        v-spacer
        v-btn(icon v-if="editMode" :disabled="isImageLoading" @click="cancelEdit")
          v-icon mdi-close-circle
        v-btn(icon v-if="imagePost.isCurrentUserAuthor && !editMode" :disabled="isImageLoading" @click="editMode= true")
          v-icon mdi-pencil
        v-btn(icon v-if="imagePost.isCurrentUserAuthor" @click.stop="dialog = true" color="error" :disabled="isImageLoading")
          v-icon mdi-delete
        v-dialog(v-model="dialog")
          v-card
            v-card-title.subtitle-1 Are you sure you want to delete the post?
            v-card-actions 
              v-spacer
              v-btn(color="primary" outlined text @click="dialog = false") No
              v-btn(color="error" @click="dialog = false; deleteImagePost()") Yes

      v-card-subtitle(v-if="!editMode").pt-0 {{imagePost.caption}}
      v-text-field( v-else="!editMode" dense  @input="$v.newContent.$touch()" @blur="$v.newContent.$touch()" :error-messages="newContentErrors" height="48" v-model="newContent").px-2
        v-btn(icon color="primary" x-small :loading="isImageLoading"  slot="append" @click="updateImagePost" )
          v-icon(size="24") mdi-send
</template>

<script>
import getImagePost from '../../gql/getImagePost';
import likePost from '../../gql/likePost';
import unlikePost from '../../gql/unlikePost';
import isCurrentUserLiker from '../../gql/isCurrentUserLiker';
import deleteImagePost from '../../gql/deleteImagePost';
import updateImagePost from '../../gql/updateImagePost';

import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default {
  props: {
    postId: String,
  },
  mixins: [validationMixin],
  validations: {
    newContent: { required: true },
  },
  computed: {
    updatedAt() {
      return dayjs(parseInt(this.imagePost.updatedAt)).fromNow();
    },
  },
  async mounted() {
    await this.refresh();
  },
  data() {
    return {
      imagePost: {},
      isImageLoading: false,
      isLikeLoading: false,
      editMode: false,
      newContentErrors: '',
      newContent: '',
      dialog: false,
    };
  },
  methods: {
    async refresh() {
      try {
        this.isImageLoading = true;
        await this.$apollo
          .query({
            query: getImagePost,
            variables: {
              identifier: this.postId,
            },
          })
          .then(({ data }) => {
            this.imagePost = data.getImagePost;
            this.newContent = data.getImagePost.caption;
            const firstSlash =
              this.imagePost.image.indexOf('upload') + 'upload'.length + 1;
            const lastSlash = this.imagePost.image.lastIndexOf('/');
            this.imagePost.lazyImage = this.imagePost.image.replace(
              this.imagePost.image.slice(firstSlash, lastSlash),
              'w_0.1,h_0.1'
            );
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error loading the post.',
        });
      } finally {
        this.isImageLoading = false;
      }
    },
    async deleteImagePost() {
      try {
        this.isImageLoading = true;
        await this.$apollo
          .mutate({
            mutation: deleteImagePost,
            variables: {
              uri: this.imagePost.uri,
            },
          })
          .then(({ data }) => {
            if (data.deleteImagePost) {
              this.$emit('postDeleted');
              this.$notifier.showSuccessMessage({
                content: 'Successfully deleted your image',
              });
            } else {
              this.$notifier.showErrorMessage({
                content: 'Error deleting your image',
              });
            }
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error deleting your image',
        });
      } finally {
        this.isImageLoading = false;
      }
    },
    async toggleLikeImagePost() {
      try {
        this.isLikeLoading = true;
        if (this.imagePost.hasCurrentUserLikedImage) {
          await this.$apollo.mutate({
            mutation: unlikePost,
            variables: {
              postId: this.imagePost.id,
            },
          });
          this.imagePost.likeCount -= 1;
        } else {
          await this.$apollo.mutate({
            mutation: likePost,
            variables: {
              postId: this.imagePost.id,
            },
          });
          this.imagePost.likeCount += 1;
        }
        this.imagePost.hasCurrentUserLikedImage = await this.$apollo
          .query({
            query: isCurrentUserLiker,
            variables: {
              identifier: this.imagePost.id,
            },
            fetchPolicy: 'network-only',
          })
          .then(({ data }) => data.isCurrentUserLiker);
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error chaging the status of like on the image.',
        });
      } finally {
        this.isLikeLoading = false;
      }
    },
    async share() {
      if (navigator.share) {
        await navigator.share({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/image/${this.imagePost.uri}`,
        });
      } else {
        this.$sharer.showSheet({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/image/${this.imagePost.uri}`,
        });
      }
    },
    async updateImagePost() {
      try {
        this.isImageLoading = true;
        await this.$apollo.mutate({
          mutation: updateImagePost,
          variables: {
            uri: this.imagePost.uri,
            caption: this.newContent,
          },
        });
        this.refresh('network-only');
        this.$emit('postUpdated');
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error updating your image',
        });
      } finally {
        this.isImageLoading = false;
        this.editMode = false;
      }
    },
    async cancelEdit() {
      try {
        this.editMode = false;
        this.newContent = this.imagePost.caption;
      } catch (e) {}
    },
  },
};
</script>
