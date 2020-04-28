<template lang="pug">
  #notFound
    div.makeCenter
      span 404
      p Seems like you are lost. 
      p Don't worry! We've got you covered.
      NuxtLink(to='/').homeButton
        v-btn(raised color="primary") 
          .homeText
            | GO HOME
    
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
#notFound span {
  display: flex;
  font-size: 100pt;
  font-weight: bolder;
  justify-content: center;
  color: #ffffff;
}
#notFound p {
  display: flex;
  font-size: 10pt;
  font-weight: bolder;
  justify-content: center;
  color: #ffffff;
  line-height: 0pt;
}
#notFound .homeButton {
  display: flex;
  justify-content: center;
  text-decoration: none;
  padding-top: 12px;
}
#notFound .homeButton .homeText {
  color: black;
  text-decoration: none;
}
#notFound {
  position: relative;
  background-image: url('~assets/art.jpg');
  height: 100vh;
  background-size: cover;
  background-position: center;
  font-family: 'Special Elite', cursive;
}
#notFound::before {
  content: '';
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  background-color: rgba(0, 0, 0, 0.3);
}
.makeCenter {
  position: fixed;
  top: 50%;
  left: 50%;
  width: auto;
  height: auto;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
