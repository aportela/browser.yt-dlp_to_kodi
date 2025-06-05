<template>
  <div>
    <h1>Settings</h1>
    <input v-model="text" placeholder="Example test" />
    <button @click="guardar">Save</button>
    <p>Saved: {{ text }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: ''
    };
  },
  mounted() {
    browser.storage.local.get('text').then(data => {
      this.text = data.text || '';
    });
  },
  methods: {
    guardar() {
      browser.storage.local.set({ text: this.text });
    }
  }
};
</script>