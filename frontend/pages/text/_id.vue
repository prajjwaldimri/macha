<template lang="pug">
  v-container(fluid)
    v-card(:loading="isTextPostLoading" flat).mx-3
      v-list-item(v-if="textPost.authorDetails" href="/profile" nuxt)
        v-list-item-avatar()
          v-img(:src="textPost.authorDetails.profileImage" aspect-ratio="1")
        v-list-item-content
          v-list-item-title() {{textPost.authorDetails.name}}
          v-list-item-subtitle() @{{textPost.authorDetails.username}}
      v-card-subtitle.pt-0 {{textPost.content}}
      v-card-actions
        v-btn(v-if="textPost.hasCurrentUserLikedTextPost" icon @click="toggleLikeTextPost" color="pink" left :disabled="isTextPostLoading" :loading="isLikeLoading")
          v-icon mdi-heart
          span.pl-1 {{textPost.likeCount}}
        v-btn(icon @click="toggleLikeTextPost" color="pink" :disabled="isTextPostLoading" :loading="isLikeLoading" v-else)
          v-icon mdi-heart-outline
          span.pl-1 {{textPost.likeCount}}
        v-btn(icon :disabled="isTextPostLoading" :to="'/text/' + textPost.uri" nuxt)
          v-icon mdi-comment
          span.pl-1 {{textPost.commentCount}}
        v-btn(icon :disabled="isTextPostLoading" @click="share")
          v-icon mdi-share
        v-spacer
        v-btn(icon v-if="textPost.isCurrentUserAuthor" @click="deleteTextPost" color="error" :disabled="isTextPostLoading")
          v-icon mdi-delete

</template>

<style lang="scss">
</style>

<script>
import getTextPost from '../../gql/getTextPost';
import likePost from '../../gql/likePost';
import unlikePost from '../../gql/unlikePost';
import isCurrentUserLiker from '../../gql/isCurrentUserLiker';
import deleteTextPost from '../../gql/deleteTextPost';

export default {
  async mounted() {
    await this.refresh();
  },
  data() {
    return {
      textPost: {},
      isTextPostLoading: false,
      isLikeLoading: false
    };
  },
  methods: {
    async refresh() {
      try {
        this.isTextPostLoading = true;
        await this.$apollo
          .query({
            query: getTextPost,
            variables: {
              identifier: this.$route.params.id
            }
          })
          .then(({ data }) => {
            this.textPost = data.getTextPost;
          });
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Error loading your image'
        });
      } finally {
        this.isTextPostLoading = false;
      }
    },
    async deleteTextPost() {
      try {
        this.isTextPostLoading = true;
        await this.$apollo.mutate({
          mutation: deleteTextPost,
          variables: {
            uri: this.textPost.uri
          }
        });
        this.$emit('postDeleted');
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Error deleting your text'
        });
      } finally {
        this.isTextPostLoading = false;
      }
    },
    async toggleLikeTextPost() {
      try {
        this.isLikeLoading = true;
        if (this.textPost.hasCurrentUserLikedTextPost) {
          await this.$apollo.mutate({
            mutation: unlikePost,
            variables: {
              postId: this.textPost.id
            }
          });
          this.textPost.likeCount -= 1;
        } else {
          await this.$apollo.mutate({
            mutation: likePost,
            variables: {
              postId: this.textPost.id
            }
          });
          this.textPost.likeCount += 1;
        }
        this.textPost.hasCurrentUserLikedTextPost = await this.$apollo
          .query({
            query: isCurrentUserLiker,
            variables: {
              identifier: this.textPost.id
            },
            fetchPolicy: 'network-only'
          })
          .then(({ data }) => data.isCurrentUserLiker);
      } catch (e) {
        this.$notifier.showErrorMessage({
          content: 'Error chaging the status of like on the image.'
        });
      } finally {
        this.isLikeLoading = false;
      }
    },
    async share() {
      if (navigator.share) {
        await navigator.share({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/text/${this.textPost.uri}`
        });
      } else {
        this.$sharer.showSheet({
          text: 'Hey, checkout this post @ macha',
          url: `https://macha.in/text/${this.textPost.uri}`
        });
      }
    }
  }
};
</script>