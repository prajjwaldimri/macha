<template lang="pug">
  .textPostSingle(style="margin-bottom: 56px")
    v-card(:loading="isTextPostLoading" flat outlined tile)
      v-list-item(v-if="textPost.authorDetails" href="/profile" nuxt)
        v-list-item-avatar()
          v-img(v-if="textPost.authorDetails.profileImage" :src="textPost.authorDetails.profileImage" aspect-ratio="1")
          v-icon(v-else large color="orange" left) mdi-halloween
        v-list-item-content
          v-list-item-title() {{textPost.authorDetails.name}}
          v-list-item-subtitle() @{{textPost.authorDetails.username}}
      v-card-subtitle(v-if="!editMode").pt-0.pb-2 {{textPost.content}}
      v-text-field( v-else="!editMode" dense  @input="$v.newContent.$touch()" @blur="$v.newContent.$touch()" :error-messages="newContentErrors" height="48" v-model="newContent").px-2
        v-btn(icon color="primary" x-small :loading="isTextPostLoading"  slot="append" @click="updateTextPost" )
          v-icon(size="24") mdi-send
      v-card-actions.pt-0.pl-4
        v-btn(v-if="textPost.hasCurrentUserLikedTextPost" icon @click="toggleLikeTextPost" color="pink" left :disabled="isTextPostLoading" :loading="isLikeLoading")
          v-icon mdi-heart
          span.pl-1 {{textPost.likeCount}}
        v-btn(icon @click="toggleLikeTextPost" color="pink" :disabled="isTextPostLoading" :loading="isLikeLoading" v-else)
          v-icon mdi-heart-outline
          span.pl-1 {{textPost.likeCount}}
        v-btn(icon v-if="textPost" :disabled="isTextPostLoading").pl-4
          v-icon mdi-comment
          span.pl-1 {{textPost.commentCount}}
        v-btn(icon :disabled="isTextPostLoading" @click="share")
          v-icon mdi-share
        v-spacer
        v-btn(icon v-if="editMode" :disabled="isTextPostLoading" @click="cancelEdit")
          v-icon mdi-close-circle
        v-btn(icon v-if="textPost.isCurrentUserAuthor && !editMode" :disabled="isTextPostLoading" @click="editMode= true")
          v-icon mdi-pencil
        v-btn(icon v-if="textPost.isCurrentUserAuthor" @click.stop="dialog = true" color="error" :disabled="isTextPostLoading")
          v-icon mdi-delete
        v-dialog(v-model="dialog")
          v-card
            v-card-title.subtitle-1 Are you sure you want to delete the post?
            v-card-actions 
              v-spacer
              v-btn(color="primary" outlined text @click="dialog = false") No
              v-btn(color="error" @click="dialog = false; deleteTextPost()") Yes
      postComments(v-if="textPost.id" :postId = "textPost.id" @commentCreated="textPost.commentCount += 1" @commentDeleted="textPost.commentCount -= 1")
</template>

<style lang="scss">
</style>

<script>
import getTextPost from '../../gql/getTextPost';
import likePost from '../../gql/likePost';
import unlikePost from '../../gql/unlikePost';
import isCurrentUserLiker from '../../gql/isCurrentUserLiker';
import deleteTextPost from '../../gql/deleteTextPost';
import updateTextPost from '../../gql/updateTextPost';
import postComments from '../../components/comment/postComments';

import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {
  components: {
    postComments
  },
  mixins: [validationMixin],
  validations: {
    newContent: { required: true }
  },
  async mounted() {
    await this.refresh();
  },
  data() {
    return {
      textPost: {},
      isTextPostLoading: false,
      isLikeLoading: false,
      editMode: false,
      newContentErrors: '',
      newContent: '',
      dialog: false
    };
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
      try {
        this.isTextPostLoading = true;
        await this.$apollo
          .query({
            query: getTextPost,
            variables: {
              identifier: this.$route.params.uri
            },
            fetchPolicy
          })
          .then(({ data }) => {
            this.textPost = data.getTextPost;
            this.newContent = data.getTextPost.content;
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error loading the post.'
        });
      } finally {
        this.isTextPostLoading = false;
      }
    },
    async deleteTextPost() {
      try {
        this.isTextPostLoading = true;
        await this.$apollo.mutate({
          mutation: deleteTextPost,
          variables: {
            uri: this.textPost.uri
          }
        });
        this.$router.replace('/');
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error deleting your text'
        });
      } finally {
        this.isTextPostLoading = false;
      }
    },
    async toggleLikeTextPost() {
      try {
        this.isLikeLoading = true;
        if (this.textPost.hasCurrentUserLikedTextPost) {
          await this.$apollo.mutate({
            mutation: unlikePost,
            variables: {
              postId: this.textPost.id
            }
          });
          this.textPost.likeCount -= 1;
        } else {
          await this.$apollo.mutate({
            mutation: likePost,
            variables: {
              postId: this.textPost.id
            }
          });
          this.textPost.likeCount += 1;
        }
        this.textPost.hasCurrentUserLikedTextPost = await this.$apollo
          .query({
            query: isCurrentUserLiker,
            variables: {
              identifier: this.textPost.id
            },
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => data.isCurrentUserLiker);
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error chaging the status of like on the image.'
        });
      } finally {
        this.isLikeLoading = false;
      }
    },
    async share() {
      if (navigator.share) {
        await navigator.share({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/text/${this.textPost.uri}`
        });
      } else {
        this.$sharer.showSheet({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/text/${this.textPost.uri}`
        });
      }
    },
    async updateTextPost() {
      try {
        this.isTextPostLoading = true;
        await this.$apollo.mutate({
          mutation: updateTextPost,
          variables: {
            uri: this.textPost.uri,
            content: this.newContent
          }
        });
        this.refresh('network-only');
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error updating your text'
        });
      } finally {
        this.isTextPostLoading = false;
        this.editMode = false;
      }
    },
    async cancelEdit() {
      try {
        this.editMode = false;
        this.newContent = this.textPost.content;
      } catch (e) {}
    }
  }
};
</script>