import Circuit from "./circuit";

export function currentEntry() {
   const hash = window.location.hash.substring(1) || 'default';
   return hash;
}

export function save(name: string, circuit: Circuit) {
   const json = JSON.stringify(circuit);
   window.localStorage.setItem(name, json);
}

export function load(name: string = null): Circuit {
   name ??= currentEntry();
   const json = window.localStorage.getItem(name);
   if(!json) return null;
   
   const data = JSON.parse(json);
   return Circuit.from(data);
}

export function contains(name: string): boolean {
   return window.localStorage.getItem(name) != null;
}