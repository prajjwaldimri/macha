<template lang="pug">
  .profile
    v-toolbar(prominent flat height="120")
      input(type="file" accept="image/*" ref="profilePicture" label="Profile picture input" style="display:none" @change="changeProfilePicture")
      .top-profile
        v-avatar( size="80" @click="$refs.profilePicture.click()")
          v-progress-circular(v-if="isProfileImageLoading" indeterminate)
          v-img(v-else-if="user.profileImage" :src="user.profileImage")
          v-icon(v-else size="80" color="orange" ) mdi-halloween
        .column.ml-4
          span.title {{user.name}}
          span.subtitle @{{user.username}}

      template(v-slot:extension)
        v-tabs(v-model="tab" grow show-arrows)
          v-tab(key="profile") Profile
          v-tab(key="friends") Friends
          v-tab(key="texts") Texts
          v-tab(key="photos") Photos
          v-tab(key="settings") Settings

          v-tab-item(key="profile")
            EditProfile(@detailsChanged="refresh('network-only')")
          v-tab-item(key="friends")
            Friends
          v-tab-item(key="texts")
            Texts
          v-tab-item(key="photos")
            Photos
          v-tab-item(key="settings")
            Settings

    v-speed-dial(v-model="fab" bottom right fixed transition="slide-y-reverse-transition" style="bottom: 52px;")
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
import changeProfilePictureMutation from '~/gql/changeProfilePicture';

import qrcode from 'qrcode';

import Friends from './friends.vue';
import Photos from './photos.vue';
import Texts from './texts.vue';
import Settings from './settings.vue';
import EditProfile from './editProfile.vue';

export default {
  components: {
    Friends,
    Texts,
    Photos,
    Settings,
    EditProfile
  },
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
      profileImage: '',
      isProfileImageLoading: false
    };
  },
  async mounted() {
    await this.refresh();
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
        this.user = await this.$apollo
          .query({
            query: profile,
            fetchPolicy
          })
          .then(({ data }) => data.me);
        // if (!this.user.profileImage) {
        //   this.user.profileImage = `https://api.adorable.io/avatars/128/${this.user.username}.png`;
        // }
        this.qrUrl = await qrcode.toDataURL(`${this.user.uniqueMachaId}`);
      } catch (e) {
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
      this.qrUrl = await qrcode.toDataURL(`${this.user.uniqueMachaId}`);
      this.generatingUrl = false;
    },
    onQRDecode(decodedString) {
      this.$router.push(`/addMacha/${decodedString}`);
    },
    async changeProfilePicture({ target: { files = [] } }) {
      try {
        this.isProfileImageLoading = true;
        if (!files.length) {
          return;
        }
        await this.$apollo.mutate({
          mutation: changeProfilePictureMutation,
          variables: {
            file: files[0]
          }
        });
        await this.refresh('network-only');
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Unable to upload your picture'
        });
      } finally {
        this.isProfileImageLoading = false;
      }
    }
  }
};
</script>

<style lang="scss">
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