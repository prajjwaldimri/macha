<template lang="pug">
  v-bottom-navigation(app shift grow color="primary" height="48")
    v-btn(to="/" nuxt)
      span Home
      v-icon mdi-home
    v-btn(to="/profile" nuxt)
      span Profile
      v-icon mdi-account-cog
    v-btn(to="/notifications" nuxt)
      span Notifications
      v-icon mdi-bell
    v-btn(to="/feedback" nuxt)
      span Feedback
      v-icon mdi-comment-quote-outline
</template>
