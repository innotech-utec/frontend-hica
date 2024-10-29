<template>
  <v-container class="home-container pa-0" fluid>
    <!-- Barra lateral usando v-navigation-drawer -->
    <!-- Barra lateral con logo arriba -->
    <v-navigation-drawer
      permanent
      color="white"
      width="250"
      class="elevation-4"
    >
      <!-- Logo en la parte superior -->
      <div class="pa-4">
        <img src="/img/logo_hica.a2471d14.png" alt="HICA" class="logo mb-6" />
      </div>

      <!-- Menú debajo del logo -->
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
      <v-container fluid class="pa-6">
        <h2 class="text-h5 mb-4">Panel tareas del día</h2>

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
              <v-card-title>Tratamientos</v-card-title>
              <v-card-text>
                <v-table>
                  <thead>
                    <tr>
                      <th>No. Registro</th>
                      <th>Nombre</th>
                      <th>Especie</th>
                      <th>Tratamiento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="treatment in treatments" :key="treatment.id">
                      <td class="text-primary">{{ treatment.id }}</td>
                      <td>{{ treatment.name }}</td>
                      <td>{{ treatment.species }}</td>
                      <td>{{ treatment.treatment }}</td>
                      <td>
                        <v-chip
                          :color="getStatusColor(treatment.status)"
                          text-color="white"
                          size="small"
                        >
                          {{ treatment.status }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
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

            <!-- Tabla de Cirugías -->
            <v-card>
              <v-card-title>Cirugías</v-card-title>
              <v-card-text>
                <v-table>
                  <thead>
                    <tr>
                      <th>No. Registro</th>
                      <th>Nombre</th>
                      <th>Especie</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="surgery in surgeries" :key="surgery.id">
                      <td class="text-primary">{{ surgery.id }}</td>
                      <td>{{ surgery.name }}</td>
                      <td>{{ surgery.species }}</td>
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
export default {
  name: "HomePage",
  data() {
    return {
      currentDate: new Date(),
      weekDays: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
      menuItems: [
        { title: 'Responsables', icon: 'mdi-account', route: '/responsables' },
        { title: 'Usuarios', icon: 'mdi-account-group', route: '/usuarios' },
        { title: 'Animales', icon: 'mdi-paw', route: '/animales' },
        { title: 'Laboratorio', icon: 'mdi-flask', route: '/laboratorio' },
        { title: 'Insumos', icon: 'mdi-cube-outline', route: '/insumos' },
        { title: 'Reportes', icon: 'mdi-file-chart', route: '/reportes' },
      ],
      summaryCards: [
        {
          title: 'Administrar tratamientos',
          count: 10,
          icon: 'mdi-medical-bag',
          bgColor: 'bg-light-green',
          borderColor: '#4CAF50',
          iconColor: 'light-green-darken-2'
        },
        {
          title: 'Animales internados',
          count: 3,
          icon: 'mdi-barn',
          bgColor: 'bg-light-blue',
          borderColor: '#2196F3',
          iconColor: 'light-blue-darken-2'
        },
        {
          title: 'Cirugías programadas',
          count: 10,
          icon: 'mdi-clipboard-text',
          bgColor: 'bg-purple',
          borderColor: '#9C27B0',
          iconColor: 'purple-darken-2'
        }
      ],
      treatments: [
        { id: '2622/22', name: 'Methmat', species: 'Equino', treatment: 'Curación', status: 'Atrasado' },
        { id: '2622/22', name: 'Ruth', species: 'Equino', treatment: 'Antiinflamatorio', status: 'Atrasado' },
        { id: '2819/23', name: 'Mango', species: 'Equino', treatment: 'Analgésico', status: 'Pendiente' },
        { id: '2794/22', name: 'Pieri', species: 'Equino', treatment: 'Antibiótico', status: 'Pendiente' },
        { id: '2822/22', name: 'Dante', species: 'Equino', treatment: 'Antialérgico', status: 'Realizado' },
        { id: '2516/23', name: 'Meli', species: 'Equino', treatment: 'Analgésico', status: 'Realizado' },
        { id: '2516/23', name: 'Meli', species: 'Equino', treatment: 'Curación', status: 'Realizado' }
      ],
      surgeries: [
        { id: '2622/22', name: 'Methmat', species: 'Equino' },
        { id: '2622/22', name: 'Ruth', species: 'Equino' },
        { id: '2622/22', name: 'Ruth', species: 'Equino' }
      ]
    }
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
    getStatusColor(status) {
      switch (status) {
        case 'Atrasado': return 'error';
        case 'Pendiente': return 'warning';
        case 'Realizado': return 'success';
        default: return 'grey';
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
    }
  }
};
</script>

<style scoped>

.summary-card {
  border-radius: 8px;
}

.bg-light-green {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.bg-light-blue {
  background-color: rgba(33, 150, 243, 0.1) !important;
}

.bg-purple {
  background-color: rgba(156, 39, 176, 0.1) !important;
}

.v-navigation-drawer {
  border-radius: 0 10px 10px 0;
}

/* Estilo para el logo */
.logo {
  width: 150px;
  display: block;
  margin: 0 auto;
}

/* Estilo para los items del menú */
.menu-item {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-list-item-title {
  font-size: 1.1rem;
  padding: 8px 0;
}

.v-table {
  width: 100%;
}

.current-day {
  background-color: var(--v-primary-base);
  color: white;
  border-radius: 50%;
}
</style>