async page => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.nav-burger').waitFor();

  const isTouch = await page.evaluate(
    () => matchMedia('(hover: none), (pointer: coarse)').matches,
  );
  if (!isTouch) {
    throw new Error('browser session is not emulating a touch device');
  }

  const burger = page.locator('.nav-burger');
  const results = [];

  for (let cycle = 0; cycle < 3; cycle += 1) {
    await burger.click();
    await page.waitForFunction(() => (
      document.body.style.overflow === 'hidden'
      && document.querySelector('.nav-burger')?.getAttribute('aria-expanded') === 'true'
    ));
    await page.waitForTimeout(90);
    await burger.click();

    await page.waitForFunction(() => {
      const drawer = document.querySelector('.nav-drawer');
      const burgerButton = document.querySelector('.nav-burger');
      if (!drawer || !burgerButton) return false;

      const drawerStyle = getComputedStyle(drawer);
      return drawerStyle.visibility === 'hidden'
        && drawerStyle.pointerEvents === 'none'
        && document.body.style.overflow === ''
        && burgerButton.getAttribute('aria-expanded') === 'false';
    }, { timeout: 700 });

    results.push(await page.evaluate(() => {
      const drawer = document.querySelector('.nav-drawer');
      return {
        ariaExpanded: document.querySelector('.nav-burger')?.getAttribute('aria-expanded'),
        bodyOverflow: document.body.style.overflow,
        drawerVisibility: drawer ? getComputedStyle(drawer).visibility : null,
      };
    }));
  }

  return results;
}
