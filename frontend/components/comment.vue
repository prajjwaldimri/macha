<template lang="pug">
  .comment
    v-card(v-for='comment in comments' :key='comment.id' :loading="isCommentsLoading" flat )
      v-list-item(dense)
        v-list-item-avatar(size="24").mr-2
          v-img(v-if="comment.authorDetails.profileImage" :src="comment.authorDetails.profileImage" aspect-ratio="1")
          v-icon(v-else large color="orange" left) mdi-halloween
        v-list-item-content
          v-list-item-title() {{comment.authorDetails.name}}
      v-text-field(v-if="editMode && comment.id === beingEditedComment" dense  @input="$v.newContent.$touch()" @blur="$v.newContent.$touch()" :error-messages="newContentErrors" height="48" v-model="newContent" ).px-2
        v-btn(icon color="primary" x-small :loading="isCommentsLoading"  slot="append" @click="updateComment(comment)" )
          v-icon(size="24") mdi-send
      v-card-subtitle(v-else).py-0 {{comment.text}}
      v-card-actions.py-0.pl-3.mr-3
        v-spacer
        v-btn(icon v-if="editMode && beingEditedComment === comment.id" :disabled="isCommentsLoading" @click="cancelEdit(comment.text)")
          v-icon(small) mdi-close-circle
        v-btn(icon v-if="comment.isCurrentUserAuthor && !editMode" :disabled="isCommentsLoading" @click="editMode= true; beingEditedComment= comment.id")
          v-icon(small) mdi-pencil
        v-btn(icon v-if="comment.isCurrentUserAuthor" @click="deleteComment(comment.id)" color="error" :disabled="isCommentsLoading")
          v-icon(small) mdi-delete
        v-btn(v-if="comment.hasCurrentUserLikedComment" icon @click="toggleLikeComment(comment)" color="pink" left :disabled="isCommentsLoading" :loading="isLikeLoading")
          v-icon(small) mdi-heart
          span.pl-0  {{comment.likeCount}}
        v-btn(icon @click="toggleLikeComment(comment)" color="pink" :disabled="isCommentsLoading" :loading="isLikeLoading" v-else)
          v-icon(small) mdi-heart-outline
          span.pl-0  {{comment.likeCount}}
      v-divider.mx-4
    #newComment
      v-text-field( placeholder="Add a comment" outlined rounded solo dense v-model="caption" @input="$v.caption.$touch()" @blur="$v.caption.$touch()" :loading="isLoading" :error-messages="captionErrors" height="48")
        v-btn(icon x-small slot="prepend-inner"  nuxt to="/profile" :loading="isLoading")
          v-list-item-avatar(v-if="user" size="32")
            v-img(v-if="user.profileImage" :src="user.profileImage" aspect-ratio="1")
            v-icon(v-else large color="orange" right) mdi-halloween
        v-btn(icon color="primary" x-small slot="append" @click="createComment")
          v-icon(size="24") mdi-send
</template>


<script>
import getCommentsForThePost from '../gql/getCommentsForThePost';
import deleteComment from '../gql/deleteComment';
import isCurrentUserLiker from '../gql/isCurrentUserLiker';
import likeComment from '../gql/likeComment';
import updateComment from '../gql/updateComment';
import unlikeComment from '../gql/unlikeComment';
import createComment from '../gql/createComment';
import profileQuery from '../gql/profile';

import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {
  props: {
    postId: String
  },
  mixins: [validationMixin],
  validations: {
    caption: { required: true },
    newContent: { required: true }
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
      // if (!this.user.profileImage) {
      //   this.user.profileImage = `https://api.adorable.io/avatars/128/${this.user.username}.png`;
      // }
    } catch (e) {
      this.$store.dispatch('error/addError', e);
      await this.$apolloHelpers.onLogout();
      this.$router.replace('/login');
      this.$notifier.showErrorMessage({
        content: 'Please login first'
      });
    }
    await this.refresh();
  },
  data() {
    return {
      comments: [],
      user: {},
      skip: 0,
      limit: 15,
      isCommentsLoading: false,
      isLikeLoading: false,
      isLoading: false,
      caption: '',
      captionErrors: '',
      editMode: false,
      newContentErrors: '',
      newContent: '',
      beingEditedComment: ''
    };
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
      try {
        this.isCommentsLoading = true;
        await this.$apollo
          .query({
            query: getCommentsForThePost,
            variables: {
              skip: this.skip,
              limit: this.limit,
              postId: this.postId
            },
            fetchPolicy
          })
          .then(({ data }) => {
            this.comments = data.getCommentsForThePost.comments;
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
    async deleteComment(commentId) {
      try {
        this.isCommentsLoading = true;
        await this.$apollo.mutate({
          mutation: deleteComment,
          variables: {
            commentId: commentId
          }
        });
        this.refresh('network-only');
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
    async toggleLikeComment(comment) {
      try {
        this.isLikeLoading = true;
        if (comment.hasCurrentUserLikedComment) {
          await this.$apollo.mutate({
            mutation: unlikeComment,
            variables: {
              commentId: comment.id
            }
          });
          comment.likeCount -= 1;
        } else {
          await this.$apollo.mutate({
            mutation: likeComment,
            variables: {
              commentId: comment.id
            }
          });
          comment.likeCount += 1;
        }
        comment.hasCurrentUserLikedComment = await this.$apollo
          .query({
            query: isCurrentUserLiker,
            variables: {
              identifier: comment.id
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
    async createComment() {
      try {
        this.isLoading = true;
        await this.$apollo
          .mutate({
            mutation: createComment,
            variables: {
              postId: this.postId,
              text: this.caption
            }
          })
          .then(() => {
            this.$notifier.showSuccessMessage({
              content: 'Comment posted successfully'
            });
            this.caption = '';
            this.$emit('commentCreated');
            this.refresh('network-only');
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Comment cannot be empty'
        });
      } finally {
        this.isLoading = false;
      }
    },
    // Don't send complete comment object. Just send id.
    // This approach has so many problems because we are trying to update one element in array and then detecting which element is being edited, then detecting which text was in which element. What if one user has multiple comments? How to track which new text is which comment's. Best approach is to separate comment into individual components.
    async updateComment(comment) {
      try {
        this.isCommentsLoading = true;
        await this.$apollo.mutate({
          mutation: updateComment,
          variables: {
            commentId: comment.id,
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
    async cancelEdit(commentText) {
      try {
        this.editMode = false;
        this.beingEditedComment= '';
        this.newContent = commentText;
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
