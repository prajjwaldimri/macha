<template lang="pug">
  .postComment
    v-card(v-for='comment in comments' :key='comment.id' :loading="isCommentsLoading" flat )
      comment(:commentId= "comment.id" @commentDeleted="refresh('network-only'); $emit('commentDeleted')")
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
import getCommentsForThePost from '../../gql/getCommentsForThePost';
import createComment from '../../gql/createComment';
import profileQuery from '../../gql/profile';
import comment from './comment'

import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {
  props: {
    postId: String
  },
  components:{
    comment
  },
  mixins: [validationMixin],
  validations: {
    caption: { required: true }
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
      isLoading: false,
      caption: '',
      captionErrors: '',
      
      
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