<template>
    <v-container>
      <h2 class="page-title">Crear Factura</h2>
      <v-form @submit.prevent="createFactura">
        <v-select
          v-model="fichaClinicaId"
          :items="fichasClinicas"
          label="Seleccione Ficha Clínica"
          item-text="nombre"
          item-value="id"
          required
        ></v-select>
        <v-card-text>
          <v-row v-for="(articulo, index) in articulosSeleccionados" :key="index">
            <v-col cols="6">
              <v-select
                v-model="articulo.id"
                :items="articulos"
                label="Artículo"
                item-text="nombre"
                item-value="id"
                required
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model.number="articulo.cantidad"
                label="Cantidad"
                type="number"
                min="1"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-btn color="red" icon @click="removeArticulo(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-btn color="green" @click="addArticulo">Agregar Artículo</v-btn>
        <v-btn color="primary" type="submit">Crear Factura</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import backend from "@/backend";
  
  export default {
    name: "CreateFacturaPage",
    data() {
      return {
        fichaClinicaId: null,
        articulos: [],
        articulosSeleccionados: [{ id: null, cantidad: 1 }],
        fichasClinicas: []
      };
    },
    methods: {
      async fetchArticulos() {
        const response = await backend.get("/articulos");
        this.articulos = response.data;
      },
      async fetchFichasClinicas() {
        const response = await backend.get("/fichasClinicas");
        this.fichasClinicas = response.data;
      },
      addArticulo() {
        this.articulosSeleccionados.push({ id: null, cantidad: 1 });
      },
      removeArticulo(index) {
        this.articulosSeleccionados.splice(index, 1);
      },
      async createFactura() {
        try {
          await backend.post("/facturas", {
            fichaClinicaId: this.fichaClinicaId,
            articulos: this.articulosSeleccionados
          });
          this.$router.push({ name: "IndexFacturaPage" });
        } catch (error) {
          console.error("Error al crear factura:", error);
        }
      }
    },
    created() {
      this.fetchArticulos();
      this.fetchFichasClinicas();
    }
  };
  </script>
  
  <style scoped>
  .page-title {
    font-size: 28px;
    margin-bottom: 20px;
  }
  </style>
  