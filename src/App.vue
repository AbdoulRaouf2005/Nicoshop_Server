<script setup>
import Layout from './components/Layout.vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import { watch } from 'vue';

const authStore = useAuthStore();

// Watcher pour appliquer/retirer la classe dark au html
watch(() => authStore.theme, (newTheme) => {
  const html = document.documentElement;
  if (newTheme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}, { immediate: true });

</script>

<template>
      <div>
            <Layout>
                  <RouterView />
            </Layout>
      </div>
</template>

<style scoped>


</style>
