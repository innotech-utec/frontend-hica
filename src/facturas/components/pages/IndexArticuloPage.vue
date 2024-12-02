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

    <!-- Botón para crear artículo -->
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
                <th></th>
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
                  <div class="image-placeholder">
                    <v-icon 
                      size="40" 
                      :color="getRandomIcon(articulo).color"
                    >
                      {{ getRandomIcon(articulo).icon }}
                    </v-icon>
                  </div>
                </td>
                <td>{{ articulo.nombre }}</td>
                <td>{{ articulo.descripcion }}</td>
                <td>{{ Number(articulo.valor).toFixed(2) }} $</td>
                <td>{{ articulo.stock }}</td>
                <td>
                  <v-card-actions class="justify-center">
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
    normalizarTexto(texto) {
      if (!texto) return '';
      return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    },

    getRandomIcon(articulo) {
  // Si no hay descripción, retorna el icono por defecto
  if (!articulo || !articulo.descripcion) {
    return {
      icon: 'mdi-bacteria',
      color: 'grey-darken-1'
    };
  }

  const descripcion = this.normalizarTexto(articulo.descripcion);
  console.log('Descripción normalizada:', descripcion);

  // Casos específicos
  const casos = {
    'antibiotico': { icon: 'mdi-bacteria', color: 'purple-darken-2' },
    'inyectable': { icon: 'mdi-needle', color: 'blue-darken-2' },
    'curacion': { icon: 'mdi-bandage', color: 'teal-darken-2' },
    'vitamina': { icon: 'mdi-pill', color: 'amber-darken-2' },
    'analgesico': { icon: 'mdi-heart-pulse', color: 'red-darken-2' },
    '': { icon: 'mdi-hospital-box', color: 'grey-darken-1' }
  };

  // Buscar coincidencia
  for (const [palabra, iconInfo] of Object.entries(casos)) {
    if (descripcion.includes(palabra)) {
      return iconInfo;
    }
  }
  
  // Si no hay coincidencias, retorna el icono por defecto
  return {
    icon: 'mdi-hospital-box',
    color: 'grey-darken-1'
  };
},

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
  vertical-align: middle;
}

.image-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.image-placeholder:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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