async page => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#activity').scrollIntoViewIfNeeded();
  await page.locator('#activity-calendar .activity-calendar').waitFor();

  const tabs = page.locator('#activity .activity-years [role="tab"]');
  const selectedTab = page.locator('#activity .activity-years [role="tab"][aria-selected="true"]');
  await selectedTab.waitFor();

  const selectedIndex = await selectedTab.evaluate((element) => (
    [...element.parentElement.querySelectorAll('[role="tab"]')].indexOf(element)
  ));
  const keyboardIndex = (selectedIndex + 1) % await tabs.count();

  await selectedTab.focus();
  await selectedTab.press('ArrowRight');
  await page.waitForFunction((index) => (
    document.querySelectorAll('#activity .activity-years [role="tab"]')[index]
      ?.getAttribute('aria-selected') === 'true'
  ), keyboardIndex);

  const keyboardMotion = await page.evaluate(() => {
    const properties = new Set(['opacity', 'transform']);
    return [...document.querySelectorAll('#activity-calendar *')].flatMap((element) => (
      element.getAnimations().flatMap((animation) => {
        const keyframes = animation.effect && 'getKeyframes' in animation.effect
          ? animation.effect.getKeyframes()
          : [];
        return keyframes.flatMap((frame) => (
          Object.keys(frame).filter((property) => properties.has(property))
        ));
      })
    ));
  });

  if (keyboardMotion.length > 0) {
    throw new Error(`keyboard year change animated ${keyboardMotion.join(', ')}`);
  }

  const pointerIndex = (keyboardIndex + 1) % await tabs.count();
  await tabs.nth(pointerIndex).click();
  await page.waitForFunction((index) => (
    document.querySelectorAll('#activity .activity-years [role="tab"]')[index]
      ?.getAttribute('aria-selected') === 'true'
  ), pointerIndex);

  const pointerTransition = await page.locator('#activity-calendar .activity-calendar-enter').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
    };
  });

  if (!pointerTransition.transitionProperty.includes('opacity')
    || !pointerTransition.transitionProperty.includes('transform')
    || !pointerTransition.transitionDuration.includes('0.18s')) {
    throw new Error(`pointer year change did not expose the 180ms opacity/transform transition: ${JSON.stringify(pointerTransition)}`);
  }

  return { keyboardMotion, pointerTransition };
}
