<template lang="pug">
  .login(v-touch:swipe.left="swipeHandler" v-touch:swipe.right="swipeHandler")
    h1.display-2.macha-logo macha
    span.mt-2.mb-5
      span.subtitle.cursor-pointer(:class="{ 'grey--text': !isLogin }" @click="isLogin = true") SIGNIN
      span.subtitle.pl-2.pr-2 |
      span.subtitle.cursor-pointer(:class="{ 'grey--text': isLogin }" @click="isLogin = false") SIGNUP

    transition(name="fade" mode="out-in")
      v-form.mt-5.mb-5(v-if="isLogin" key="loginForm")
        v-container
          v-text-field(label="Username" clearable required v-model="username"
          @input="$v.username.$touch()" @blur="$v.username.$touch()" :error-messages="usernameErrors")

          v-text-field(label="Password" type="password" hint="Should be more than 8 characters" counter :type="show1 ? 'text' : 'password'" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show1 = !show1" required v-model="password" @input="$v.password.$touch()" @blur="$v.password.$touch()" :error-messages="passwordErrors")

          v-btn.mt-5(outlined color="primary" block @click="login" :disabled="$v.username.$anyError || $v.password.$anyError") SIGN IN

      v-form.mt-5.mb-5(v-else key="signupForm")
        v-container
          v-text-field(label="Name" clearable required v-model="name" @input="$v.name.$touch()" @blur="$v.name.$touch()" :error-messages="nameErrors")

          v-text-field(label="Username" clearable required v-model="username" @input="$v.username.$touch()" @blur="$v.username.$touch()" :error-messages="usernameErrors")

          v-text-field(label="Password" type="password" hint="Should be more than 8 characters" counter :type="show2 ? 'text' : 'password'" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show2 = !show2" required v-model="password" @input="$v.password.$touch()" @blur="$v.password.$touch()" :error-messages="passwordErrors")

          v-btn.mt-5(outlined color="primary" block @click="signup") SIGN UP

    span.subtitle.grey--text.mt-5 Terms and Conditions
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';

import login from '~/gql/login';
import signup from '~/gql/signup';

export default {
  mixins: [validationMixin],
  validations: {
    name: { required, minLength: minLength(3) },
    username: { required, minLength: minLength(4) },
    password: { required, minLength: minLength(8) }
  },
  data() {
    return {
      isLogin: true,
      show1: false,
      show2: false,
      username: '',
      name: '',
      password: ''
    };
  },
  mounted() {
    const hasToken = !!this.$apolloHelpers.getToken();
    if (hasToken) {
      this.$notifier.showSuccessMessage({
        content: 'Already signed in'
      });
      this.$router.push('/');
    }
  },
  computed: {
    usernameErrors() {
      const errors = [];
      if (!this.$v.username.$dirty) return errors;
      !this.$v.username.minLength &&
        errors.push('Username must be more than 3 characters');
      !this.$v.username.required && errors.push('Username is required');
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.minLength &&
        errors.push('Password must be more than 8 characters');
      !this.$v.password.required && errors.push('Password is required');
      return errors;
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.minLength &&
        errors.push('Name must be more than 3 characters');
      !this.$v.name.required && errors.push('Name is required');
      return errors;
    }
  },
  methods: {
    swipeHandler() {
      this.isLogin = !this.isLogin;
    },

    async login() {
      this.$v.$touch();
      if (this.$v.username.$anyError || this.$v.password.$anyError) return;

      try {
        const token = await this.$apollo
          .mutate({
            mutation: login,
            variables: {
              username: this.username,
              password: this.password
            }
          })
          .then(({ data }) => data.login);
        await this.$apolloHelpers.onLogin(token);
        this.$router.push('/');
        this.$notifier.showSuccessMessage({
          content: 'Signed in successfully'
        });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: e.graphQLErrors[0].message
        });
      }
    },
    async signup() {
      this.$v.$touch();
      if (
        this.$v.username.$anyError ||
        this.$v.password.$anyError ||
        this.$v.name.$anyError
      ) {
        return;
      }

      try {
        await this.$apollo
          .mutate({
            mutation: signup,
            variables: {
              name: this.name,
              username: this.username,
              password: this.password
            }
          })
          .then(async ({ data }) => {
            await this.$apolloHelpers.onLogin(data.signup);
            this.$router.push('/');
            this.$notifier.showSuccessMessage({
              content: 'Account created successfully'
            });
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: e.graphQLErrors[0].message
        });
      }
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

.cursor-pointer {
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>