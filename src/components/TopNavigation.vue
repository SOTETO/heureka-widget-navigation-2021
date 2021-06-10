<template>
  <div class="navbar navbar-vca navbar-default vca-shadow"> <!-- navbar-default -->
    <div class="container">
      <div class="navbar-header">
        <a class="navbar-brand" href="/">
          <img src="/dispenser/images/drop_small.png"/>
          <div>
            <span class="bold">{{ $vcaI18n.t('header.applicationName') }}</span>
            <span>{{ $vcaI18n.t('header.organizationName') }}</span>
          </div>
        </a>
        <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
          <span class="sr-only">{{ $vcaI18n.t('nav.labels.screenreader.toggle') }}</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
      </div>
      <div class="navbar-collapse collapse" id="navbar-main">
        <ul class="nav navbar-nav navbar-right">
          <MenuEntry v-for="entry in entries()" :key="entry.id" :entry="entry" type="button" :layer="0" :roles="roles" />
        </ul>
        <ul v-if="errors && errors.length">
          <li v-for="error of errors" :key="error.id">
            {{error.message}}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import MenuEntry from './MenuEntry'

export default {
  name: 'TopNavigation',
  components: { MenuEntry },
  data () {
    return {
      "flag": "default"
    }
  },
  computed: {
    ...mapGetters('user', {
      roles: 'roles',
      isAuthenticated: 'isAuthenticated',
      userError: 'getErrors'
    }),
    ...mapGetters('navigationEntries', {
      default: 'default',
      global: 'global',
      navDefaultError: 'getDefaultErrors',
      navGlobalError: 'getGlobalErrors'
    }),
  },
  watch: {
    $route () {
      this.setFlag()
    }
  },
  created () {
    var that = this;
    window.onhashchange = function() {
      that.setFlag()
    }
    this.userInit(this.setFlag)
    this.navInit()
  },
  methods: {
    ...mapActions('user', {
      userInit: 'init'
    }),
    ...mapActions('navigationEntries', {
      navInit: 'init'
    }),
    setFlag() {
      if (this.isAuthenticated) {
        this.flag = "global"
      } else {
        this.flag = "default"
      }
    },
    entries() {
      let entries = this.default
      if (this.flag === "global") {
        entries = this.global
      }
      return entries.filter((e) => Object.prototype.hasOwnProperty.call(e,'hasAccess') && e.hasAccess)
    },
    errors() {
      return this.userError.concat(this.navError)
    }
  },
  mounted () {
    this.setFlag()
  }
}
</script>

<style scoped lang="less">
@import "../assets/general.less";
@import "../assets/responsive.less";
@import "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";

.navbar {
  min-height: 64px;
}

.navbar-vca {
  .colorProfilePrimary();
  border-radius: 0;
  border: 0;
  /*top: 0;*/
  text-transform: uppercase;
  font-weight: bold;
  padding: 0.5em 0;
  margin-bottom: 2em;

  .navbar-header {
    .navbar-brand {
      color: #colors[secundary];
    }

    .navbar-toggle {
      border-color: #colors[secundary];

      &:focus, &:hover {
        background-color: lighten(#colors[primary], 20%);
      }

      .icon-bar {
        background-color: #colors[secundary];
      }

    }
  }

  .navbar-collapse, .navbar-form {
    border: 0;

    .nav {
      @media @tablet-down {
        margin-top: 0px;
        margin-bottom: 0px;
        padding-top: 0.5em;
      }
    }
  }

  .navbar-brand {
    margin: 0 0.5em 0 0;
    padding: 0px;
    display: flex;
    flex-direction: row;

    @media @tablet-down {
      margin-left: 0.5em;
    }

    div {
      display: flex;
      flex-direction: column;
      justify-content: center;

      span.bold {
        font-size: 1.6em;
      }
    }

    img {
      margin-right: 0.5em;
      font-size: 0.6em;
    }
  }
}
</style>
