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
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const tab = tabs[0];
        // TODO: server protocol
        const kodiUrl = `http://${server.host}:${server.port}/jsonrpc`;
        const payload = {
          method: "Addons.ExecuteAddon",
          params: {
            addonid: "plugin.video.yt-dlp_to_kodi",
            params: {
              action: "process",
              url: tab.url,
            },
          },
          id: 1,
          jsonrpc: "2.0",
        };
        const headers = {
          "Content-Type": "application/json",
        };
        if (server.username && server.password) {
          headers["Authorization"] = "Basic " + btoa(`${server.username}:${server.password}`);
        }
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
            console.debug("Kodi response:", data);
          })
          .catch((error) => {
            console.error("Error connecting Kodi:", error);
          });
      });
    }
  }
}
</script>