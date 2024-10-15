<template>
  <v-btn icon @click="goToHome" class="back-btn">
    <!-- Ícono de casa más pequeño -->
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
  font-size: 40px; /* Tamaño del ícono más pequeño */
  color: #008575;  /* Color verde */
}

.back-btn {
  position: absolute; /* Cambiamos a absolute para que se mueva con la página */
  bottom: 20px; /* Posiciona el botón 20px desde la parte inferior */
  left: 20px;   /* Posiciona el botón 20px desde la izquierda */
  z-index: 1000;
  width: 60px;  /* Reducimos el tamaño del botón */
  height: 60px; /* Reducimos la altura del botón */
  border-radius: 50%; /* Hace que el botón sea redondeado */
}
</style>
