<template lang="pug">
  .login(v-touch:swipe="swipeHandler")
    h1.display-2.macha-logo macha
    span.mt-2.mb-5
      span.subtitle(:class="{ 'grey--text': !isLogin }") SIGNIN
      span.subtitle.pl-2.pr-2 |
      span.subtitle(:class="{ 'grey--text': isLogin }") SIGNUP

    transition(name="fade" mode="out-in")
      v-form.mt-5.mb-5(v-if="isLogin" key="loginForm")
        v-container
          v-text-field(label="Username")
          v-text-field(label="Password" type="password")

          v-btn.mt-5(outlined color="primary" block) SIGN IN

      v-form.mt-5.mb-5(v-else key="signupForm")
        v-container
          v-text-field(label="Name")
          v-text-field(label="Username")
          v-text-field(label="Password" type="password")

          v-btn.mt-5(outlined color="primary" block) SIGN UP

    span.subtitle.grey--text.mt-5 Terms and Conditions
</template>

<script>
export default {
  data() {
    return {
      isLogin: true
    };
  },
  methods: {
    swipeHandler() {
      this.isLogin = !this.isLogin;
      // alert('Swiped');
    }
  }
};
</script>

<style lang="scss">
.login {
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.1rem;
}

h1.display-2.macha-logo {
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>