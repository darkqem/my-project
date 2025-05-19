<template>
    <aside class="AppSideMenu">
      <h2>Меню</h2>
      <ul>
        <li><a href="#">Раздел 1</a></li>
        <li><a href="#">Раздел 2</a></li>
        <li><a href="#">Раздел 3</a></li>
      </ul>
    </aside>
  </template>
  
  <script>
  export default {
    name: 'AppSidebar',
  };
  </script>
  
  <style scoped>
  .sidebar {
    background-color: #f4f4f4;
    padding: 20px;
    width: 250px;
  }
  .sidebar ul {
    list-style-type: none;
    padding: 0;
  }
  .sidebar ul li {
    margin: 10px 0;
  }
  .sidebar ul li a {
    text-decoration: none;
    color: #333;
  }
  </style>
  