<template>
  <div class="login-page">
    <h2>Вход</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label>Логин:</label>
        <input v-model="loginValue" type="text" required />
      </div>
      <div class="form-group">
        <label>Пароль:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Войти</button>
      <div v-if="error" style="color: red; margin-top: 10px;">{{ error }}</div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginValue: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async login() {
      this.error = '';
      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: this.loginValue, pass: this.password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', this.loginValue);
          this.$router.push('/'); // или на нужную страницу
        } else {
          this.error = data.message || 'Ошибка входа';
        }
      } catch (err) {
        this.error = 'Ошибка соединения с сервером';
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  max-width: 350px;
  margin: 0 auto;
  
  
  flex-direction: column;
  
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.form-group {
  margin-bottom: 16px;
  width: 100%;
}
label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
}
button {
  width: 100%;
  padding: 10px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
button:hover {
  background: #388e3c;
}
</style>
