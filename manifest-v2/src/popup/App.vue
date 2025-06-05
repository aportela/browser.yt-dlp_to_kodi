<template>
  <div>
    <div>
      <h1>yt-dlp to kodi</h1>
      <button @click="openOptions">Open settings</button>
    </div>
    <ul>
      <li v-for="server in servers" :key="server.id">{{ server.name }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      servers: [
        {
          id: 1,
          name: "server 1"
        },
        {
          id: 2,
          name: "server 2"
        }
      ]
    };
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