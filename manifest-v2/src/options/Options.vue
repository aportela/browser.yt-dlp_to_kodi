<template>
  <div id="wrapper">
    <h1>Settings</h1>
    <table v-if="servers && servers.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Host</th>
          <th>Port</th>
          <th>Username</th>
          <th>Password</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(server, idx) in servers" :key="server.id">
          <th>{{ server.name }}</th>
          <th>{{ server.host }}</th>
          <th>{{ server.port }}</th>
          <th>{{ server.username }}</th>
          <th>{{ server.password }}</th>
          <th><button type="button" @click.prevent="editServerAtIndex(idx)">edit</button><button type="button"
              @click.prevent="removeServerAtIndex(idx)">remove</button></th>
        </tr>
      </tbody>
    </table>
    <p class="form-row">
      <label for="host">Protocol:</label>
      <select id="protocol" v-model="newServer.protocol">
        <option value="http://" default>http</option>
        <!--
          <option value="https://">https</option>
          -->
      </select>
    </p>
    <p class="form-row">
      <label for="name">Name:</label>
      <input type="text" id="name" v-model.trim="newServer.name" placeholder="127.0.0.1" required />
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
      <button id="test" :disabled="!isTestButtonEnabled" @click="test">Test connection</button>
      <button id="save" :disabled="!isSaveButtonEnabled" @click="save">Save configuration</button>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue'

const servers = ref([]);
const testOK = ref(false);
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
  const style = document.createElement('style');
  style.textContent = `

table {
  width: 100%;
  border: 2px solid #222;
}

div#wrapper {
  background-color: whitesmoke;
  list-style-type: none;
  padding: 0;
  border-radius: 3px;
}

.form-row {
  display: flex;
  justify-content: flex-end;
  padding: 0em .5em;
}

.form-row>label {
  padding: .5em 1em .5em 0;
  flex: 1;
  font-weight: bold;
  font-size: 1.2em;
}

.form-row>input,
.form-row>select {
  flex: 2;
}

.form-row>input,
.form-row>select,
.form-row>button {
  padding: .5em;
}

.form-row>button {
  background: gray;
  color: white;
  border: 0;
}

.button-group {
  display: flex;
  width: 100%;
  gap: 10px;
  margin-top: 10px;
}

.button-group button {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  color: white;
  background-color: #0078d7;
  transition: background-color 0.3s ease;
  text-align: center;
}

.button-group button:hover {
  background-color: #005a9e;
}
      `;
  document.head.appendChild(style);
  browser.storage.local.get('servers').then(data => {
    servers.value = data.servers ? JSON.parse(data.servers) : [];
  });
});

const isTestButtonEnabled = computed(() => {
  const { name, host, port } = newServer.value;
  return (
    !!name &&
    !!host &&
    Number.isInteger(port) &&
    port >= 1 &&
    port <= 65535
  );
});
const isSaveButtonEnabled = computed(() => {

  return (isTestButtonEnabled.value && testOK.value);
});

const test = () => {
  testOK.value = true;
};

const save = () => {
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
  testOK.value = false;
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

const editServerAtIndex = (index) => {
  newServer.value = { ...servers.value[index] };
};

const removeServerAtIndex = (index) => {
  servers.value.splice(index, 1);
  saveToStorage();
};

</script>