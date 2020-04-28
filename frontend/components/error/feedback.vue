<template lang="pug">
  v-card
    .feedback.pb-5.pt-3
      span.title Oops, we've encountered an error.
      v-banner.subtitle-2
        v-avatar(slot="icon" size="20" color="primary" )
          v-icon mdi-information-variant
        | Your logs will be attached with the feedback.
      v-form(key="editFeedbackForm")
        v-textarea(outlined placeholder="Tell us what went wrong.." rows="3" clearable v-model="msg")
        v-btn(block color="primary" @click="postFeedback" :loading="isFeedbackPosting") Submit 
</template>

<script>
import postFeedback from '../../gql/postFeedback.gql';

export default {
  data() {
    return {
      isFeedbackPosting: false,
      msg: ''
    };
  },
  computed: {
    getSessionErrors() {
      return this.$store.state.error.sessionErrors;
    }
  },
  methods: {
    async postFeedback() {
      try {
        this.isFeedbackPosting = true;
        await this.$apollo
          .mutate({
            mutation: postFeedback,
            variables: {
              log: this.getSessionErrors,
              message: this.msg
            }
          })
          .then(() => {
            this.$notifier.showSuccessMessage({
              content: 'Feedback posted successfully'
            });
            this.caption = '';
            this.$router.push('/');
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Error posting your feedback.'
        });
      } finally {
        this.isFeedbackPosting = false;
      }
    }
  }
};
</script>

<style lang="scss">
.feedback span {
  display: flex;
  justify-content: center;
  line-height: 0;
}
.feedback {
  width: 95vw;
  margin: auto;
  left: 0;
  right: 0;
}
</style>
