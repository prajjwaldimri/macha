<template lang="pug">
  .profile(v-touch:swipe="swipeHandler" v-touch-options="{swipeTolerance: 1}")
    v-dialog(v-model="changeProfilePictureDialog")
      v-card(max-height="100%" :loading="isProfileImageLoading")
        v-container.px-0
          v-row.justify-center
            v-btn(@click="changeProfilePicture" color="primary" :loading="isProfileImageLoading") Change Profile Picture
          VueCropper(ref="profileCropper" :src="profileImage" :zoomOnWheel="false" :zoomOnTouch="false" :minCropBoxWidth="80" :minCropBoxHeight="100" :aspectRatio="1" dragMode="move" style="max-height: 400px").pt-2

    v-toolbar(prominent flat height="120")
      input(type="file" accept="image/*" ref="profilePicture" label="Profile picture input" style="display:none" @change="setNewProfilePicture")
      .top-profile
        v-avatar(size="80" @click="$refs.profilePicture.click()")
          v-progress-circular(v-if="isProfileImageLoading" indeterminate)
          v-img(v-else-if="user.profileImage" :src="user.profileImage")
          v-icon(v-else size="80" color="orange" ) mdi-halloween
        .column.ml-4
          span.title {{user.name}}
          span.subtitle @{{user.username}}

      template(v-slot:extension)
        v-tabs(v-model="tab" grow show-arrows center-active)
          v-tab(key="1") Profile
          v-tab(key="2") Machas
          v-tab(key="3") Settings
          v-tab(key="4") Texts
          v-tab(key="5") Photos

          v-tab-item(key="1")
            EditProfile(@detailsChanged="refresh('network-only')")
          v-tab-item(key="2")
            Friends
          v-tab-item(key="3")
            Settings
          v-tab-item(key="4")
            Texts
          v-tab-item(key="5")
            Photos

    v-speed-dial(v-model="fab" bottom right fixed transition="slide-y-reverse-transition" style="bottom: 52px;" data-v-step="4")
      template(v-slot:activator)
        v-btn(v-model="fab" fab color="primary" @click="tourStepIncrementer" )
          v-icon(v-if="fab") mdi-close
          v-icon(v-else) mdi-plus

      v-btn(color="primary" fab @click.stop="addDialog=true; fab=false;" data-v-step="5")
        v-icon mdi-account-multiple-plus
      v-btn(color="primary" fab @click.stop="scanDialog=true; fab=false;")
        v-icon mdi-qrcode-scan

    v-dialog(v-model="scanDialog" :visibility="scanVisibility" width="85%" height="85%")
      v-card
        v-card-title.headline QR Scanner
        v-card-text You can quickly add a macha by scanning the QR code on their mobile screen
        v-btn(@click="camera='auto'" block) Scan QR Code
        qrcode-stream(:camera="camera" @decode="onQRDecode")


    v-tour(name="newFriendTour" :steps="steps" :options="tourOptions" :callbacks="tourCallbacks" ref="newFriendTour")

    v-dialog(v-model="addDialog" width="85%" height="85%")
      v-card
        v-overlay(absolute :value="generatingUrl")
          v-progress-circular(indeterminate size="64")

        v-card-title.headline Add a Macha
        v-card-text You can add a macha by sharing them your link or asking them to scan your QR Code.

        v-card-text Send this link to your friend
        v-row(justify="center")
          v-btn(@click="share" outlined small)
            v-icon(small).mr-2 mdi-share
            | Share your link
        h3(style="text-align: center").heading.mt-3.mb-2 OR
        v-card-text Scan this QR Code from your friend's device
        .qr-code.mb-4
          v-img(:src="qrUrl" max-height="128" max-width="128" aspect-ratio="1")

        v-card-actions
          v-btn(@click="refreshUrl" small outlined :loading="generatingUrl")
            v-icon(small).mr-2 mdi-refresh
            | Generate new link
          v-spacer
          v-btn(@click="addDialog = false" color="success" small)
            v-icon(small).mr-2 mdi-check
            | Done

</template>

<script>
import profile from '~/gql/profile';
import resetUniqueMachaId from '~/gql/resetUniqueMachaId';
import changeProfilePictureMutation from '~/gql/changeProfilePicture';

import qrcode from 'qrcode';

import Friends from './friends.vue';
import Photos from './photos.vue';
import Texts from './texts.vue';
import Settings from './settings.vue';
import EditProfile from './editProfile.vue';

import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
  components: {
    Friends,
    Texts,
    Photos,
    Settings,
    EditProfile,
    VueCropper
  },
  data() {
    return {
      tab: '1',
      user: {},
      addDialog: false,
      scanDialog: false,
      qrUrl: '',
      fab: false,
      generatingUrl: false,
      scanVisibility: false,
      camera: 'off',
      profileImage: '',
      isProfileImageLoading: false,
      changeProfilePictureDialog: false,
      steps: [
        {
          target: '[data-v-step="4"]',
          content: 'To add friends click on this button',
          params: {
            placement: 'top'
          }
        },
        {
          target: '[data-v-step="5"]',
          content: 'Click this button to see the options to add a friend',
          params: {
            placement: 'top'
          }
        }
      ],
      tourOptions: {
        enabledButtons: {
          buttonSkip: false
        },
        highlight: false
      },
      tourCallbacks: {
        onNextStep: this.onTourNextStep,
        onFinish: this.onTourFinish
      }
    };
  },
  async mounted() {
    await this.refresh();
    if (!this.$cookies.get('profilePageTourCompleted')) {
      this.$tours['newFriendTour'].start();
    }
  },
  methods: {
    async refresh(fetchPolicy = 'cache-first') {
      try {
        // Check if the device can support qr scanning
        if (
          !navigator ||
          !navigator.mediaDevices ||
          !'mediaDevices' in navigator ||
          !'getUserMedia' in navigator.mediaDevices
        ) {
          this.scanVisibility = false;
        }

        // #region Check if the user is logged in
        const token = this.$apolloHelpers.getToken();
        if (!token) {
          throw new Error('No token found');
        }
        await this.$apollo
          .query({
            query: profile,
            fetchPolicy
          })
          .then(({ data }) => {
            this.user = data.me;
            // Check if notifications are enabled
            this.$OneSignal.push(() => {
              this.$OneSignal.setExternalUserId(this.user.id);
              this.$OneSignal.showSlidedownPrompt();
            });
          });
        this.qrUrl = await qrcode.toDataURL(`${this.user.uniqueMachaId}`);
      } catch (e) {
        this.$store.dispatch('error/addError', e);
        await this.$apolloHelpers.onLogout();
        this.$router.replace('/login');
        this.$notifier.showErrorMessage({
          content: 'You need to be logged in to view the profile page'
        });
      }
    },
    async share() {
      if (navigator.share) {
        await navigator.share({
          text: 'Hey, be my friend @ macha.in by clicking on this link',
          url: `https://macha.in/addMacha/${this.user.uniqueMachaId}`
        });
      } else {
        this.$sharer.showSheet({
          text: 'Hey, be my friend @ macha.in by clicking on this link',
          url: `https://macha.in/addMacha/${this.user.uniqueMachaId}`
        });
      }
    },
    async refreshUrl() {
      this.generatingUrl = true;
      this.user.uniqueMachaId = await this.$apollo
        .mutate({
          mutation: resetUniqueMachaId
        })
        .then(({ data }) => data.resetUniqueMachaId);
      this.qrUrl = await qrcode.toDataURL(`${this.user.uniqueMachaId}`);
      this.generatingUrl = false;
    },
    onQRDecode(decodedString) {
      this.$router.push(`/addMacha/${decodedString}`);
    },
    setNewProfilePicture({ target: { files = [] } }) {
      this.isProfileImageLoading = true;
      if (!files.length) {
        return;
      }
      const file = files[0];
      if (file.type.indexOf('image/') === -1) {
        this.$notifier.showErrorMessage({
          content: 'Please select a correct image file'
        });
        return;
      }

      this.changeProfilePictureDialog = true;
      if (typeof FileReader === 'function') {
        const reader = new FileReader();
        reader.onload = event => {
          this.profileImage = event.target.result;
          this.$refs.profileCropper.replace(event.target.result);
        };

        reader.readAsDataURL(file);
      } else {
        this.$notifier.showErrorMessage({
          content: "Sorry. Your browser doesn't support file uploading"
        });
      }
      this.isProfileImageLoading = false;
    },
    async changeProfilePicture() {
      this.$refs.profileCropper.getCroppedCanvas().toBlob(async blob => {
        try {
          this.isProfileImageLoading = true;
          await this.$apollo.mutate({
            mutation: changeProfilePictureMutation,
            variables: {
              file: blob
            }
          });
          await this.refresh('network-only');
        } catch (e) {
          this.$notifier.showErrorMessage({
            content: 'Unable to upload your picture'
          });
        } finally {
          this.isProfileImageLoading = false;
          this.changeProfilePictureDialog = false;
        }
      });
    },
    onTourNextStep(currentStep) {
      if (currentStep === 0) {
        this.fab = true;
      }
    },
    onTourFinish() {
      this.$cookies.set('profilePageTourCompleted', true, { maxAge: 99999999 });
    },
    tourStepIncrementer() {
      if (!this.$cookies.get('profilePageTourCompleted')) {
        this.$refs.newFriendTour.currentStep = 1;
      }
    },
    swipeHandler(direction) {
      if (direction === 'left') {
        if (this.tab < 4) {
          this.tab += 1;
        }
      } else if (direction === 'right') {
        if (this.tab > 0) {
          this.tab -= 1;
        }
      }
    }
  }
};
</script>

<style lang="scss">
.profile {
  height: 100vh;
}

.top-profile {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  letter-spacing: 0.1rem;
}

.qr-code {
  display: flex;
  width: 100%;
  justify-content: center;
}

.column {
  display: flex;
  flex-direction: column;
}
</style>