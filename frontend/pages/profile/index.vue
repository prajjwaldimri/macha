<template lang="pug">
  .profile
    v-toolbar(prominent flat height="240")
      .top-profile.pt-5
        v-avatar(color="primary" size="80")
          span.white--text.headline PD
        span.title.pt-2 {{user.name}}

      template(v-slot:extension)
        v-tabs(v-model="tab" grow show-arrows)
          v-tab(key="profile") Profile
          v-tab(key="friends") Friends
          v-tab(key="photos") Photos
          v-tab(key="settings") Settings

    v-speed-dial(v-model="fab" bottom right fixed transition="slide-y-reverse-transition")
      template(v-slot:activator)
        v-btn(v-model="fab" fab color="primary")
          v-icon(v-if="fab") mdi-close
          v-icon(v-else) mdi-plus

      v-btn(color="primary" fab @click.stop="addDialog=true")
        v-icon mdi-account-multiple-plus
      v-btn(color="primary" fab @click.stop="scanDialog=true")
        v-icon mdi-qrcode-scan

    v-dialog(v-model="scanDialog" :visibility="scanVisibility" width="85%" height="85%")
      v-card
        v-card-title.headline QR Scanner
        v-card-text You can quickly add a macha by scanning the QR code on their mobile screen
        v-btn(@click="camera='auto'" block) Scan QR Code
        qrcode-stream(:camera="camera" @decode="onQRDecode")


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
import qrcode from 'qrcode';

export default {
  data() {
    return {
      tab: 'profile-tab',
      user: {},
      addDialog: false,
      scanDialog: false,
      qrUrl: '',
      fab: false,
      generatingUrl: false,
      scanVisibility: false,
      camera: 'off',
      error: ''
    };
  },
  async mounted() {
    try {
      // Check if the device can support qr scanning
      if (
        !'mediaDevices' in navigator ||
        !'getUserMedia' in navigator.mediaDevices
      ) {
        this.scanVisibility = false;
      }

      const token = this.$apolloHelpers.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      this.user = await this.$apollo
        .query({
          query: profile
        })
        .then(({ data }) => data.me);
      this.qrUrl = await qrcode.toDataURL(
        `https://macha.in/addFriend/${this.user.uniqueMachaId}`
      );
    } catch (e) {
      await this.$apolloHelpers.onLogout();
      this.$router.replace('/login');
      this.$notifier.showErrorMessage({
        content: 'You need to be logged in to view the profile page'
      });
    }
  },
  methods: {
    async share() {
      if (navigator.share) {
        await navigator.share({
          text: 'Hey, be my friend @ macha.in by clicking on this link',
          url: `https://macha.in/addFriend/${this.user.uniqueMachaId}`
        });
      } else {
        this.$sharer.showSheet({
          text: 'Hey, be my friend @ macha.in by clicking on this link',
          url: `https://macha.in/addFriend/${this.user.uniqueMachaId}`
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
      this.qrUrl = await qrcode.toDataURL(
        `https://macha.in/addFriend/${this.user.uniqueMachaId}`
      );
      this.generatingUrl = false;
    },
    onQRDecode(decodedString) {
      alert(decodedString);
    },
    async onInit(promise) {
      try {
        await promise;
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = 'ERROR: you need to grant camera access permisson';
        } else if (error.name === 'NotFoundError') {
          this.error = 'ERROR: no camera on this device';
        } else if (error.name === 'NotSupportedError') {
          this.error = 'ERROR: secure context required (HTTPS, localhost)';
        } else if (error.name === 'NotReadableError') {
          this.error = 'ERROR: is the camera already in use?';
        } else if (error.name === 'OverconstrainedError') {
          this.error = 'ERROR: installed cameras are not suitable';
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.error = 'ERROR: Stream API is not supported in this browser';
        }
      }
    }
  }
};
</script>

<style lang="scss">
.top-profile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  letter-spacing: 0.1rem;
}

.profile {
  height: 100vh;
}

.qr-code {
  display: flex;
  width: 100%;
  justify-content: center;
}
</style>