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
          <th><button type="button" @click.prevent="editServerAtIndex(idx)" :disabled="loading"
              title="update server settings">✎</button><button type="button" @click.prevent="removeServerAtIndex(idx)"
              :disabled="loading" title="remove server settings">🗑️</button>
          </th>
        </tr>
      </tbody>
    </table>
    <fieldset>
      <legend>Server settings</legend>
      <p class="form-row">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model.trim="newServer.name" placeholder="my server name" required
          :disabled="loading" />
      </p>
      <p class="form-row">
        <label for="host">Protocol:</label>
        <select id="protocol" v-model="newServer.protocol" :disabled="loading">
          <option value="http://" default>http</option>
          <option value="https://">https</option>
        </select>
      </p>
      <p class="form-row">
        <label for="host">Host:</label>
        <input type="text" id="host" v-model.trim="newServer.host" placeholder="127.0.0.1" required
          :disabled="loading" />
      </p>

      <p class="form-row">
        <label for="port">Port:</label>
        <input type="number" id="port" v-model.number="newServer.port" placeholder="8080" required
          :disabled="loading" />
      </p>

      <p class="form-row">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model.trim="newServer.username" placeholder="leave empty if no auth required"
          :disabled="loading" />
      </p>

      <p class="form-row">
        <label for="password">Password:</label>
        <input type="text" id="password" v-model="newServer.password" placeholder="leave empty if no auth required"
          :disabled="loading" />
      </p>

      <div class="button-group">
        <button id="test" :disabled="loading || !isServerConnectionFilled" @click="testServerConnection"
          :class="{ 'rotate-button': testing }"><span v-show="testing">⚙</span> Test
          connection</button>
        <button id="save" :disabled="loading || !isServerConnectionFilled" @click="saveServerConfiguration"
          :class="{ 'rotate-button': saving }"><span v-show="saving">⚙</span>
          Save configuration</button>
      </div>
    </fieldset>
    <p v-if="statusMessage">{{ statusMessage }}</p>
  </div>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue'

const testing = ref(false);
const saving = ref(false);
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

const loading = computed(() => {
  return (testing.value || saving.value);
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
  isServerConnectionTestedSucessfully.value = false;
  statusMessage.value = null;
  const kodiUrl = `${newServer.value.protocol}${newServer.value.host}:${newServer.value.port}/jsonrpc`;
  const payload = {
    "method": "Application.GetProperties",
    params: {
      "properties": ["version"]
    },
    id: 1,
    jsonrpc: "2.0",
  };
  const headers = {
    "Content-Type": "application/json",
  };
  if (newServer.value.username && newServer.value.password) {
    headers["Authorization"] = "Basic " + btoa(`${newServer.value.username}:${newServer.value.password}`);
  }
  testing.value = true;
  fetch(kodiUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error connecting Kodi: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      testing.value = false;
      isServerConnectionTestedSucessfully.value = true;
      console.debug("Kodi response:", data);
      if (data.result && data.result.version) {
        statusMessage.value = `✅ Connection checked sucessfully, remote kodi version: ${data.result.version.major || "0"}.${data.result.version.minor || "0"} (${data.result.version.revision || "revision"} / ${data.result.version.tag || "tag"})`;
      } else {
        console.error("Invalid kodi version response");
        statusMessage.value = "❌ Connection error: Invalid kodi version response";
      }
    })
    .catch((error) => {
      testing.value = false;
      console.error("Error connecting Kodi:", error);
      statusMessage.value = `❌ Connection error: ${error}`;
    });
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
  saving.value = true;
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
  saving.value = false;
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