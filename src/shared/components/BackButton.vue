<template>
  <v-btn icon @click="goToHome" class="back-btn">
    <!-- Ícono de casa más grande -->
    <v-icon class="custom-icon">mdi-home</v-icon>
  </v-btn>
</template>

<script>
export default {
  methods: {
    goToHome() {
      // Redirigir siempre al Home
      this.$router.push({ name: 'home' });
    }
  }
};
</script>

<style scoped>
.custom-icon {
  font-size: 64px; /* Tamaño del ícono más grande */
  color: #008575;  /* Color verde */
}

.back-btn {
  position: fixed;
  bottom: 20px; /* Posiciona el botón 20px desde la parte inferior */
  left: 20px;   /* Posiciona el botón 20px desde la izquierda */
  z-index: 1000;
  width: 80px;
  height: 80px; /* Hace el botón más grande */
  border-radius: 50%; /* Hace que el botón sea redondeado */
}
</style>
