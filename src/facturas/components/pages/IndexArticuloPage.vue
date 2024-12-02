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
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Valor</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="articulosFiltrados.length === 0 && !loading">
                <td colspan="6" class="text-center">No hay artículos registrados.</td>
              </tr>
              <tr v-for="articulo in articulosFiltrados" :key="articulo.id">
                <td class="image-cell">
                  <v-img
                    :src="`/api/placeholder/100/100`"
                    :alt="articulo.nombre"
                    width="60"
                    height="60"
                    class="mx-auto rounded"
                  ></v-img>
                </td>
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

    <!-- Modales -->
    <CreateArticuloPage
      v-if="showCreateModal"
      :showModal="showCreateModal"
      @close="showCreateModal = false"
      @created="fetchArticulos"
    />

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
      filtroNombre: '',
      showCreateModal: false,
      showEditModal: false,
      selectedArticulo: {},
      loading: false,
    };
  },
  computed: {
    articulosFiltrados() {
      if (!this.articulos || this.articulos.length === 0) {
        return [];
      }

      if (!this.filtroNombre || this.filtroNombre.trim() === '') {
        return this.articulos;
      }

      return this.articulos.filter((articulo) =>
        articulo.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
      );
    },
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
    filtrarArticulos() {
      if (!this.filtroNombre) {
        this.fetchArticulos();
        return;
      }
    },
    openCreateModal() {
      this.showCreateModal = true;
    },
    openEditModal(articulo) {
      this.selectedArticulo = articulo;
      this.showEditModal = true;
    },
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

.image-cell {
  width: 80px;
  padding: 8px;
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
  
  .image-cell {
    width: 60px;
  }
}

.logo {
  width: 150px;
  display: block;
  margin: 0 auto;
}
</style>