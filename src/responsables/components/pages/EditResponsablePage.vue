<template>
    <v-card class="card">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center">
            <h2 class="form-title">Editar Responsable</h2>
          </v-col>
        </v-row>
  
        <v-form @submit.prevent="onSubmit">
          <!-- Nombre -->
          <div class="field">
            <v-icon class="field__icon">mdi-account-circle</v-icon>
            <input class="field__input" v-model="responsable.nombre" type="text" placeholder="Nombre" />
          </div>
  
          <!-- Apellido -->
          <div class="field">
            <v-icon class="field__icon">mdi-account-circle</v-icon>
            <input class="field__input" v-model="responsable.apellido" type="text" placeholder="Apellido" />
          </div>
  
          <!-- Domicilio -->
          <div class="field">
            <v-icon class="field__icon">mdi-home"></v-icon>
            <input class="field__input" v-model="responsable.domicilio" type="text" placeholder="Domicilio" />
          </div>
  
          <!-- Botones de acción -->
          <v-btn rounded type="submit" color="primary">
            <v-icon class="mdi">mdi-content-save</v-icon>
            Guardar
          </v-btn>
          <v-btn rounded @click="confirmCancel('edición')" color="secondary">
            <v-icon class="mdi">mdi-cancel</v-icon>
            Cancelar
          </v-btn>
        </v-form>
      </v-container>
    </v-card>
  </template>
  
  <script>
  import backend from "@/backend.js";
  import Swal from "sweetalert2";
  
  export default {
    data() {
      return {
        responsable: {
          nombre: "",
          apellido: "",
          domicilio: "",
        },
      };
    },
    async mounted() {
      try {
        const responsableId = this.$route.params.id;
        const response = await backend.get(`responsables/${responsableId}`);
        this.responsable = response.data;
      } catch (error) {
        Swal.fire({
          title: "Error al cargar responsable",
          text: "No se pudieron cargar los datos del responsable",
          icon: "error",
        });
      }
    },
    methods: {
      async onSubmit() {
        try {
          const responsableId = this.$route.params.id;
          await backend.patch(`responsables/${responsableId}`, {
            nombre: this.responsable.nombre,
            apellido: this.responsable.apellido,
            domicilio: this.responsable.domicilio,
          });
  
          Swal.fire({
            title: "Responsable actualizado",
            text: "Los datos del responsable han sido actualizados",
            icon: "success",
          });
  
          this.$router.push("/responsables");
        } catch (error) {
          Swal.fire({
            title: "Error al actualizar",
            text: "No se pudieron actualizar los datos del responsable",
            icon: "error",
          });
        }
      },
  
      async confirmCancel(action) {
        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: `¿Deseas cancelar la ${action} del responsable?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, cancelar",
          cancelButtonText: "Continuar",
        });
  
        if (result.isConfirmed) {
          this.$router.push("/responsables");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .card {
    max-width: 600px;
    margin: auto;
    padding: 20px;
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
  
  .form-title {
    font-size: 28px;
    color: #014582;
    font-weight: bold;
    margin-bottom: 20px;
  }
  </style>
  