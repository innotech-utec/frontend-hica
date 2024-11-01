<template>
    <v-container>
      <h2 class="page-title">Facturación</h2>
      <v-btn color="primary" @click="$router.push({ name: 'CreateFacturaPage' })">
        Crear Factura
      </v-btn>
      <v-table>
        <thead>
          <tr>
            <th>ID Factura</th>
            <th>Ficha Clínica</th>
            <th>Artículos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="factura in facturas" :key="factura.id">
            <td>{{ factura.id }}</td>
            <td>{{ factura.fichaClinicaId }}</td>
            <td>
              <ul>
                <li v-for="articulo in factura.articulos" :key="articulo.id">
                  {{ articulo.nombre }} - Cantidad: {{ articulo.FacturaArticulo.cantidad }} - Total: ${{ articulo.FacturaArticulo.total }}
                </li>
              </ul>
            </td>
            <td>
              <v-btn icon @click="editFactura(factura.id)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </template>
  
  <script>
  import backend from "@/backend";
  
  export default {
    name: "IndexFacturaPage",
    data() {
      return {
        facturas: []
      };
    },
    methods: {
      async fetchFacturas() {
        try {
          const response = await backend.get("/facturas");
          this.facturas = response.data;
        } catch (error) {
          console.error("Error al cargar las facturas:", error);
        }
      },
      editFactura(id) {
        this.$router.push({ name: "UpdateFacturaPage", params: { id } });
      }
    },
    created() {
      this.fetchFacturas();
    }
  };
  </script>
  
  <style scoped>
  .page-title {
    font-size: 28px;
    margin-bottom: 20px;
  }
  </style>
  