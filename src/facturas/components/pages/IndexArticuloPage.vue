<template>
    <v-container>
      <!-- Botón de regreso -->
      <BackButton />
  
      <!-- Título de la página -->
      <v-row class="justify-center">
        <v-col cols="12" class="text-center">
          <h2 class="page-title">Listado de Artículos</h2>
        </v-col>
      </v-row>
  
      <!-- Filtro por nombre -->
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filtroNombre"
            label="Nombre"
            clearable
            outlined
            dense
            prepend-inner-icon="mdi-magnify"
            @input="filtrarArticulos"
          ></v-text-field>
        </v-col>
      </v-row>
  
      <!-- Botón para crear artículo (abre modal) -->
      <v-row>
        <v-col cols="12" class="text-left">
          <v-card-actions>
            <v-btn rounded color="primary" class="add-article-btn" dark @click="openCreateModal">
              <v-icon left>mdi-plus</v-icon> Crear Artículo
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
  
      <!-- Tabla de artículos -->
      <v-row>
        <v-col cols="12">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Valor</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="articulosFiltrados.length === 0 && !loading">
                  <td colspan="5" class="text-center">No hay artículos registrados.</td>
                </tr>
                <tr v-for="articulo in articulosFiltrados" :key="articulo.id">
                  <td>{{ articulo.nombre }}</td>
                  <td>{{ articulo.descripcion }}</td>
                  <td>{{ Number(articulo.valor).toFixed(2) }} $</td>
                  <td>{{ articulo.stock }}</td>
                  <td>
                    <v-card-actions>
                      <v-btn icon @click="openEditModal(articulo)" title="Editar artículo">
                        <v-icon>mdi-pencil-outline</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-col>
      </v-row>
  
      <!-- Modal para crear artículo -->
      <CreateArticuloPage
        v-if="showCreateModal"
        :showModal="showCreateModal"
        @close="showCreateModal = false"
        @created="fetchArticulos"
      />
  
      <!-- Modal para editar artículo -->
      <UpdateArticuloPage
        v-if="showEditModal"
        :showModal="showEditModal"
        :articuloData="selectedArticulo"
        @close="showEditModal = false"
        @updated="fetchArticulos"
      />
    </v-container>
  </template>
  
  <script>
  import backend from "@/backend";
  import UpdateArticuloPage from "@/facturas/components/pages/UpdateArticuloPage.vue";
  import CreateArticuloPage from "@/facturas/components/pages/CreateArticuloPage.vue";
  import BackButton from '@/shared/components/BackButton.vue';
  
  export default {
    components: {
      BackButton,
      CreateArticuloPage,
      UpdateArticuloPage
    },
    data() {
      return {
        articulos: [],
        showCreateModal: false,
        showEditModal: false,
        selectedArticulo: {},
        filtroNombre: '',
        loading: false,
      };
    },
    computed: {
      articulosFiltrados() {
        return this.articulos.filter(articulo =>
          articulo.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
        );
      }
    },
    methods: {
      async fetchArticulos() {
        this.loading = true;
        try {
          const response = await backend.get("/articulos", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          this.articulos = response.data;
        } catch (error) {
          console.error("Error al obtener los artículos:", error);
        } finally {
          this.loading = false;
        }
      },
      openCreateModal() {
        this.showCreateModal = true;
      },
      openEditModal(articulo) {
        this.selectedArticulo = articulo;
        this.showEditModal = true;
      },
      filtrarArticulos() {
        this.fetchArticulos();
      }
    },
    created() {
      this.fetchArticulos();
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
  
  .table-responsive {
    overflow-x: auto;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fafafa;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .table th,
  .table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
  }
  
  .table th {
    background-color: #e8eaf6;
    color: #014582;
  }
  
  .filter-row {
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    .page-title {
      font-size: 24px;
    }
  
    .table {
      font-size: 12px;
    }
  
    .table th,
    .table td {
      padding: 8px;
    }
  }
  /* Estilo para el logo */
  .logo {
    width: 150px;
    display: block;
    margin: 0 auto;
  }
  
  </style>
  