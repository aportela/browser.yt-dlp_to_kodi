<template>
  <div>
    <div>
      <h1>yt-dlp to kodi</h1>
      <button @click="openOptions">Open settings</button>
    </div>
    <ul>
      <li v-for="(server, idx) in servers" :key="server.id">{{ server.name }} <button type="button"
          @click="sendToServer(server)">send</button></li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      servers: []
    };
  },
  mounted() {
    browser.storage.local.get('servers').then(data => {
      this.servers = data.servers ? JSON.parse(data.servers) : [];
    });

  },
  methods: {
    openOptions() {
      if (browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage();
      } else {
        window.open(browser.runtime.getURL("options.html"));
      }
    },
    sendToServer(server) {
      console.log(server);
    }
  }
};
</script>