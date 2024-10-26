<template>
    <div class="paginator">
      <div
        class="paginator__item"
        v-for="current in length"
        :key="current"
        :class="{ active: current === currentPage }"
        @click="changePage(current)"
      >
        {{ current }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      length: {
        type: Number,
        required: true,
        default: 1
      },
      currentPage: {
        type: Number,
        default: 1
      }
    },
    methods: {
      changePage(page) {
        if (page !== this.currentPage) {
          this.$emit('pageChange', page); // Emitimos el evento de cambio de página
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .paginator {
    display: flex;
    justify-content: center; 
    position: bottom;
    /*margin-bottom: auto; /* Asegura que el paginador siempre esté al final */
    gap: 8px;
    padding: 20px 0; /* Espacio entre el contenido y el paginador */
  }
  
  .paginator__item {
    background-color: #f0f0f0; 
    color: #555; /* Color de texto sutil */
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .paginator__item:hover {
    background-color: #e0e0e0; 
  }
  
  .paginator__item.active {
    background-color: #008575; 
    color: white;
  }
  </style>
  