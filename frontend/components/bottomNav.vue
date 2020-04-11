<template lang="pug">
  v-bottom-navigation(app grow color="primary" height="48")
    v-btn(to="/" nuxt)
      span Home
      v-icon mdi-home
    v-btn(to="/profile" nuxt)
      span Profile
      v-icon mdi-account-cog
</template>
