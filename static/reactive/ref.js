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

  const proxy = new Proxy(
    { value: initialValue },
    {
      set(target, key, newValue) {
        if (key === "value" && newValue !== target.value) {
          const oldValue = target.value;
          target.value = newValue;
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
      proxy.value = newValue;
    },
    watch(callback) {
      listeners.push(callback);
    },
  };
}
