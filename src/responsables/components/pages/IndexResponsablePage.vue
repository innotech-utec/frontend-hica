<template>
  <v-container>
    <BackButton />
    <!-- Título de la página -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Listado de Responsables</h2>
      </v-col>
    </v-row>

    <!-- Botón para añadir responsable -->
    <v-btn color="primary" class="add-responsable-btn" @click="$router.push({ name: 'responsables.create' })">
      <v-icon>mdi-plus</v-icon>
      Añadir Responsable
    </v-btn>

    <!-- Tabla de responsables -->
    <v-row>
      <v-col cols="12">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Domicilio</th>
                <th>Animales Registrados</th> <!-- Nueva columna para contar animales -->
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="responsable in responsables" :key="responsable.id">
                <td>{{ responsable.documento }}</td>
                <td>{{ responsable.nombre }}</td>
                <td>{{ responsable.apellido }}</td>
                <td>{{ responsable.domicilio }}</td>
                <td>{{ responsable.animales ? responsable.animales.length : 0 }}</td> <!-- Cantidad de animales -->
                <td>
                  <v-chip :color="responsable.estado ? 'green' : 'red'" dark>
                    {{ responsable.estado ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </td>
                <td>
                  <!-- Editar responsable -->
                  <v-btn icon @click="editResponsable(responsable.id)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>

                  <!-- Agregar animales -->
                  <v-btn icon @click="addAnimalToResponsable(responsable.id)">
                    <v-icon>mdi-paw</v-icon> <!-- Icono de animal para agregar animales -->
                  </v-btn>

                  <!-- Eliminar responsable -->
                  <v-btn icon @click="confirmDeleteResponsable(responsable.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import backend from '@/backend';
import Swal from 'sweetalert2';
import BackButton from '@/shared/components/BackButton.vue';

export default {
  data() {
    return {
      responsables: [], // Lista de responsables, incluye la relación con animales
      loading: false,
    };
  },

  components: {
    BackButton,
  },
  methods: {
    // Método para obtener responsables junto con la cantidad de animales
    async fetchResponsables() {
      this.loading = true;
      try {
        const response = await backend.get('/responsables'); // Asegúrate de incluir la relación animales en la consulta
        this.responsables = response.data;
      } catch (error) {
        console.error('Error al obtener responsables:', error);
      } finally {
        this.loading = false;
      }
    },
    editResponsable(id) {
      this.$router.push({ name: 'responsables.edit', params: { id } });
    },
    async confirmDeleteResponsable(id) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        this.deleteResponsable(id);
      }
    },
    async deleteResponsable(id) {
      try {
        await backend.delete(`/responsables/${id}`);
        this.fetchResponsables();
        Swal.fire('¡Eliminado!', 'El responsable ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error al eliminar responsable:', error);
        Swal.fire('Error', 'No se pudo eliminar el responsable', 'error');
      }
    },
    addAnimalToResponsable(id) {
      this.$router.push({ name: 'animales.create', params: { responsableId: id } });
    },
  },
  created() {
    this.fetchResponsables();
  },
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
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 10px;
}

.table th {
  background-color: #f2f2f2;
  text-align: left;
}

.table td {
  text-align: left;
  vertical-align: middle;
}


@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .add-responsable-btn {
    width: 100%;
    margin-bottom: 10px;
    margin-bottom: 20px;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px;
  }

  .v-btn {
    width: 100%;
  }
}
</style>
