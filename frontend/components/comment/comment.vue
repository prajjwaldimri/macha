<template lang="pug">
  .comment
    v-card( :loading="isCommentsLoading")
      v-list-item(dense v-if="comment.authorDetails")
        v-list-item-avatar(size="24").mr-2
          v-img(v-if="comment.authorDetails.profileImage" :src="comment.authorDetails.profileImage" aspect-ratio="1")
          v-icon(v-else large color="orange" left) mdi-halloween
        v-list-item-content
          v-list-item-title() {{comment.authorDetails.name}}
      v-text-field(v-if="editMode" dense  @input="$v.newContent.$touch()" @blur="$v.newContent.$touch()" :error-messages="newContentErrors" height="48" v-model="newContent" ).px-2
        v-btn(icon color="primary" x-small :loading="isCommentsLoading"  slot="append" @click="updateComment" )
          v-icon(size="24") mdi-send
      v-card-subtitle(v-else).py-0 {{comment.text}}
      v-card-actions.py-0.pl-3.mr-3
        v-spacer
        v-btn(icon v-if="editMode" :disabled="isCommentsLoading" @click="cancelEdit")
          v-icon(small) mdi-close-circle
        v-btn(icon v-if="comment.isCurrentUserAuthor && !editMode" :disabled="isCommentsLoading" @click="editMode= true")
          v-icon(small) mdi-pencil
        v-btn(icon v-if="comment.isCurrentUserAuthor" @click="deleteComment" color="error" :disabled="isCommentsLoading")
          v-icon(small) mdi-delete
        v-btn(v-if="comment.hasCurrentUserLikedComment" icon @click="toggleLikeComment" color="pink" left :disabled="isCommentsLoading" :loading="isLikeLoading")
          v-icon(small) mdi-heart
          span.pl-0  {{comment.likeCount}}
        v-btn(icon @click="toggleLikeComment" color="pink" :disabled="isCommentsLoading" :loading="isLikeLoading" v-else)
          v-icon(small) mdi-heart-outline
          span.pl-0  {{comment.likeCount}}
      v-divider.mx-4
    
</template>


<script>
import getComment from '../../gql/getComment';
import deleteComment from '../../gql/deleteComment';
import isCurrentUserLiker from '../../gql/isCurrentUserLiker';
import likeComment from '../../gql/likeComment';
import updateComment from '../../gql/updateComment';
import unlikeComment from '../../gql/unlikeComment';

import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {
  props: {
    commentId: String
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
      comment: {},
      isCommentsLoading: false,
      isLikeLoading: false,
      editMode: false,
      newContentErrors: '',
      newContent: ''
    };
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
      try {
        this.isCommentsLoading = true;
        await this.$apollo
          .query({
            query: getComment,
            variables: {
              commentId: this.commentId
            },
            fetchPolicy
          })
          .then(({ data }) => {
            this.comment = data.getComment;
            this.newContent = data.getComment.text;
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error loading your comments'
        });
      } finally {
        this.isCommentsLoading = false;
      }
    },
    async deleteComment() {
      try {
        this.isCommentsLoading = true;
        await this.$apollo.mutate({
          mutation: deleteComment,
          variables: {
            commentId: this.comment.id
          }
        });
        this.$emit('commentDeleted');
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error deleting your comment'
        });
      } finally {
        this.isCommentsLoading = false;
      }
    },
    async toggleLikeComment() {
      try {
        this.isLikeLoading = true;
        if (comment.hasCurrentUserLikedComment) {
          await this.$apollo.mutate({
            mutation: unlikeComment,
            variables: {
              commentId: this.comment.id
            }
          });
          comment.likeCount -= 1;
        } else {
          await this.$apollo.mutate({
            mutation: likeComment,
            variables: {
              commentId: this.comment.id
            }
          });
          comment.likeCount += 1;
        }
        comment.hasCurrentUserLikedComment = await this.$apollo
          .query({
            query: isCurrentUserLiker,
            variables: {
              identifier: this.comment.id
            },
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => data.isCurrentUserLiker);
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error chaging the status of like on the comment.'
        });
      } finally {
        this.isLikeLoading = false;
      }
    },
    async updateComment() {
      try {
        this.isCommentsLoading = true;
        await this.$apollo.mutate({
          mutation: updateComment,
          variables: {
            commentId: this.comment.id,
            text: this.newContent
          }
        });
        this.refresh('network-only');
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error updating your comment'
        });
      } finally {
        this.isCommentsLoading = false;
        this.editMode = false;
      }
    },
    async cancelEdit() {
      try {
        this.editMode = false;
        this.newContent = this.comment.text;
      } catch (e) {}
    }
  }
};
</script>

<style lang="scss">
#newComment {
  display: flex;
  width: 95vw;
  position: fixed;
  bottom: 27px;
  margin: auto;
  left: 0;
  right: 0;
}

#newComment .v-input__slot {
  padding-right: 10px;
}
</style>
