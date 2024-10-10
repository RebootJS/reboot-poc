// TODO: replace this since it's not really designed to be a client library seemingly since it
// TODO: depends on node.js (it uses process.env.NODE_ENV)
import { atom } from "./nanostores/index.js";

// Extract the hydration data and nodes from the DOM
const rebootDataElement = document.getElementById("__REBOOT_DATA__");
const rebootNodesElement = document.getElementById("__REBOOT_NODES__");
const rebootData = JSON.parse(rebootDataElement.textContent);
const rebootNodes = JSON.parse(rebootNodesElement.textContent);

const stores = {};

Object.keys(rebootData).forEach((key) => {
  stores[key] = atom(rebootData[key]);
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
      const currentValue = stores[variableName].get();

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
  stores[key].subscribe(() => {
    console.log("updating", key);
    // FIXME: shouldnt be called on first load
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

// TODO: Figure out how to get these handlers from the server and how to parse them
function incrementCount() {
  const currentCount = stores["count"].get();
  stores["count"].set(currentCount + 1);
}

function modifyElement() {
  let elm = document.getElementById("count");
  elm.textContent = "WOWIE";
}

function changeFirst() {
  stores["first"].set("jane");
}

function changeLast() {
  stores["last"].set("smith");
}

// FIXME: this is a hack to get the event handlers to work, it only works for click, and it uses eval
function addEventListeners() {
  const buttonElements = document.querySelectorAll("[r-on\\:click]");

  console.log(buttonElements);

  buttonElements.forEach((button) => {
    const eventHandlerName = button.getAttribute("r-on:click");
    // console.log(eventHandlerName, window["incrementCount"]);
    // if (eventHandlerName && typeof window[eventHandlerName] === "function") {
    // console.log(window[eventHandlerName]);
    button.addEventListener("click", () => {
      eval(eventHandlerName);
    });
    // }
  });
}

addEventListeners();
