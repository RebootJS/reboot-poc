const cookiePool = {};

/**
 * @param {string} cookieName
 * @param {object} options
 * @param {number} options.maxAge
 * @param {Date} options.expires
 * @param {boolean} options.httpOnly
 * @param {boolean} options.secure
 * @param {boolean} options.partitioned
 * @param {string} options.domain
 * @param {string} options.path
 * @param {boolean | string} options.sameSite
 * @returns {{ value: string, watch(callback: function): void }}
 */
export function useCookie(cookieName, options) {
  if (cookiePool[cookieName]) {
    return cookiePool[cookieName];
  }

  let cookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${cookieName}=`));

  const listeners = [];

  const notify = (newValue, oldValue) => {
    listeners.forEach((handler) => handler(newValue, oldValue));
  };

  const proxy = new Proxy(
    { value: cookie },
    {
      set(target, key, newValue) {
        if (key === "value" && newValue !== target.value) {
          document.cookie = generateCookieString(cookieName, newValue, options);

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

  cookiePool[cookieName] = proxy;

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

function generateCookieString(cookieName, cookieValue, options = {}) {
  let cookieString = `${cookieName}=${cookieValue}`;

  if (options.maxAge) {
    cookieString += `;max-age=${options.maxAge}`;
  }

  if (options.expires) {
    cookieString += `;expires=${options.expires.toUTCString()}`;
  }

  if (options.httpOnly) {
    cookieString += ";HttpOnly";
  }

  if (options.secure) {
    cookieString += ";Secure";
  }

  if (options.partitioned) {
    cookieString += ";Partitioned";
  }

  if (options.domain) {
    cookieString += `;domain=${options.domain}`;
  }

  if (options.path) {
    cookieString += `;path=${options.path}`;
  }

  if (options.sameSite) {
    if (typeof options.sameSite === "boolean") {
      cookieString += options.sameSite ? ";samesite=strict" : ";samesite=lax";
    } else if (typeof options.sameSite === "string") {
      cookieString += `;samesite=${options.sameSite}`;
    }
  } else {
    cookieString += ";samesite=lax";
  }

  return cookieString;
}
