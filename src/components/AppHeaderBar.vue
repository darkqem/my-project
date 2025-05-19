<template>
    <header class="AppHeaderBar">
      <h1>Мой сайт</h1>
      <nav>
        <ul>
          <li><a href="#">Главная</a></li>
          <li><a href="#">О нас</a></li>
          <li><a href="#">Контакты</a></li>
        </ul>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    name: 'AppHeader',
  };
  </script>
  
  <style scoped>
  .header {
    background-color: #333;
    color: white;
    padding: 20px;
    text-align: center;
  }
  nav ul {
    list-style-type: none;
    padding: 0;
  }
  nav ul li {
    display: inline;
    margin: 0 15px;
  }
  nav ul li a {
    color: white;
    text-decoration: none;
  }
  </style>
  