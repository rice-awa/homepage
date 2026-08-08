async page => {
  await page.route('**/api/github-contributions**', async route => {
    await page.waitForTimeout(1500);
    await route.abort();
  });

  const inspectSkeleton = () => page.evaluate(() => {
    const skeleton = document.querySelector('.activity-skeleton');
    if (!skeleton) throw new Error('activity skeleton is missing');

    const animations = document.getAnimations({ subtree: true }).filter((animation) => {
      const target = animation.effect?.target;
      return target instanceof Element && skeleton.contains(target);
    });

    return {
      cellCount: skeleton.querySelectorAll('i').length,
      animationCount: animations.length,
      animationTargets: animations.map((animation) => {
        const target = animation.effect?.target;
        return target instanceof Element ? target.className : null;
      }),
      style: {
        animationDirection: getComputedStyle(skeleton).animationDirection,
        animationDuration: getComputedStyle(skeleton).animationDuration,
        animationIterationCount: getComputedStyle(skeleton).animationIterationCount,
        animationName: getComputedStyle(skeleton).animationName,
        animationTimingFunction: getComputedStyle(skeleton).animationTimingFunction,
      },
    };
  });

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#activity').scrollIntoViewIfNeeded();
  await page.locator('.activity-skeleton').waitFor();

  const animated = await inspectSkeleton();
  if (animated.cellCount !== 371) {
    throw new Error(`skeleton cell count changed: expected 371, found ${animated.cellCount}`);
  }
  if (animated.animationCount !== 1 || animated.animationTargets[0] !== 'activity-skeleton') {
    throw new Error(`expected one animation on the skeleton surface: ${JSON.stringify(animated)}`);
  }
  if (animated.style.animationName !== 'activity-pulse'
    || animated.style.animationDuration !== '1.4s'
    || animated.style.animationIterationCount !== 'infinite'
    || animated.style.animationDirection !== 'alternate') {
    throw new Error(`skeleton animation does not match the single activity pulse: ${JSON.stringify(animated.style)}`);
  }

  await page.locator('.loader').waitFor({ state: 'detached', timeout: 6000 });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#activity').scrollIntoViewIfNeeded();
  await page.locator('.activity-skeleton').waitFor();

  const reduced = await inspectSkeleton();
  if (reduced.cellCount !== 371 || reduced.animationCount !== 0) {
    throw new Error(`reduced motion should keep 371 cells with no skeleton animation: ${JSON.stringify(reduced)}`);
  }

  await page.locator('.loader').waitFor({ state: 'detached', timeout: 6000 });

  return { animated, reduced };
}
