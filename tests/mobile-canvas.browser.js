async page => {
  await page.addInitScript(() => {
    for (const property of ['width', 'height']) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, property);
      if (!descriptor?.get || !descriptor.set) continue;

      Object.defineProperty(HTMLCanvasElement.prototype, property, {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
          const key = `__canvas_${property}_writes`;
          window[key] = (window[key] || 0) + 1;
          descriptor.set.call(this, value);
        },
      });
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#ribbons').waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    window.__canvas_width_writes = 0;
    window.__canvas_height_writes = 0;
  });
  await page.waitForTimeout(1_200);

  const writes = await page.evaluate(() => ({
    width: window.__canvas_width_writes || 0,
    height: window.__canvas_height_writes || 0,
  }));

  if (writes.width > 2 || writes.height > 2) {
    throw new Error(
      `stable canvas was resized repeatedly: width=${writes.width}, height=${writes.height}`,
    );
  }

  return writes;
}
