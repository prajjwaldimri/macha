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
          v-text-field(label="Username" clearable)
          v-text-field(label="Password" type="password" hint="Should be more than 8 characters" counter :type="show1 ? 'text' : 'password'" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show1 = !show1")

          v-btn.mt-5(outlined color="primary" block) SIGN IN

      v-form.mt-5.mb-5(v-else key="signupForm")
        v-container
          v-text-field(label="Name" clearable)
          v-text-field(label="Username" clearable)
          v-text-field(label="Password" type="password" hint="Should be more than 8 characters" counter :type="show2 ? 'text' : 'password'" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show2 = !show2")

          v-btn.mt-5(outlined color="primary" block) SIGN UP

    span.subtitle.grey--text.mt-5 Terms and Conditions
</template>

<script>
export default {
  data() {
    return {
      isLogin: true,
      show1: false,
      show2: false
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