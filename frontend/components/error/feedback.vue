<template lang="pug">
  v-card
    .feedback
      span.title.pb-2 Oops we've encountered an error.
      v-textarea(outlined placeholder="Tell us what went wrong.." rows="3" clearable)
      v-btn(raised color="primary").mb-3 Submit
      span Logs
      span {{this.getSessionErrors}}
</template>

<script>
export default {
  computed: {
    getSessionErrors() {
      return this.$store.state.error.sessionErrors;
    }
  }
};
</script>

<style lang="scss">
.feedback {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 95vw;
  margin: auto;
  left: 0;
  right: 0;
}
</style>
