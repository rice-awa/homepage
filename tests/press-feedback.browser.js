async page => {
  const selectors = {
    theme: '.theme-toggle',
    burger: '.nav-burger',
    work: '.work-link',
    activityYear: '.activity-years button',
  };

  const readState = locator => locator.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      opacity: Number(style.opacity),
      transform: style.transform,
      transitionDuration: style.transitionDuration,
      transitionProperty: style.transitionProperty,
    };
  });

  const parseTransform = transform => {
    const matrix = transform.match(/^matrix\(([^)]+)\)$/);
    if (matrix) {
      const values = matrix[1].split(',').map(Number);
      return { scaleX: values[0], scaleY: values[3] };
    }

    const matrix3d = transform.match(/^matrix3d\(([^)]+)\)$/);
    if (matrix3d) {
      const values = matrix3d[1].split(',').map(Number);
      return { scaleX: values[0], scaleY: values[5] };
    }

    return null;
  };

  const isIdentity = transform => {
    if (transform === 'none') return true;
    const scale = parseTransform(transform);
    return Boolean(scale
      && Math.abs(scale.scaleX - 1) < 0.005
      && Math.abs(scale.scaleY - 1) < 0.005);
  };

  const assertPressedScale = (name, transform) => {
    const scale = parseTransform(transform);
    if (!scale
      || Math.abs(scale.scaleX - 0.97) > 0.01
      || Math.abs(scale.scaleY - 0.97) > 0.01) {
      throw new Error(`${name} press transform was not scale(.97): ${transform}`);
    }
  };

  const installLinkGuard = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('.work-link').forEach(element => {
        element.addEventListener('click', event => event.preventDefault(), { capture: true });
      });
    });
  };

  const waitForPage = async () => {
    await page.locator('.theme-toggle').waitFor();
    await page.locator('.activity-years button').first().waitFor();
    const loader = page.locator('.loader');
    await loader.waitFor({ state: 'detached', timeout: 6000 });
    await installLinkGuard();
  };

  const pressControl = async (name, selector, reduced) => {
    const locator = page.locator(selector).first();
    await locator.waitFor();
    await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
    await page.waitForTimeout(80);

    const box = await locator.boundingBox();
    if (!box || box.x < 0 || box.y < 0 || box.x + box.width > await page.evaluate(() => innerWidth)
      || box.y + box.height > await page.evaluate(() => innerHeight)) {
      throw new Error(`${name} press target is not inside the viewport: ${JSON.stringify(box)}`);
    }

    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const before = await readState(locator);
    if (!before.transitionProperty.includes(reduced ? 'opacity' : 'transform')
      || !before.transitionDuration.includes('0.16s')) {
      throw new Error(`${name} transition is missing the expected press entry: ${JSON.stringify(before)}`);
    }

    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    let active;
    try {
      await page.waitForTimeout(220);
      active = await readState(locator);
    } finally {
      await page.mouse.up();
    }
    await page.waitForTimeout(220);
    const released = await readState(locator);

    if (reduced) {
      if (!isIdentity(active.transform) || active.opacity > 0.82) {
        throw new Error(`${name} reduced-motion press should use opacity without scale: ${JSON.stringify(active)}`);
      }
      if (!isIdentity(released.transform) || released.opacity < 0.98) {
        throw new Error(`${name} reduced-motion release did not restore identity: ${JSON.stringify(released)}`);
      }
    } else {
      assertPressedScale(name, active.transform);
      if (!isIdentity(released.transform)) {
        throw new Error(`${name} release retained a transform: ${JSON.stringify(released)}`);
      }
    }

    return { before, active, released };
  };

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1680, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForPage();

  const normal = {
    theme: await pressControl('theme toggle', selectors.theme, false),
    work: await pressControl('work link', selectors.work, false),
    activityYear: await pressControl('activity year', selectors.activityYear, false),
  };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForPage();
  const normalBurger = await pressControl('mobile nav burger', selectors.burger, false);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForPage();

  const reduced = {
    theme: await pressControl('reduced theme toggle', selectors.theme, true),
    work: await pressControl('reduced work link', selectors.work, true),
    activityYear: await pressControl('reduced activity year', selectors.activityYear, true),
    burger: await pressControl('reduced mobile nav burger', selectors.burger, true),
  };

  return { normal: { ...normal, burger: normalBurger }, reduced };
}
