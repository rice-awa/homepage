async page => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const media = await page.evaluate(() => ({
    isTouch: matchMedia('(hover: none), (pointer: coarse)').matches,
    hasFinePointer: matchMedia('(hover: hover) and (pointer: fine)').matches,
  }));

  if (media.isTouch) {
    const workCover = page.locator('.work-cover-link').first();
    const contactLink = page.locator('.c-link').first();
    const activityDay = page.locator('.activity-day').first();
    const themeToggle = page.locator('.theme-toggle');

    await workCover.waitFor();
    await contactLink.waitFor();
    await activityDay.waitFor({ timeout: 10000 });
    await themeToggle.waitFor();

    const readDesktopStates = () => page.evaluate(() => {
      const workImage = document.querySelector('.work-cover img');
      const workLink = document.querySelector('.work-link svg');
      const contact = document.querySelector('.c-link');
      const contactArrow = document.querySelector('.c-link .cl-arrow');
      const theme = document.querySelector('.theme-toggle');
      const activity = document.querySelector('.activity-day');
      if (!workImage || !workLink || !contact || !contactArrow || !theme || !activity) {
        throw new Error('touch hover probe targets are incomplete');
      }

      const themeStyle = getComputedStyle(theme);
      return {
        workFilter: getComputedStyle(workImage).filter,
        workLinkTransform: getComputedStyle(workLink).transform,
        contactFillTransform: getComputedStyle(contact, '::before').transform,
        contactArrowTransform: getComputedStyle(contactArrow).transform,
        themeBorder: themeStyle.borderTopColor,
        themeColor: themeStyle.color,
        themeTransform: themeStyle.transform,
        themeFilter: themeStyle.filter,
        activityTransform: getComputedStyle(activity).transform,
      };
    });

    const baseline = await readDesktopStates();
    await workCover.tap();
    await page.waitForTimeout(120);
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    const afterWorkTap = await readDesktopStates();

    await contactLink.tap();
    await page.waitForTimeout(120);
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    const afterContactTap = await readDesktopStates();

    await activityDay.tap();
    await page.waitForTimeout(120);
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    const afterActivityTap = await readDesktopStates();

    await themeToggle.tap();
    await page.waitForTimeout(120);
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    const afterThemeTap = await readDesktopStates();

    const touchStates = { afterWorkTap, afterContactTap, afterActivityTap, afterThemeTap };
    for (const [name, state] of Object.entries(touchStates)) {
      if (state.workFilter !== baseline.workFilter
        || state.workLinkTransform !== baseline.workLinkTransform
        || state.contactFillTransform !== baseline.contactFillTransform
        || state.contactArrowTransform !== baseline.contactArrowTransform
        || state.activityTransform !== baseline.activityTransform) {
        throw new Error(`touch tap retained a desktop hover state after ${name}: ${JSON.stringify({ baseline, state })}`);
      }
    }
    if (afterThemeTap.themeBorder === afterThemeTap.themeColor
      || afterThemeTap.themeTransform !== baseline.themeTransform
      || afterThemeTap.themeFilter !== baseline.themeFilter) {
      throw new Error(`theme toggle retained a desktop hover state after touch: ${JSON.stringify({ baseline, afterThemeTap })}`);
    }

    return { mode: 'touch', media, baseline, touchStates };
  }

  if (!media.hasFinePointer) {
    throw new Error(`unsupported pointer mode for hover probe: ${JSON.stringify(media)}`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const workCover = page.locator('.work-cover-link').first();
  const contactLink = page.locator('.c-link').first();
  await workCover.waitFor();
  await contactLink.waitFor();

  await workCover.hover();
  await page.waitForTimeout(120);
  const workHover = await page.locator('.work-cover img').first().evaluate((element) => ({
    filter: getComputedStyle(element).filter,
  }));
  if (!workHover.filter.includes('saturate')) {
    throw new Error(`fine-pointer work-cover hover did not activate: ${JSON.stringify(workHover)}`);
  }

  await contactLink.scrollIntoViewIfNeeded();
  await contactLink.hover();
  await page.waitForTimeout(120);
  const contactHover = await contactLink.evaluate((element) => ({
    fillTransform: getComputedStyle(element, '::before').transform,
    arrowTransform: getComputedStyle(element.querySelector('.cl-arrow')).transform,
  }));
  if (contactHover.fillTransform === 'none' || contactHover.arrowTransform === 'none') {
    throw new Error(`fine-pointer Contact hover did not activate: ${JSON.stringify(contactHover)}`);
  }

  return { mode: 'fine-pointer', media, workHover, contactHover };
}
