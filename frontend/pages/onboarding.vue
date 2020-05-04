<template lang="pug">
  v-card(height="100vh" light)
    v-carousel(:show-arrows="false" hide-delimiter-background delimiter-icon="mdi-circle-medium" height="93vh" light v-model="currentSlide")
      v-carousel-item(v-for="(slide,i) in slides" :key="i")
        v-row(align="center" justify="center" style="text-align:center").fill-height.flex-column.mx-4
          v-img(:src="slide.image" max-height="20rem" width="20rem" aspect-ratio="1" contain)
          .headline.font-weight-bold {{slide.heading}}
          .subtitle.py-3 {{slide.subtitle}}

    v-card-actions.py-0
      v-btn(v-if="currentSlide < slides.length - 1" text to="/login" nuxt @click="$cookies.set('onboardingDone', true, {maxAge: 99999999})" replace) SKIP
      v-spacer
      v-btn(v-if="currentSlide < slides.length - 1" text color="primary" @click="currentSlide += 1") NEXT
      v-btn(v-else to="/login" nuxt color="primary" @click="$cookies.set('onboardingDone', true, {maxAge: 99999999})" replace).px-4
        | START
        v-icon(small).pl-1 mdi-flag-checkered
</template>

<script>
export default {
  data() {
    return {
      currentSlide: 0,
      slides: [
        {
          image: require('assets/onboarding/welcome_cats.svg'),
          title: 'Welcome to macha.in',
          subtitle:
            'Swipe right to learn more about the features or click skip to directly get started'
        },
        {
          image: require('assets/onboarding/private_data.svg'),
          title: 'Truly private',
          subtitle:
            'You are the owner of your own data. No personal data is sold to any 3rd party'
        },
        {
          image: require('assets/onboarding/true_social.svg'),
          title: 'An actual social network',
          subtitle:
            'No creators or companies pushing their products or content to you. Only for you and your friends'
        },
        {
          image: require('assets/onboarding/social_network.svg'),
          title: 'Feature packed',
          subtitle:
            'All the good features from other social networks are already available. And new features are being integrated.'
        },
        {
          image: require('assets/onboarding/open_source.svg'),
          title: 'Open source',
          subtitle:
            'All the source code is open source and available publicly. You can shape the future of the website by contributing!'
        }
      ]
    };
  }
};
</script>

<style lang="scss">
.v-carousel__controls__item {
  height: 16px !important;
  width: 16px !important;
  margin: 0 2px !important;
}
</style>