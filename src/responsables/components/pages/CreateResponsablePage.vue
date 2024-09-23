<template>
    <v-card class="card">
      <v-container>
        <!-- Título del formulario -->
        <v-row>
          <v-col cols="12" class="text-center">
            <h2 class="form-title">Crear Responsable</h2>
          </v-col>
        </v-row>
  
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
          <!-- Documento -->
          <v-text-field v-model="responsable.documento" :rules="requiredRule" label="Documento" required></v-text-field>
  
          <!-- Nombre -->
          <v-text-field v-model="responsable.nombre" :rules="requiredRule" label="Nombre" required></v-text-field>
  
          <!-- Apellido -->
          <v-text-field v-model="responsable.apellido" :rules="requiredRule" label="Apellido" required></v-text-field>
  
          <!-- Domicilio -->
          <v-text-field v-model="responsable.domicilio" :rules="requiredRule" label="Domicilio" required></v-text-field>
  
          <!-- Checkbox Estado (Activo/Inactivo) -->
          <v-checkbox v-model="responsable.estado" label="Activo"></v-checkbox>
  
          <!-- Botón para guardar -->
          <v-btn rounded color="primary" type="submit">Crear Responsable</v-btn>
  
          <!-- Botón de cancelar con confirmación -->
          <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
        </v-form>
      </v-container>
    </v-card>
  </template>
  
  <script>
  import backend from '@/backend';
  import Swal from 'sweetalert2';
  
  export default {
    data() {
      return {
        valid: false,
        responsable: {
          documento: '',
          nombre: '',
          apellido: '',
          domicilio: '',
          estado: true // Valor predeterminado
        },
        requiredRule: [v => !!v || 'Este campo es requerido']
      };
    },
    methods: {
      // Método para crear un nuevo responsable
      async onSubmit() {
        if (!this.$refs.form.validate()) return;
  
        try {
          await backend.post('responsables', {
            documento: this.responsable.documento,
            nombre: this.responsable.nombre,
            apellido: this.responsable.apellido,
            domicilio: this.responsable.domicilio,
            estado: this.responsable.estado
          });
  
          Swal.fire({
            title: "Responsable creado",
            text: `El responsable ${this.responsable.nombre} ${this.responsable.apellido} ha sido creado con éxito.`,
            icon: "success"
          });
  
          this.$router.push({ name: 'responsables.index' });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "Error al crear el responsable"
          });
        }
      },
      
      // Método para confirmar cancelación
      async confirmCancel() {
        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: "¿Deseas cancelar la creación del responsable?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, cancelar",
          cancelButtonText: "No"
        });
  
        if (result.isConfirmed) {
          this.$router.push({ name: 'responsables.index' });
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .card {
    max-width: 600px;
    margin: auto;
    padding: 20px;
  }
  
  .form-title {
    font-size: 24px;
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
  