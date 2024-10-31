<!-- src/animales/components/pages/ViewFichaModal.vue -->
<template>
    <v-dialog v-model="visible" max-width="600px">
      <v-card>
        <v-card-title>Ficha Clínica</v-card-title>
        <v-card-text>
          <p><strong>Motivo de Consulta:</strong> {{ ficha.motivoConsulta }}</p>
          <p><strong>Diagnóstico:</strong> {{ ficha.examenObjetivo?.diagnostico || 'Sin diagnóstico' }}</p>
          <p><strong>Estado:</strong> {{ ficha.estadoFichaClinica }}</p>
          <p><strong>Fecha Última Modificación:</strong> {{ formatFecha(ficha.updatedAt) }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeModal">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    props: {
      ficha: Object,
    },
    data() {
      return { visible: true };
    },
    methods: {
      closeModal() {
        this.visible = false;
        this.$emit('close');
      },
      formatFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' });
      },
    },
  };
  </script>
  
  <style scoped>
  .v-card-title {
    font-weight: bold;
  }
  </style>
  