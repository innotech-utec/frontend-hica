<template>
    <v-container>
      <!-- Botón de regreso -->
      <BackButton />
  
      <!-- Título del formulario -->
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="page-title">Registrar Examen Objetivo</h2>
        </v-col>
      </v-row>
  
      <!-- Formulario para crear examen objetivo -->
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field v-model="examen.FC" label="Frecuencia Cardíaca (FC)" :rules="requiredRule" required></v-text-field>
        <v-text-field v-model="examen.Resp" label="Frecuencia Respiratoria (FR)" :rules="requiredRule" required></v-text-field>
        <v-text-field v-model="examen.temperatura" label="Temperatura (°C)" :rules="requiredRule" required></v-text-field>
        <v-textarea v-model="examen.observaciones" label="Observaciones" :rules="requiredRule"></v-textarea>
  
        <v-btn rounded color="primary" type="submit">Registrar Examen</v-btn>
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
        examen: {
          FC: '',
          Resp: '',
          temperatura: '',
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
          await backend.post('examenesObjetivos', this.examen, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
  
          Swal.fire({
            title: "Examen Objetivo Registrado",
            text: `El examen objetivo ha sido registrado correctamente.`,
            icon: "success",
          });
  
          this.$router.push({ name: 'fichaClinica.view', params: { id: this.examen.fichaClinicaId } });
        } catch (error) {
          console.error('Error al registrar el examen objetivo:', error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo registrar el examen objetivo.",
          });
        }
      },
      cancel() {
        this.$router.push({ name: 'fichaClinica.view', params: { id: this.examen.fichaClinicaId } });
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
  