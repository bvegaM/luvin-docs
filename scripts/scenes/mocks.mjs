// Escenas de "Mock servers" en la app web: capturas mocks-*.png, en los dos idiomas. Los mocks se
// encienden solo en la app de escritorio (ver scripts/capture-desktop.mjs); aquí se ve el aviso que
// muestra la app web.
export default (ctx) => {
  const { shot, openShop, freshPage } = ctx

  return {
    async 'mocks-web-desktop-only'() {
      const page = await freshPage()
      await openShop(page)
      // Un mock nuevo desde la sección "Mock servers" de la barra lateral, con las respuestas del contrato.
      const section = page.locator('.tree-section').filter({ has: page.locator('.tree-mocks') })
      await section.locator('.tree-head .icon-btn').click()
      const dialog = page.locator('.rq-dialog').filter({ has: page.locator('.mock-new') })
      await dialog.waitFor()
      await dialog.locator('.mock-new-source').nth(1).click()
      await dialog.locator('button[type="submit"]').click()
      await page.locator('.mock .mock-note').waitFor()
      await page.mouse.move(5, 5)
      await shot(page, 'mocks-web-desktop-only')
      await page.context().close()
    },
  }
}
