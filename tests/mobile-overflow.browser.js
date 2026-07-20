async page => {
  const widths = [360, 390, 412];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.about').waitFor();

    const metrics = await page.evaluate(() => {
      const ring = document.querySelector('.avatar-ring');
      const originalAnimation = ring.style.animation;
      const originalTransform = ring.style.transform;
      ring.style.animation = 'none';

      const ringBounds = [0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
        ring.style.transform = `rotate(${angle}deg)`;
        const rect = ring.getBoundingClientRect();
        return { angle, left: rect.left, right: rect.right };
      });

      ring.style.animation = originalAnimation;
      ring.style.transform = originalTransform;

      return {
        body: document.body.scrollWidth,
        html: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        ringBounds,
      };
    });

    if (metrics.body > metrics.viewport || metrics.html > metrics.viewport) {
      throw new Error(
        `${width}px viewport overflows: body=${metrics.body}, html=${metrics.html}, viewport=${metrics.viewport}`,
      );
    }
    const clippedRing = metrics.ringBounds.find(
      ring => ring.left < 0 || ring.right > metrics.viewport,
    );
    if (clippedRing) {
      throw new Error(
        `${width}px avatar ring is clipped at ${clippedRing.angle}deg: left=${clippedRing.left}, right=${clippedRing.right}`,
      );
    }
  }

  return 'mobile root width stays within the viewport';
}
