<!-- CreateParametrosPage.vue -->
<template>
  <v-dialog v-model="isModalOpen" max-width="600">
    <v-card>
      <v-card-title>Registrar Parámetros</v-card-title>
      <v-card-text>
        <!-- Formulario para crear parámetros -->
        <v-form @submit.prevent="createParametros">
          <v-text-field v-model="parametros.fecha" label="Fecha" type="date" required></v-text-field>
          <v-text-field v-model="parametros.hora" label="Hora" type="time" required></v-text-field>
          <v-text-field v-model="parametros.FC" label="Frecuencia Cardíaca (FC)" required></v-text-field>
          <v-text-field v-model="parametros.FR" label="Frecuencia Respiratoria (FR)" required></v-text-field>
          <v-text-field v-model="parametros.temperatura" label="Temperatura (°C)" required></v-text-field>
          <v-text-field v-model="parametros.mucosas" label="Mucosas" required></v-text-field>
          <v-text-field v-model="parametros.TllC" label="Tiempo de Llenado Capilar (TllC)" required></v-text-field>
          <v-text-field v-model="parametros.pliegueCutaneo" label="Pliegue Cutáneo" required></v-text-field>
          <v-textarea v-model="parametros.observaciones" label="Observaciones"></v-textarea>
          <v-card-actions>
            <v-btn color="primary" type="submit">Guardar</v-btn>
            <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";

export default {
  props: ['fichaClinicaId'],
  data() {
    return {
      isModalOpen: true,
      parametros: {
        fecha: '',
        hora: '',
        FC: '',
        FR: '',
        temperatura: '',
        mucosas: '',
        TllC: '',
        pliegueCutaneo: '',
        observaciones: '',
      },
    };
  },
  methods: {
    async createParametros() {
      if (!this.fichaClinicaId) {
        console.warn("fichaClinicaId is missing");
        return;
      }

      try {
        await backend.post('/registroParametros', {
          ...this.parametros,
          fichaClinicaId: this.fichaClinicaId,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        Swal.fire("Parámetros Registrados", "La toma de parámetros ha sido registrada con éxito.", "success");

        this.$emit('parametroRegistrado');
        this.closeModal();
      } catch (error) {
        console.error('Error al registrar los parámetros:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo registrar la toma de parámetros.",
        });
      }
    },
    closeModal() {
      this.$emit('closeModal');
      this.isModalOpen = false;
    }
  },
};
</script>
