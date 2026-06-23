const createMilkyWay = (selector: string) => {
  const milkyWayContainer = document.querySelector(
    selector,
  ) as HTMLElement | null;

  const numberOfStars = 150;

  if (milkyWayContainer) {
    const containerWidth = milkyWayContainer.offsetWidth;
    const containerHeight = milkyWayContainer.offsetHeight;

    if (containerWidth > 0 && containerHeight > 0) {
      for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 1.5 + 0.5;
        const opacity = Math.random() * 0.7 + 0.3;

        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.backgroundColor = `rgba(64, 223, 132, ${opacity})`;
        star.style.borderRadius = '50%';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        milkyWayContainer.appendChild(star);
      }
    }
  }
};

export { createMilkyWay };
