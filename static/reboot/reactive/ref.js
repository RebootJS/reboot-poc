/**
 *
 * @param {T} initialValue
 * @returns {{ value: T, watch(callback: function): void }}
 */
export function ref(initialValue) {
  const listeners = [];

  const notify = (newValue, oldValue) => {
    listeners.forEach((handler) => handler(newValue, oldValue));
  };

  // create nested proxies so that we can have objects that are reactive
  const createReactiveObject = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    return new Proxy(obj, {
      set(target, key, newValue) {
        if (target[key] !== newValue) {
          target[key] = createReactiveObject(newValue);
          notify(proxy.value, { ...proxy.value });
        }
        return true;
      },
      get(target, key) {
        return target[key];
      },
    });
  };

  const proxy = new Proxy(
    { value: createReactiveObject(initialValue) },
    {
      set(target, key, newValue) {
        if (key === "value" && newValue !== target.value) {
          const oldValue = target.value;
          target.value = createReactiveObject(newValue);
          notify(newValue, oldValue);
        }
        return true;
      },
      get(target, key) {
        return target[key];
      },
    }
  );

  return {
    get value() {
      return proxy.value;
    },
    set value(newValue) {
      proxy.value = createReactiveObject(newValue);
    },
    watch(callback) {
      listeners.push(callback);
    },
  };
}
