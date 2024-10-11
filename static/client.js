import { computed } from "./reactive/computed.js";
import { ref } from "./reactive/ref.js";

// Extract the hydration data and nodes from the DOM
const rebootDataElement = document.getElementById("__REBOOT_DATA__");
const rebootNodesElement = document.getElementById("__REBOOT_NODES__");
const rebootData = JSON.parse(rebootDataElement.textContent);
const rebootNodes = JSON.parse(rebootNodesElement.textContent);

// TODO: rethink the stores solution
const stores = {};

Object.keys(rebootData).forEach((key) => {
  stores[key] = ref(rebootData[key]);
});

// TODO: think about the performance implications of this
function updateDom(nodeData, key) {
  if (!nodeData.dependencies.some((dependency) => dependency.name === key)) {
    return;
  }

  let template = nodeData.template.content.slice();

  nodeData.dependencies.forEach((dependency) => {
    const variableName = dependency.name;

    const index = dependency.index;

    if (stores[variableName]) {
      const currentValue = stores[variableName].value;

      template[index] = currentValue + (template[index] || "");
    }
  });

  nodeData.nodeElement.innerHTML = template.join("");
}

function updateNodes(key) {
  rebootNodes.forEach((nodeData) => {
    const nodeElement =
      nodeData.nodeElement || document.querySelector(`[${nodeData.node}]`);

    if (nodeElement) {
      nodeData.nodeElement = nodeElement;
      updateDom(nodeData, key);
    }
  });
}

Object.keys(stores).forEach((key) => {
  stores[key].watch(() => {
    console.log("updating", key);
    updateNodes(key);
  });
});

function generateHash() {
  // generate 8 character hashes
  return [...crypto.getRandomValues(new Uint8Array(4))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const hash = generateHash();
console.log(hash);

let expCount = computed(stores["count"], () =>
  Math.pow(stores["count"].value, 2)
);

expCount.watch((value) => {
  console.log(value);
});

// TODO: Figure out how to get these handlers from the server and how to parse them
function incrementCount() {
  stores["count"].value += 1;
}

function modifyElement() {
  let elm = document.getElementById("count");
  elm.textContent = "WOWIE";
}

function changeFirst() {
  stores["first"].value = "jane";
}

function changeLast() {
  stores["last"].value = "smith";
}

function addEventListeners() {
  // FIXME: register all event handlers, not just click
  const buttonElements = document.querySelectorAll("[r-on\\:click]");

  console.log(buttonElements);

  buttonElements.forEach((button) => {
    const eventHandlerName = button.getAttribute("r-on:click");
    // console.log(eventHandlerName, window["incrementCount"]);
    // if (eventHandlerName && typeof window[eventHandlerName] === "function") {
    // console.log(window[eventHandlerName]);
    button.addEventListener("click", () => {
      // FIXME: avoid eval, it's bad news
      eval(eventHandlerName);
    });
    // }
  });
}

addEventListeners();

// ----- Reactive test -----
// let countRef = ref(0);
// let countComputed = computed(countRef, () => Math.pow(2, countRef.value));

// let firstRef = ref("john");
// let lastRef = ref("doe");

// console.log({ countRef, firstRef, lastRef, countComputed });
// console.log(countComputed.value);

// countComputed.watch((value) => {
//   console.log("countComputed changed", value);
// });

// countRef.watch((value, oldValue) => {
//   console.log("count changed", value, oldValue);
// });

// firstRef.watch((value) => {
//   console.log("first changed", value);
// });

// lastRef.watch((value) => {
//   console.log("last changed", value);
// });

// setInterval(() => {
//   console.log("VALUE", countRef.value);
//   countRef.value += 1;
//   //   countNano.set(countNano.get() + 1);
// }, 1000);

// setTimeout(() => {
//   firstRef.value = "jane";
// }, 2000);

// setTimeout(() => {
//   lastRef.value = "smith";
// }, 3000);
