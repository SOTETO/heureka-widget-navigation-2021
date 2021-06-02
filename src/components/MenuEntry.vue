<template>
  <li :class="getClasses()" ref="menuEntry" @mouseleave="closeFoldedOnLeave" :style="getStyle()">
    <a v-bind:href="getURL()" @click="handleClick">{{ getLabel() }}</a>
    <ul class="nav-sub" ref="subMenu">
      <MenuEntry v-for="sub in getSubs()" :key="sub.id" :entry="sub" type="menu-entry" :layer="layer + 1" v-on:vca-close-sub="closeFolded" />
    </ul>
  </li>
</template>

<script>
export default {
  name: "MenuEntry",
  props: {
    'entry': {
      'type': Object,
      'required': true
    },
    'type': {
      'type': String,
      'required': true
    },
    'layer': {
      'type': Number,
      'required': false
    }
  },
  methods: {
    getStyle: function() {
      if (Object.prototype.hasOwnProperty.call(this.entry,'style')) {
        return this.entry.style
      } else {
        return ""
      }
    },
    getURL: function () {
      return !this.hasSubMenu() ? this.entry.url : '#'
    },
    getLabel: function () {
      if (navigator.language === 'de-DE') {
        return this.entry.label.de_DE
      } else {
        return this.entry.label.en_EN
      }
    },
    getSubMenuClass: function () {
      return this.hasSubMenu() ? 'hasSub' : ''
    },
    getTypeClass: function () {
      return this.type === 'button' ?  'vca-button-primary' : 'menu-entry'
    },
    getLayerClass: function () {
      return this.layer === 1 ? 'first-layer' : (this.layer === 2 ? 'second-layer' : '')
    },
    getClasses: function () {
      return [this.getSubMenuClass(), this.getTypeClass(), this.getLayerClass()].filter((className) => className !== '').join(" ")
    },
    getSubs: function () {
      var res = []
      if(Object.prototype.hasOwnProperty.call(this.entry,"entrys")) {
        res = this.entry.entrys.filter((e) => Object.prototype.hasOwnProperty.call(e,'hasAccess') && e.hasAccess)
      }
      return res
    },
    hasSubMenu: function () {
      return Object.prototype.hasOwnProperty.call(this.entry,'entrys') && this.entry.entrys.length > 0
    },
    foldOut: function (event) {
      event.preventDefault()
      if(event.target.parentElement.classList.contains('folded')) {
        event.target.parentElement.classList.remove('folded')
      } else {
        event.target.parentElement.classList.add('folded')
      }
    },
    clickLink: function (event) {
      var target = event.target || event.srcElement
      target.click()
    },
    handleClick: function (event) {
      if(this.hasSubMenu()) {
        this.foldOut(event)
      } else {
        this.clickLink(event)
        this.closeFolded()
      }
    },
    closeFolded: function() {
      this.$refs.menuEntry.classList.remove('folded')
      if (this.layer > 0) {
        this.$emit('vca-close-sub')
      }
    },
    closeFoldedOnLeave: function() {
      if(this.layer === 0) {
        this.$refs.menuEntry.classList.remove('folded')
      }
    }
  }
}
</script>

<style scoped lang="less">
@import "../assets/general.less";
@import "../assets/responsive.less";

a {
  color: #colors[secundary] ! important;
}

.vca-button-primary {
  margin-right: 0.5em;
  @media @tablet-down {
    margin-right: 0;
    padding-bottom: 0;
  }

  /**
   * Override default bootstrap style
   */
  & > a {
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }
  &.hasSub:hover, &.hasSub.folded {
    background-color: lighten(#colors[primary], 10%);
  }
}

.menu-entry {

  & > a {
    padding: 0.5em 1em;
    display: block;
    text-decoration: none;
    color: #colors[secundary];
  }

  &.first-layer {
    background-color: lighten(#colors[primary], 20%);
    &:hover {
      background-color: #colors[thirdlyHover];
    }
    &.hasSub:hover, &.hasSub.folded {
      background-color: lighten(#colors[thirdlyHover], 10%);
    }
  }

  &.second-layer {
    background-color: #colors[thirdlyHover];
    &:hover {
      background-color: #colors[thirdlyNoAlpha];
    }
    &.hasSub:hover, &.hasSub.folded {
      background-color: lighten(#colors[thirdlyNoAlpha], 10%);
    }
  }
}

@media @tablet-down {
  li {
    box-shadow: none;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    margin-right: 0;
  }
}

.vca-button-primary > .nav-sub {
  position: absolute;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 10;

  @media @tablet-down {
    position: static;
    box-shadow: none;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    z-index: auto;
  }
}
.nav-sub {
  /*visibility: hidden;*/
  /*opacity: 0;*/
  /*max-height: 0;*/
  /*transition: visibility 0.3s, opacity 0.3s linear, max-height 0.3s ease-out;*/
  /*overflow: hidden;*/
  display: none;
  background-color: lighten(#colors[primary], 20%);
  min-width: 160px;
  list-style: none;
  padding: 0;
}
.hasSub.folded > .nav-sub { /* .hasSub:hover > .nav-sub,*/
  /*max-height: 2000px;*/
  /*transition: max-height 0.3s ease-in;*/
  /*visibility: visible;*/
  /*opacity: 1;*/
  display: block;
}
</style>
