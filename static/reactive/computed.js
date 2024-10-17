import { ref } from "./ref.js";

/**
 * @param {{ value: Proxy, watch(callback: function): void } | Array<{value: Proxy, watch(callback: function): void}>} dependencies
 * @param {function(): T} getter
 * @returns {{ value: T, watch(callback: function): void }}
 */
export function computed(dependencies, getter) {
  let computedRef = ref(getter());
  dependencies = Array.isArray(dependencies) ? dependencies : [dependencies];

  dependencies.forEach((dep) => {
    dep.watch(() => {
      computedRef.value = getter();
    });
  });

  return computedRef;
}
