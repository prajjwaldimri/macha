<template lang="pug">
  .editProfile
    v-banner
      v-avatar(slot="icon" size="40" color="primary")
        v-icon mdi-information-variant
      | You can change your profile picture by clicking on your photo above
    v-form(key="editProfileForm")
      v-container
        v-text-field(label="Name" clearable required v-model="name" @input="$v.name.$touch()" @blur="$v.name.$touch()" :error-messages="nameErrors" outlined :loading="isLoading")

        v-text-field(label="Age" clearable required v-model="age" @input="$v.age.$touch()" @blur="$v.age.$touch()" :error-messages="ageErrors" outlined :loading="isLoading")

        v-btn.mt-1(color="primary" block @click="updateProfile" :loading="isLoading") Update Profile

</template>

<script>
import profile from '~/gql/profile';
import updateUser from '~/gql/updateUser';

import { validationMixin } from 'vuelidate';
import {
  required,
  minLength,
  minValue,
  maxValue
} from 'vuelidate/lib/validators';

export default {
  mixins: [validationMixin],
  validations: {
    name: { required, minLength: minLength(3) },
    age: { required, minValue: minValue(13), maxValue: maxValue(99) }
  },
  data() {
    return {
      name: '',
      age: 13,
      isLoading: false
    };
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.minLength &&
        errors.push('Name must be more than 3 characters');
      !this.$v.name.required && errors.push('Name is required');
      return errors;
    },
    ageErrors() {
      const errors = [];
      if (!this.$v.age.$dirty) return errors;
      !this.$v.age.minValue && errors.push('Age must be between 13 and 99');
      !this.$v.age.maxValue && errors.push('Age must be between 13 and 99');
      return errors;
    }
  },
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
      try {
        this.isLoading = true;
        await this.$apollo
          .query({
            query: profile,
            fetchPolicy
          })
          .then(({ data }) => {
            this.age = data.me.age;
            this.name = data.me.name;
          });
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Unable to get profile details. Please refresh'
        });
      } finally {
        this.isLoading = false;
      }
    },
    async updateProfile() {
      try {
        this.$v.$touch();
        if (this.$v.name.$anyError || this.$v.age.$anyError) return;

        this.isLoading = true;

        await this.$apollo
          .mutate({
            mutation: updateUser,
            variables: {
              age: parseInt(this.age),
              name: this.name
            }
          })
          .then(({ data }) => {
            this.age = data.updateUser.age;
            this.name = data.updateUser.name;
          });
        this.refresh('network-only');
        this.$emit('detailsChanged');
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        this.$notifier.showErrorMessage({
          content: 'Unable to get update profile details.'
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>