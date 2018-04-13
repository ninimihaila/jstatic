const configFile = "config.txt";
const fileListFile = "files.txt";
let config = {};
let fileList = [];
let currentFile = "";
let rootId = "";

let sections = {};

function flatten(json) {
  function _flatten(json, flattened, str_key) {
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        if (json[key] instanceof Object && json[key] != "") {
          _flatten(
            json[key],
            flattened,
            str_key + (str_key ? "/" : "")  + key);
        } else {
          flattened.push(str_key + "/" + json[key]);
        }
      }
    }
  }
  let flat = [];
  _flatten(json, flat, "");
  return flat;
}

function tryParseInt(int) {
  const res = parseInt(int);
  return isNaN(res) ? 0 : res;
}

function setText(id, content) {
  document.getElementById(id).textContent = content;
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

// function getPageFromUrl() {
//     var urlPage = location.hash;
//     return tryParseInt(urlPage.split('#')[1]);
// }

/**
 Assumes the document contains a title separated by a blank line
  from the rest of the body
*/
function titleAndBody(text) {
  let lines = text.split('\n');

  setText("title", lines[0]);

  const body = document.querySelector("#body");
  while (body.hasChildNodes()) {
    body.removeChild(body.lastChild);
  }

  lines.slice(2).forEach(line => {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    body.appendChild(paragraph);
  });
}

function parseSections(lines, parseFn) {
  titleAndBody(lines);
}


function loadFile(file, callback, parseFn=titleAndBody) {
  console.log(`trying to load ${file}`)  // TODO: delete this
  fetch(file)
  .then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  })
  .then(response => response.text())
  .then(text => {
    if (callback) {
      callback(file);
    }
    parseSections(text, parseFn);
    scrollToTop();
  })
  .catch(function(err){
    console.log(err);
  });
}

function nextFile() {
  return fileList[
    fileList.indexOf(currentFile) + 1
  ];
}

function prevFile() {
  return fileList[
    fileList.indexOf(currentFile) - 1
  ];
}

function onFileLoaded(file) {
  currentFile = file;
}

function loadNext(getNext=nextFile, callback=onFileLoaded) {
  const next = getNext();
  if (next) {
    loadFile(next, callback);
  }
}

function loadPrev(getPrev=prevFile, callback=onFileLoaded) {
  const prev = getPrev();
  if (prev) {
    loadFile(prev, callback);
  }
}

// Bootstrap section
function getIdsTree(element) {
  let ids = [];
  if (!!element.id) {
    ids.push(element.id)
  }
  for (let i in element.children) {
    const childIds = getIdsTree(element.children[i]);
    ids.push(...childIds);
  }
  return ids
}

/// Given a list of html elements, get the id of the elements and all their children
function getIds(elements) {
  let ids = [];
  for (let i in elements) {
    const elIds = getIdsTree(elements[i]);
    ids.push(...elIds);
  }
  return ids;
}

function loadConfig() {
  return new Promise(function(resolve, reject){
    fetch(configFile)
    .then(response => response.json())
    .then(res => {
        config = res;
        resolve({config: config});
    });
  })
}

function loadFileList() {
  return new Promise(function(resolve, reject){
    fetch(fileListFile)
    .then(response => response.json())
    .then(res => {
        fileList = flatten(res);
        resolve({files: fileList});
    });
  })
}

function loadFirstFile() {
  return new Promise(function(resolve, reject){
    loadNext(nextFile);
    resolve();
  })
}

function bootstrap() {
  loadConfig()
  .then(loadFileList)
  .then(loadFirstFile);
}

bootstrap();
