const $r = (hash) => document.querySelector(`[data-r-${hash}]`);

/**
 * @param {object} data
 * @param {object} data.template
 * @param {object} data.events
 */
export function hydratePage(data) {
  console.log("hydrating page", data);

  for (const [key, value] of Object.entries(data.template)) {
    const nodeElement = $r(key);
    if (!nodeElement) {
      console.error(`Could not find node with data-r-${key}`);
      continue;
    }

    value.dependencies.forEach((dependency) => {
      dependency.watch((newValue, oldValue) => {
        if (value.unsafe) {
          nodeElement.innerHTML = value.template(newValue, oldValue);
          return;
        }

        nodeElement.innerText = value.template(newValue, oldValue);
      });
    });
  }

  for (const [key, value] of Object.entries(data.events)) {
    const nodeElement = $r(key);
    if (!nodeElement) {
      console.error(`Could not find node with data-r-${key}`);
      continue;
    }

    for (const [eventName, eventHandler] of Object.entries(value)) {
      nodeElement.addEventListener(eventName, () => {
        eventHandler();
      });
    }
  }
}
