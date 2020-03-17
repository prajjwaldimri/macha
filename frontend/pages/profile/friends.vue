<template lang="pug">
v-list(flat two-line)
  v-list-item(v-for="macha in machas" :key="macha.username" @click="")
    v-list-item-avatar
      v-avatar
        img(src="https://cdn.vuetifyjs.com/images/john.jpg")

    v-list-item-content
      v-list-item-title(v-text="macha.name")
      v-list-item-subtitle(v-text="macha.username")

    v-list-item-action
      v-btn(icon)
        v-icon(color="error") mdi-account-multiple-remove
</template>

<script>
import getMachas from '~/gql/getMachas';

export default {
  data() {
    return {
      machas: [{ name: 'Hello', username: 'asiusaui' }]
    };
  },
  async mounted() {}
};
</script>