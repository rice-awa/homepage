async page => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.cursor-ring').waitFor();
  await page.locator('.nav').waitFor();
  await page.locator('.work-cover-link').first().waitFor();
  await page.locator('.loader').waitFor({ state: 'detached', timeout: 5000 });

  const inspectCursor = () => page.evaluate(() => {
    const ring = document.querySelector('.cursor-ring');
    const visual = document.querySelector('.cursor-ring-visual');
    if (!ring || !visual) throw new Error('cursor tracker or visual is missing');

    const ringStyle = getComputedStyle(ring);
    const visualStyle = getComputedStyle(visual);
    return {
      classes: ring.className,
      width: ringStyle.width,
      height: ringStyle.height,
      visualTransform: visualStyle.transform,
    };
  });

  await page.mouse.move(20, 500);
  await page.waitForTimeout(220);
  const normal = await inspectCursor();
  if (normal.classes !== 'cursor-ring') {
    throw new Error(`normal cursor state was not active: ${JSON.stringify(normal)}`);
  }

  await page.locator('.nav-links a').first().hover();
  await page.waitForTimeout(220);
  const link = await inspectCursor();
  if (!link.classes.includes('is-link') || link.classes.includes('is-view')) {
    throw new Error(`link cursor state was not active: ${JSON.stringify(link)}`);
  }

  await page.locator('.work-cover-link').first().hover();
  await page.waitForTimeout(220);
  const view = await inspectCursor();
  if (!view.classes.includes('is-view') || view.classes.includes('is-link')) {
    throw new Error(`view cursor state was not active: ${JSON.stringify(view)}`);
  }

  for (const [stateName, state] of Object.entries({ normal, link, view })) {
    if (state.width !== '84px' || state.height !== '84px') {
      throw new Error(`${stateName} cursor tracker geometry changed: ${JSON.stringify(state)}`);
    }
  }
  if (normal.visualTransform === link.visualTransform
    || link.visualTransform === view.visualTransform
    || normal.visualTransform === view.visualTransform) {
    throw new Error(`cursor visual transform did not change across states: ${JSON.stringify({ normal, link, view })}`);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => {
    const nav = document.querySelector('.nav');
    return window.scrollY <= 1
      && nav
      && !nav.classList.contains('is-scrolled')
      && getComputedStyle(nav, '::before').opacity === '0';
  });
  const navBefore = await page.locator('.nav').evaluate((element) => {
    const style = getComputedStyle(element);
    const pseudo = getComputedStyle(element, '::before');
    return {
      padding: style.padding,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      backdropFilter: style.backdropFilter,
      webkitBackdropFilter: style.webkitBackdropFilter,
      pseudoOpacity: pseudo.opacity,
      scrolled: element.classList.contains('is-scrolled'),
    };
  });

  await page.evaluate(() => window.scrollTo(0, 80));
  await page.waitForFunction(() => {
    const nav = document.querySelector('.nav');
    return nav?.classList.contains('is-scrolled')
      && getComputedStyle(nav, '::before').opacity === '1';
  });
  const navAfter = await page.locator('.nav').evaluate((element) => {
    const style = getComputedStyle(element);
    const pseudo = getComputedStyle(element, '::before');
    return {
      padding: style.padding,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      backdropFilter: style.backdropFilter,
      webkitBackdropFilter: style.webkitBackdropFilter,
      pseudoOpacity: pseudo.opacity,
      scrolled: element.classList.contains('is-scrolled'),
    };
  });

  for (const property of ['padding', 'paddingTop', 'paddingBottom', 'backdropFilter', 'webkitBackdropFilter']) {
    if (navBefore[property] !== navAfter[property]) {
      throw new Error(`nav ${property} changed across scroll threshold: ${JSON.stringify({ navBefore, navAfter })}`);
    }
  }
  if (navBefore.pseudoOpacity === navAfter.pseudoOpacity
    || navBefore.pseudoOpacity !== '0'
    || navAfter.pseudoOpacity !== '1'
    || navBefore.scrolled
    || !navAfter.scrolled) {
    throw new Error(`nav glass state did not change by opacity only: ${JSON.stringify({ navBefore, navAfter })}`);
  }

  return { cursor: { normal, link, view }, nav: { before: navBefore, after: navAfter } };
}
