<template>
    <v-dialog v-model="localShowModal" max-width="600px" @click:outside="closeModal">
      <v-card>
        <v-card-title>Crear Artículo</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="createArticulo">
            <v-text-field v-model="nombre" label="Nombre" required></v-text-field>
            <v-textarea v-model="descripcion" label="Descripción"></v-textarea>
            <v-text-field v-model="valor" label="Valor" required type="number"></v-text-field>
            <v-text-field v-model="stock" label="Stock" required type="number"></v-text-field>
            <v-card-actions>
              <v-btn rounded color="primary" type="submit">Guardar</v-btn>
              <v-btn rounded color="secondary" @click="closeModal">Cancelar</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import backend from "@/backend";
  
  export default {
    props: {
      showModal: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return {
        valid: false,
        localShowModal: this.showModal,
        nombre: '',
        descripcion: '',
        valor: null,
        stock: null
      };
    },
    watch: {
      showModal(val) {
        this.localShowModal = val;
      },
      localShowModal(val) {
        if (!val) this.$emit('close');
      }
    },
    methods: {
      async createArticulo() {
        if (!this.$refs.form.validate()) return;
  
        try {
          await backend.post("/articulos", {
            nombre: this.nombre,
            descripcion: this.descripcion,
            valor: this.valor,
            stock: this.stock
          });
          this.$emit("created");
          this.closeModal();
        } catch (error) {
          console.error("Error creando artículo:", error);
        }
      },
      closeModal() {
        this.localShowModal = false;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Styles here */
  </style>
  