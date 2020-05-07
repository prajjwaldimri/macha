<template lang="pug">
  #notFound
    div
      p(style="padding-top: 30vh;") Seems like you are lost. 
      p Don't worry! We've got you covered.
      NuxtLink(to='/').homeButton
        v-btn(raised color="primary") 
          | GO HOME
    
</template>

<style lang="scss" scoped>
#notFound p {
  display: flex;
  font-size: 10pt;
  font-weight: bolder;
  justify-content: center;
  line-height: 0pt;
  letter-spacing: 0.8pt;
}
#notFound .homeButton {
  display: flex;
  justify-content: center;
  text-decoration: none;
  padding-top: 12px;
}
#notFound {
  background-image: url('~assets/notFound.svg');
  height: 100%;
  margin-top: 20vh;
  background-size: contain;
}
</style>
