<template>
  <v-container class="home-container pa-0" fluid>
    <v-navigation-drawer permanent color="white" width="250" class="elevation-4">
      <!-- Logo en la parte superior -->
      <div class="pa-4">
        <img src="/HICA_logo.png" alt="HICA" class="logo mb-6" />
      </div>

      <!-- Menú lateral -->
      <v-list nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          link
          class="menu-item"
        >
          <template v-slot:prepend>
            <v-icon color="grey-darken-1">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title class="text-grey-darken-1">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main class="pl-0">
      <v-app-bar app elevation="0" class="v-app-bar-transparent">
  <v-spacer></v-spacer>
  <v-menu location="bottom end">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="text" class="d-flex align-center">
        <!-- Avatar del usuario -->
        <v-avatar size="40" class="mr-3">
          <img 
            v-if="avatarUrl" 
            :src="avatarUrl" 
            alt="Avatar generado dinámicamente"
            style="object-fit: cover; width: 100%; height: 100%; border-radius: 50%;"
          />
          <v-icon v-else size="40" color="#014582">mdi-account-circle</v-icon>
        </v-avatar>
        <!-- Nombre del usuario -->
        <span class="text-primary font-weight-bold">{{ userInfo.nombre }} {{ userInfo.apellido }}</span>
        <v-icon right>mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">{{ userInfo.nombre }} {{ userInfo.apellido }}</v-list-item-title>
          <v-list-item-subtitle>{{ userRole }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item @click="goToSettings" link>
        <template v-slot:prepend>
          <v-icon>mdi-cog</v-icon>
        </template>
        <v-list-item-title>Ajustes</v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item @click="logout" link>
        <template v-slot:prepend>
          <v-icon>mdi-logout</v-icon>
        </template>
        <v-list-item-title>Cerrar Sesión</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</v-app-bar>


      <v-container fluid class="pa-6">
        <h2 class="text-h5 mb-4">Panel de tareas del día</h2>

        <!-- Tarjetas de resumen -->
        <v-row>
          <v-col cols="4" v-for="(card, index) in summaryCards" :key="index">
            <v-card
              :class="card.bgColor"
              class="summary-card"
              :style="`border: 2px solid ${card.borderColor}`"
            >
              <div class="d-flex align-center pa-4">
                <v-icon :color="card.iconColor" size="50" class="mr-4">
                  {{ card.icon }}
                </v-icon>
                <div>
                  <div class="text-h4 font-weight-bold text-black">{{ card.count }}</div>
                  <div class="text-body-2 text-black">{{ card.title }}</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Contenido Principal -->
        <v-row class="mt-4">
          <!-- Tabla de Tratamientos -->
          <v-col cols="8">
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                Tratamientos
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  color="primary"
                  size="24"
                ></v-progress-circular>
              </v-card-title>
              <v-card-text>
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Medicación</th>
                        <th>Observaciones</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loading" class="text-center">
                        <td colspan="5">
                          <span class="text-medium-emphasis">Cargando tratamientos...</span>
                        </td>
                      </tr>
                      <tr v-else-if="treatments.length === 0" class="text-center">
                        <td colspan="5">No hay tratamientos disponibles.</td>
                      </tr>
                      <tr v-for="treatment in treatments" :key="treatment.id">
                        <td>{{ formatDate(treatment.fecha) }}</td>
                        <td>{{ formatTime(treatment.hora) }}</td>
                        <td>{{ treatment.medicacion }}</td>
                        <td>{{ treatment.observaciones }}</td>
                        <td>
                          <v-chip :color="getStatusColor(treatment.estadoAutorizacion, treatment.fecha, treatment.hora)" text-color="white" size="small">
                            {{ getStatusText(treatment.estadoAutorizacion, treatment.fecha, treatment.hora) }}
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Calendario y Cirugías -->
          <v-col cols="4">
            <!-- Calendario -->
            <v-card class="mb-4">
              <v-card-title class="d-flex justify-space-between align-center">
                <v-btn icon="mdi-chevron-left" variant="text" @click="previousMonth"></v-btn>
                {{ currentMonthYear }}
                <v-btn icon="mdi-chevron-right" variant="text" @click="nextMonth"></v-btn>
              </v-card-title>
              <v-card-text>
                <v-row class="text-center">
                  <v-col v-for="day in weekDays" :key="day" cols="12" sm="auto">
                    {{ day }}
                  </v-col>
                </v-row>
                <v-row class="text-center">
                  <v-col 
                    v-for="date in monthDates" 
                    :key="date.day"
                    cols="12" 
                    sm="auto"
                    :class="{'current-day': isCurrentDay(date.day)}"
                  >
                    {{ date.day }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Tabla de Mis casos -->
<v-card>
  <v-card-title>Mis Casos</v-card-title>
  <v-card-text>
    <v-table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Especie</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="3" class="text-center">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          </td>
        </tr>
        <tr v-else-if="casosPropios.length === 0" class="text-center">
          <td colspan="3">No hay casos asignados.</td>
        </tr>
        <tr v-for="caso in casosPropios" :key="caso.id">
          <td>{{ caso.animal.nombre }}</td>
          <td>{{ caso.animal.especie }}</td>
          <td>
            <v-btn
              color="primary"
              variant="text"
              size="small"
              :to="`/animales/ficha-clinica?fichaClinicaId=${caso.id}&animalId=${caso.animalId}`"
            >
              Ver Ficha
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card-text>
</v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-container>
</template>

<script>
import backend from '@/backend';
import Swal from 'sweetalert2';
import { AuthService } from '@/auth/services/AuthService';

export default {
  name: "HomePage",
  data() {
    return {
      userInfo: {
      nombre: '',
      apellido: '',
      isAdmin: false,
    },
    userRole: '',
    avatarUrl: null, 
    gender: null,    
      currentDate: new Date(),
      weekDays: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
      menuItems: [
        { title: 'Propietarios', icon: 'mdi-account', route: '/responsables' },
        { title: 'Usuarios', icon: 'mdi-account-group', route: '/usuarios' },
        { title: 'Animales', icon: 'mdi-paw', route: '/animales' },
        { title: 'Insumos', icon: 'mdi-cube-outline', route: '/articulos' },
        { title: 'Reportes', icon: 'mdi-file-chart', route: '/reporte' },
      ],
      summaryCards: [
        {
          title: 'Administrar tratamientos',
          count: 0,
          icon: 'mdi-medical-bag',
          bgColor: 'bg-light-green',
          borderColor: '#4CAF50',
          iconColor: 'light-green-darken-2'
        },
        {
          title: 'Animales internados',
          count: 1,
          icon: 'mdi-barn',
          bgColor: 'bg-light-blue',
          borderColor: '#2196F3',
          iconColor: 'light-blue-darken-2'
        },
        {
          title: 'Casos asignados a mí',
          count: 0,
          icon: 'mdi-clipboard-text',
          bgColor: 'bg-purple',
          borderColor: '#9C27B0',
          iconColor: 'purple-darken-2'
        }
      ],
      treatments: [],
      internados: 0,
      loading: false,
      veterinarioId: null,
      casosPropios: [],
    };
  },
  computed: {
    currentMonthYear() {
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    },
    monthDates() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        date: new Date(year, month, i + 1)
      }));
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
   
    goToSettings() {
    this.$router.push('/ajustes');
  },
    formatTime(time) {
      return time.substring(0, 5);
    },
    isTreatmentOverdue(fecha, hora) {
    // Crear fecha y hora del tratamiento
    const treatmentDateTime = new Date(`${fecha}T${hora}`);
    
    const now = new Date();

    return treatmentDateTime < now;
    },
    logout() {
      localStorage.clear();
      this.$router.push('/login');
    },
    async fetchGender(name) {
  try {
    const response = await fetch(`https://api.genderize.io?name=${name}`);
    const data = await response.json();

    // Si no hay respuesta o género, establecemos "neutral" como fallback
    this.gender = data.gender || 'neutral';
    console.log('Género detectado:', this.gender);
  } catch (error) {
    console.error('Error al obtener el género:', error);
    this.gender = 'neutral'; // Fallback en caso de error
  }
},
generateAvatar() {
    // Crea la URL para UI Avatars con nombre, iniciales y colores personalizados
    const name = `${this.userInfo.nombre} ${this.userInfo.apellido}`;
    this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=014582&color=ffffff&size=128&bold=true`;
    console.log('Avatar URL:', this.avatarUrl);
},

  
async getUserInfo() {
  try {
    const user = AuthService.getLoggedUser();
    if (user) {
      const response = await backend.get(`/usuarios/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.userInfo = response.data;

      // Verificar si el usuario tiene ambos roles o uno solo
      if (this.userInfo.isAdmin && this.veterinarioId) {
        this.userRole = 'Administrador y Veterinario';
      } else if (this.userInfo.isAdmin) {
        this.userRole = 'Administrador';
      } else if (this.veterinarioId) {
        this.userRole = 'Veterinario';
      } else {
        this.userRole = 'Usuario';
      }
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
  }
},


    getStatusText(status, fecha, hora) {
    switch(status) {
      case 'APROBADO':
        return this.isTreatmentOverdue(fecha, hora) ? 'ATRASADO' : 'PENDIENTE ADMINISTRACION';
      case 'PENDIENTE':
        return 'PENDIENTE AUTORIZACION';
      default:
        return status;
    }
    },

    getStatusColor(status, fecha, hora) {
    if(status === 'RECHAZADO') {
      return false; // No mostrar rechazados
    }
    
    if(status === 'COMPLETADO') {
      return 'success'; // Verde
    }
    
    if(status === 'PENDIENTE') {
      return 'info'; // Azul
    }
    
    if(status === 'APROBADO') {
      // Si está atrasado
      if(this.isTreatmentOverdue(fecha, hora)) {
        return 'error'; // Rojo
      }
      // Si está en fecha
      return 'warning'; // Amarillo
    }
    },
    async fetchTreatments() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await backend.get('/tratamientos', {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.treatments = this.treatments = response.data.filter(t => 
          t.estadoAutorizacion !== 'RECHAZADO' && 
          t.estadoAutorizacion !== 'COMPLETADO'
        );

        //Contabilizar tratamientos
        this.summaryCards[0].count = this.treatments.length;

        //Contabilizar internados
        const responseInternados = await backend.get('/internados', {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.internados = responseInternados.data.internados;
        this.summaryCards[1].count = this.internados

      } catch (error) {
        console.error('Error al obtener tratamientos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los tratamientos',
          confirmButtonColor: '#3085d6'
        });
      } finally {
        this.loading = false;
      }
    },
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), 
                                this.currentDate.getMonth() - 1, 
                                1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), 
                                this.currentDate.getMonth() + 1, 
                                1);
    },
    isCurrentDay(day) {
      const today = new Date();
      return day === today.getDate() && 
             this.currentDate.getMonth() === today.getMonth() &&
             this.currentDate.getFullYear() === today.getFullYear();
    },
    async checkIfVeterinario() {
      const user = AuthService.getLoggedUser();
      try {
        const response = await backend.get(`/veterinarios/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data) {
          this.veterinarioId = response.data.id;
          await this.fetchCasosPropios();
        }
      } catch (error) {
        console.error('Error al verificar veterinario:', error);
      }
    },
    async fetchCasosPropios() {
      if (!this.veterinarioId) return;
      try {
        const response = await backend.get(`/veterinarios/${this.veterinarioId}/fichas`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.casosPropios = response.data.fichas;
        // Actualizar contador en summaryCards
        this.summaryCards[2].count = this.casosPropios.length;
      } catch (error) {
        console.error('Error al obtener casos:', error);
      }
    },
  },
  async created() {
    await this.checkIfVeterinario();
    await this.fetchTreatments();
    await this.getUserInfo();
    await this.fetchGender(this.userInfo.nombre);
    this.generateAvatar();
  }
};
</script>

<style scoped>
.summary-card {
  border-radius: 8px;
}
.bg-light-green { background-color: rgba(76, 175, 80, 0.1) !important; }
.bg-light-blue { background-color: rgba(33, 150, 243, 0.1) !important; }
.bg-purple { background-color: rgba(156, 39, 176, 0.1) !important; }
.v-navigation-drawer { border-radius: 0 10px 10px 0; }
.logo { width: 150px; display: block; margin: 0 auto; }
.menu-item { margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.menu-item:hover { background-color: rgba(255, 255, 255, 0.1); }
.v-list-item-title { font-size: 1.1rem; padding: 8px 0; }
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
  text-align: left;
}
.table th {
  background-color: #e8eaf6;
  color: #014582;
  font-weight: bold;
}
.current-day { 
  background-color: var(--v-primary-base); 
  color: white; 
  border-radius: 50%; 
}





.v-btn {
    padding: 0;
    margin: 0;
}
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 50px); /* Adjust the height as needed */
}

.v-app-bar-transparent {
  position: fixed;
  top: 0;
  left: 250px; /* Ancho del drawer lateral */
  right: 0;
  background-color: transparent; /* Barra transparente */
  border-bottom: none; /* Elimina bordes */
  z-index: 10;
  box-shadow: none; /* Sin sombras */
  padding: 8px 16px;
}
.v-avatar img {
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra ligera */
}


</style>