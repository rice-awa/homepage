async page => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const state = await page.evaluate(() => ({
    isTouch: matchMedia('(hover: none), (pointer: coarse)').matches,
    lenisMounted: document.documentElement.classList.contains('lenis'),
  }));

  if (!state.isTouch) {
    throw new Error('browser session is not emulating a touch device');
  }
  if (state.lenisMounted) {
    throw new Error('Lenis is mounted on a touch device');
  }

  return state;
}
