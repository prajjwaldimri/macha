<template lang="pug">
  .addMacha
    v-progress-circular(:color="color" indeterminate size="128" :width="7")
</template>

<style lang="scss">
.addMacha {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script>
import addMacha from '~/gql/addMacha';

export default {
  data() {
    return {
      color: 'success'
    };
  },
  async mounted() {
    try {
      await this.$apollo.mutate({
        mutation: addMacha,
        variables: {
          uniqueMachaId: this.$route.params.id
        }
      });
      this.color = 'success';
      this.$notifier.showSuccessMessage({
        content: 'Macha Added Successfully'
      });
      this.$router.push('/profile');
    } catch (e) {
      this.color = 'error';
      this.$notifier.showErrorMessage({
        content: 'Unable to add macha'
      });
      this.$router.push('/profile');
    }
  }
};
</script>