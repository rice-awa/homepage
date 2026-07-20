async page => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const behavior = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      overscrollX: style.overscrollBehaviorX,
      touchAction: style.touchAction,
    };
  });

  if (
    !behavior.touchAction.includes('pan-y') ||
    behavior.touchAction.includes('pan-x')
  ) {
    throw new Error(
      `root touch-action is ${behavior.touchAction}, expected vertical-only panning`,
    );
  }
  if (behavior.overscrollX !== 'none') {
    throw new Error(
      `root overscroll-behavior-x is ${behavior.overscrollX}, expected none`,
    );
  }

  return behavior;
}
