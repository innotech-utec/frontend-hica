<template>
    <v-dialog v-model="localShowModal" max-width="600px" @click:outside="closeModal">
      <v-card>
        <v-card-title>Editar Artículo</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
            <!-- Nombre del Artículo -->
            <v-text-field v-model="articulo.nombre" label="Nombre" :rules="requiredRule" required></v-text-field>
  
            <!-- Descripción del Artículo -->
            <v-textarea v-model="articulo.descripcion" label="Descripción" :rules="requiredRule" required></v-textarea>
  
            <!-- Valor del Artículo -->
            <v-text-field
              v-model="articulo.valor"
              label="Valor ($)"
              type="number"
              :rules="[...requiredRule, v => v > 0 || 'El valor debe ser mayor que 0']"
              required
            ></v-text-field>
  
            <!-- Stock del Artículo -->
            <v-text-field
              v-model="articulo.stock"
              label="Stock"
              type="number"
              :rules="[...requiredRule, v => v >= 0 || 'El stock no puede ser negativo']"
              required
            ></v-text-field>
  
            <v-card-actions>
              <v-btn rounded color="primary" type="submit">Guardar Cambios</v-btn>
              <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import backend from "@/backend.js";
  import Swal from "sweetalert2";
  
  export default {
    props: {
      showModal: {
        type: Boolean,
        required: true
      },
      articuloData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        valid: false,
        localShowModal: this.showModal,
        articulo: {},
        requiredRule: [v => !!v || 'Este campo es requerido']
      };
    },
    watch: {
      showModal(val) {
        this.localShowModal = val;
      },
      localShowModal(val) {
        if (!val) this.$emit('close');
      },
      articuloData: {
        immediate: true,
        handler(newVal) {
          this.articulo = { ...newVal };
        }
      }
    },
    methods: {
      async onSubmit() {
        if (!this.$refs.form.validate()) return;
  
        try {
          await backend.patch(`/articulos/${this.articulo.id}`, this.articulo);
          Swal.fire({
            title: "Artículo Actualizado",
            text: "Los datos del artículo han sido actualizados correctamente.",
            icon: "success",
          });
          this.closeModal();
          this.$emit('updated');
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "Error al actualizar el artículo",
          });
        }
      },
      closeModal() {
        this.localShowModal = false;
      },
      confirmCancel() {
        this.closeModal();
      }
    }
  };
  </script>
  
  <style scoped>
  .v-btn.rounded {
    background-color: #014582;
    color: white;
  }
  
  .v-btn.secondary {
    background-color: #008575;
  }
  </style>
  