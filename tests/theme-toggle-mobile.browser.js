async page => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.theme-toggle').waitFor();

  const isTouch = await page.evaluate(
    () => matchMedia('(hover: none), (pointer: coarse)').matches,
  );
  if (!isTouch) {
    throw new Error('browser session is not emulating a touch device');
  }

  const initialTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.evaluate(() => {
    window.__theme_view_transition_calls = 0;
    document.startViewTransition = callback => {
      window.__theme_view_transition_calls += 1;
      callback();
      return { finished: Promise.resolve() };
    };
  });

  await page.locator('.theme-toggle').click();
  await page.waitForFunction(
    theme => document.documentElement.dataset.theme !== theme,
    initialTheme,
  );

  const state = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    viewTransitionCalls: window.__theme_view_transition_calls,
    themeTransitioning: document.documentElement.classList.contains('theme-transitioning'),
  }));

  if (state.viewTransitionCalls !== 0) {
    throw new Error(`touch theme toggle called startViewTransition ${state.viewTransitionCalls} times`);
  }
  if (state.themeTransitioning) {
    throw new Error('touch theme toggle retained the theme-transitioning class');
  }

  return state;
}
