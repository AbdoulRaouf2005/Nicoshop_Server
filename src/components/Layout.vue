<template>
      <div>
            <Header></Header>
            <transition name="fade">
                  <div v-if="showToast" class="toast-notification">
                        <fontAwesome icon="fa-check-circle"></fontAwesome>
                        <span>{{ toastMessage }}</span>
                  </div>
            </transition>
            <div class="container my-4">
                  <transition name="page-fade" mode="out-in">
                        <slot></slot>
                  </transition>
            </div>
      </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from './Header.vue';

const showToast = ref(false)
const toastMessage = ref('')


onMounted(() => {
  window.addEventListener('show-toast', (event) => {
    toastMessage.value = event.detail.message
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  })
})
</script>

<style scoped>
/* Toast Notification */
.toast-notification {
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
      from {
            transform: translateX(400px);
            opacity: 0;
      }

      to {
            transform: translateX(0);
            opacity: 1;
      }
}

.toast-notification i {
      font-size: 1.5rem;
}
/* Animations de page */
.page-fade-enter-active,
.page-fade-leave-active {
      transition: all 0.3s ease;
}

.page-fade-enter-from {
      opacity: 0;
      transform: translateY(20px);
}

.page-fade-leave-to {
      opacity: 0;
      transform: translateY(-20px);
}

</style>