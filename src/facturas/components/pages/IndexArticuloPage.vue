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

    <v-row>
  <v-col cols="12" md="4">
    <v-text-field
      v-model="filtroNombre"
      label="Nombre"
      clearable
      outlined
      dense
      prepend-inner-icon="mdi-magnify"
    ></v-text-field>
  </v-col>
  <v-col cols="12" md="4">
    <v-select
      v-model="filtroCategoria"
      :items="categorias"
      label="Filtrar por categoría"
      clearable
      outlined
      dense
    ></v-select>
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
                <th>Categoría</th> 
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Valor</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
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
  <td>
    <v-chip
      :color="getRandomIcon(articulo).color"
      text-color="white"
      size="small"
    >
      {{ articulo.categoria }}
    </v-chip>
  </td>
  <td>{{ articulo.nombre }}</td>
  <td>{{ articulo.descripcion }}</td>
  <td>{{ Number(articulo.valor).toFixed(2) }} $</td>
  <td>{{ articulo.stock }}</td>
  <td>
    <v-card-actions class="justify-center">
  <v-btn 
    icon 
    @click="openEditModal(articulo)" 
    title="Editar insumo"
    class="action-btn"
  >
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <div class="icon-container" v-bind="props">
          <v-icon class="base-icon">mdi-medical-bag</v-icon>
          <v-icon class="overlay-icon">mdi-pencil</v-icon>
        </div>
      </template>
      <span>Editar insumo</span>
    </v-tooltip>
  </v-btn>
</v-card-actions>
  </td>
</tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>

    <div class="pagination-container">
      <PaginatorComponent
        :length="totalPages"
        :currentPage="currentPage"
        @pageChange="handlePageChange"
      />
    </div>

    <!-- Modales -->
    <CreateArticuloPage
      v-if="showCreateModal"
      :showModal="showCreateModal"
      :categorias="categorias"
      @close="showCreateModal = false"
      @created="fetchArticulos"
    />

    <UpdateArticuloPage
      v-if="showEditModal"
      :showModal="showEditModal"
      :articuloData="selectedArticulo"
      :categorias="categorias"
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
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";

export default {
  components: {
    BackButton,
    CreateArticuloPage,
    UpdateArticuloPage,
    PaginatorComponent
  },
  data() {
    return {
      articulos: [],
      filtroNombre: '',
      showCreateModal: false,
      showEditModal: false,
      selectedArticulo: {},
      loading: false,
      filtroCategoria: '',
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
 
  computed: {
    articulosFiltrados() {
    if (!this.articulos || this.articulos.length === 0) {
      return [];
    }

    const filtrados = this.articulos.filter(articulo => {
      const cumpleNombre = !this.filtroNombre || 
        articulo.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      
      const cumpleCategoria = !this.filtroCategoria || 
        articulo.categoria === this.filtroCategoria;
      
      return cumpleNombre && cumpleCategoria;
    });

    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    
    return filtrados.slice(inicio, fin);
  },

  totalPages() {
    if (!this.articulos) return 0;
    
    const filtrados = this.articulos.filter(articulo => {
      const cumpleNombre = !this.filtroNombre || 
        articulo.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const cumpleCategoria = !this.filtroCategoria || 
        articulo.categoria === this.filtroCategoria;
      return cumpleNombre && cumpleCategoria;
    });

    return Math.ceil(filtrados.length / this.itemsPerPage);
  },

    

    categorias() {
      return [
        'ANTIBIOTICO', 'ANALGESICO', 'ANTIFLAMATORIO', 'ANTIPIREPTICO',
        'VITAMINA', 'SUPLEMENTO', 'VACUNA', 'CURACION', 'VENDAJE',
        'ANTISEPTICO', 'SUTURAS', 'JERINGAS', 'GUANTES', 'GASAS',
        'CATETER', 'LIMPIEZA', 'DESINFECCION', 'ESTERILIZACION',
        'ALIMENTACION', 'HIDRATACION', 'SUEROS', 'VARIOS'
      ].sort();
    }
  },


  methods: {
    handlePageChange(newPage) {
    this.currentPage = newPage;
  },

    normalizarTexto(texto) {
      if (!texto) return '';
      return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
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

getRandomIcon(articulo) {
  const iconos = {
    'ANTIBIOTICO': { icon: 'mdi-bacteria', color: 'purple-darken-2' },
    'ANALGESICO': { icon: 'mdi-heart-pulse', color: 'red-darken-2' },
    'ANTIFLAMATORIO': { icon: 'mdi-hospital-box-outline', color: 'deep-orange-darken-2' }, 
    'ANTIPIREPTICO': { icon: 'mdi-thermometer', color: 'orange-darken-2' },
    'VITAMINA': { icon: 'mdi-pill', color: 'amber-darken-2' },
    'SUPLEMENTO': { icon: 'mdi-flask', color: 'lime-darken-2' },
    'VACUNA': { icon: 'mdi-needle', color: 'green-darken-3' },
    'CURACION': { icon: 'mdi-bandage', color: 'teal-darken-2' },
    'VENDAJE': { icon: 'mdi-medical-bag', color: 'cyan-darken-2' },
    'ANTISEPTICO': { icon: 'mdi-bottle-tonic-plus', color: 'blue-darken-2' },
    'SUTURAS': { icon: 'mdi-scissors-cutting', color: 'blue-grey-darken-3' },
    'JERINGAS': { icon: 'mdi-needle', color: 'indigo-darken-2' }, 
    'GUANTES': { icon: 'mdi-hand-wash', color: 'deep-purple-darken-2' }, 
    'GASAS': { icon: 'mdi-bandage', color: 'pink-darken-2' }, 
    'CATETER': { icon: 'mdi-iv-bag', color: 'light-blue-darken-2' },
    'LIMPIEZA': { icon: 'mdi-broom', color: 'light-green-darken-2' },
    'DESINFECCION': { icon: 'mdi-spray', color: 'green-darken-3' },
    'ESTERILIZACION': { icon: 'mdi-radioactive', color: 'orange-darken-3' },
    'ALIMENTACION': { icon: 'mdi-food-apple', color: 'red-darken-3' },
    'HIDRATACION': { icon: 'mdi-water', color: 'blue-lighten-1' },
    'SUEROS': { icon: 'mdi-iv-bag', color: 'cyan-darken-3' },
    'VARIOS': { icon: 'mdi-package-variant', color: 'grey-darken-2' }
  };

  return iconos[articulo.categoria] || { icon: 'mdi-hospital-box', color: 'grey-darken-1' };
},

watch: {
  filtroNombre: {
    handler() {
      this.currentPage = 1;
    }
  },
  filtroCategoria: {
    handler() {
      this.currentPage = 1;
    }
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
.icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.base-icon {
  font-size: 24px;
}

.overlay-icon {
  position: absolute;
  font-size: 14px;
  bottom: -4px;
  right: -4px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  border: 1px solid #e0e0e0;
}

.action-btn:hover .overlay-icon {
  background: #f5f5f5;
}
</style>