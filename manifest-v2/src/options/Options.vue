<template>
  <div id="wrapper">
    <table v-if="servers && servers.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>URL</th>
          <th>Username</th>
          <th>Password</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(server, idx) in servers" :key="server.id">
          <th>{{ server.name }}</th>
          <th>{{ server.protocol }}{{ server.host }}:{{ server.port }}</th>
          <th>{{ server.username }}</th>
          <th>{{ server.password }}</th>
          <th><button type="button" @click.prevent="editServerAtIndex(idx)">edit</button><button type="button"
              @click.prevent="removeServerAtIndex(idx)">remove</button></th>
        </tr>
      </tbody>
    </table>
    <fieldset>
      <legend>Server settings</legend>
      <p class="form-row">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model.trim="newServer.name" placeholder="my server name" required />
      </p>
      <p class="form-row">
        <label for="host">Protocol:</label>
        <select id="protocol" v-model="newServer.protocol">
          <option value="http://" default>http</option>
          <option value="https://">https</option>
        </select>
      </p>
      <p class="form-row">
        <label for="host">Host:</label>
        <input type="text" id="host" v-model.trim="newServer.host" placeholder="127.0.0.1" required />
      </p>

      <p class="form-row">
        <label for="port">Port:</label>
        <input type="number" id="port" v-model.number="newServer.port" placeholder="8080" required />
      </p>

      <p class="form-row">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model.trim="newServer.username"
          placeholder="leave empty if no auth required" />
      </p>

      <p class="form-row">
        <label for="password">Password:</label>
        <input type="text" id="password" v-model="newServer.password" placeholder="leave empty if no auth required" />
      </p>

      <div class="button-group">
        <button id="test" :disabled="!isServerConnectionFilled" @click="testServerConnection">Test connection</button>
        <button id="save" :disabled="!isServerConnectionFilled" @click="saveServerConfiguration">Save
          configuration</button>
      </div>
    </fieldset>
    <p v-if="statusMessage">{{ statusMessage }}</p>
  </div>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue'

const servers = ref([]);
const statusMessage = ref(null);
const isServerConnectionTestedSucessfully = ref(false);
const newServer = ref({
  id: null,
  name: null,
  protocol: 'http://',
  host: null,
  port: null,
  username: null,
  password: null
});

onMounted(() => {
  browser.storage.local.get('servers').then(data => {
    servers.value = data.servers ? JSON.parse(data.servers) : [];
  });
});

const isServerConnectionFilled = computed(() => {
  const { name, host, port, username, password } = newServer.value;
  const isUsernameAndPasswordValid = (username && password) || (!username && !password);
  return (
    !!name &&
    !!host &&
    Number.isInteger(port) &&
    port >= 1 &&
    port <= 65535 &&
    isUsernameAndPasswordValid
  );
});

const testServerConnection = () => {
  isServerConnectionTestedSucessfully.value = true;
  statusMessage.value = isServerConnectionTestedSucessfully.value ? "✅ Connection checked sucessfully" : "❌ Connection error";
};

const saveToStorage = () => {
  browser.storage.local.set({ servers: JSON.stringify(servers.value) });
  newServer.value = {
    id: null,
    name: null,
    protocol: 'http://',
    host: null,
    port: null,
    username: null,
    password: null
  };
};

const saveServerConfiguration = () => {
  if (!newServer.value.id) {
    servers.value.push({
      id: Date.now(),
      name: newServer.value.name,
      protocol: newServer.value.protocol,
      host: newServer.value.host,
      port: newServer.value.port,
      username: newServer.value.username || null,
      password: newServer.value.password || null
    });
  } else {
    servers.value = servers.value.map((server) =>
      server.id === newServer.value.id ? { ...newServer.value } : server
    );
  }
  saveToStorage();
  isServerConnectionTestedSucessfully.value = false;
  statusMessage.value = "✅ Server settings saved sucessfully";
};



const editServerAtIndex = (index) => {
  newServer.value = { ...servers.value[index] };
  statusMessage.value = null;
};

const removeServerAtIndex = (index) => {
  statusMessage.value = null;
  servers.value.splice(index, 1);
  saveToStorage();
  statusMessage.value = "✅ Server settings removed sucessfully";
};

</script>