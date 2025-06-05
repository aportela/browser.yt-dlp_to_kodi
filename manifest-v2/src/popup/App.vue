<template>
  <div>
    <div>
      <h1>yt-dlp to kodi</h1>
      <button @click="openOptions">Open settings</button>
    </div>
    <ul>
      <li v-for="(server, idx) in servers" :key="server.id">{{ server.name }}</li>
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
      this.servers = data.servers || [];
      console.log(this.servers.length);
      console.log(this.servers[0]);
    });
  },
  methods: {
    openOptions() {
      if (browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage();
      } else {
        window.open(browser.runtime.getURL("options.html"));
      }
    }
  }
};
</script>