<template>
  <div class="footer-container vca-shadow-inverted">
    <div class="footer-row">
      <p class="footer-center">
        <!-- <a :title="$vcaI18n.t('nav.labels.footer.termsOfUse.description')" href="/pool/nutzungsbedingungen/"> -->
        <!-- {{ $vcaI18n.t('nav.labels.footer.termsOfUse.label') }} -->
        <!-- </a> -->
        <!-- <span class="footer-link">&nbsp;|&nbsp;</span> -->
        <a :title="$vcaI18n.t('nav.labels.footer.privacyStatement.description')" href="https://www.hu-berlin.de/de/hu/impressum/datenschutzerklaerung">
          {{ $vcaI18n.t('nav.labels.footer.privacyStatement.label') }}
        </a>
        <span class="footer-link">&nbsp;|&nbsp;</span>
        <a :title="$vcaI18n.t('nav.labels.footer.imprint.description')" href="https://www.hu-berlin.de/de/hu/impressum">
          {{ $vcaI18n.t('nav.labels.footer.imprint.label') }}
        </a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomNavigation'
}
</script>

<style scoped lang="less">
@import "../assets/general.less";

.footer-container {
  .colorProfilePrimary();
  width: 100%;
  margin-top: 2em;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: center;
  padding: 1em 0;

  a {
    color: #colors[secundary]
  }

  .footer-center {
    text-align: center;
  }
}
</style>
