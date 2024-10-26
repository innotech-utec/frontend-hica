<template>
    <v-container>
      <!-- Botón de regreso -->
      <BackButton />
  
      <!-- Título del formulario -->
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="page-title">Registrar Parámetros</h2>
        </v-col>
      </v-row>
  
      <!-- Formulario para crear parámetros -->
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field v-model="parametros.FC" label="Frecuencia Cardíaca (FC)" :rules="requiredRule" required></v-text-field>
        <v-text-field v-model="parametros.FR" label="Frecuencia Respiratoria (FR)" :rules="requiredRule" required></v-text-field>
        <v-text-field v-model="parametros.temperatura" label="Temperatura (°C)" :rules="requiredRule" required></v-text-field>
        <v-text-field v-model="parametros.mucosas" label="Mucosas" :rules="requiredRule" required></v-text-field>
        <v-text-field v-model="parametros.TllC" label="Tiempo de Llenado Capilar (TllC)" :rules="requiredRule" required></v-text-field>
        <v-text-field v-model="parametros.pliegueCutaneo" label="Pliegue Cutáneo" :rules="requiredRule" required></v-text-field>
        <v-textarea v-model="parametros.observaciones" label="Observaciones" :rules="requiredRule"></v-textarea>
  
        <v-btn rounded color="primary" type="submit">Registrar Parámetros</v-btn>
        <v-btn rounded color="secondary" @click="cancel">Cancelar</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import backend from "@/backend";
  import Swal from "sweetalert2";
  import BackButton from "@/shared/components/BackButton.vue";
  
  export default {
    components: {
      BackButton,
    },
    data() {
      return {
        valid: false,
        parametros: {
          FC: '',
          FR: '',
          temperatura: '',
          mucosas: '',
          TllC: '',
          pliegueCutaneo: '',
          observaciones: '',
          fichaClinicaId: this.$route.params.fichaClinicaId // Obtener el ID de la ficha clínica desde la URL
        },
        requiredRule: [v => !!v || 'Este campo es requerido'],
      };
    },
    methods: {
      async onSubmit() {
        if (!this.$refs.form.validate()) return;
  
        try {
          await backend.post('parametros', this.parametros, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
  
          Swal.fire({
            title: "Parámetros Registrados",
            text: `Los parámetros han sido registrados correctamente.`,
            icon: "success",
          });
  
          this.$router.push({ name: 'fichaClinica.view', params: { id: this.parametros.fichaClinicaId } });
        } catch (error) {
          console.error('Error al registrar los parámetros:', error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo registrar los parámetros.",
          });
        }
      },
      cancel() {
        this.$router.push({ name: 'fichaClinica.view', params: { id: this.parametros.fichaClinicaId } });
      }
    }
  };
  </script>
  
  <style scoped>
  .page-title {
    font-size: 28px;
    color: #014582;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .v-btn {
    margin-top: 20px;
  }
  
  .v-btn.rounded {
    background-color: #014582;
    color: white;
  }
  
  .v-btn.rounded:hover {
    background-color: #013262;
  }
  
  .v-btn.secondary {
    background-color: #008575;
  }
  
  .v-btn.secondary:hover {
    background-color: #007460;
  }
  </style>
  