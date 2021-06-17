<template>
  <div id="app">
    <TopNavigation :local-entries="testLocalEntries" local-rule="concat" />
    <div id="content">
      Hello World!
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import TopNavigation from './components/TopNavigation'
import BottomNavigation from './components/BottomNavigation'

export default {
  name: 'App',
  components: {
    TopNavigation,
    BottomNavigation
  },
  computed: {
    testLocalEntries() {
      return [{
        'label': {
          'de_DE': "neu",
          'en_EN': "new"
        },
        'url': '/new'
      }]
    }
  }
}
</script>

<style>
#app {
  /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: min-content;
}
#content {
  flex-grow: 1;
  flex-shrink: 0;
  display: flex;
  overflow: auto;
}
</style>
