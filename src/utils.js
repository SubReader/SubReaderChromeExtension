import { Observable } from "apollo-boost";
export function observableFromPromise(promise) {
  return new Observable(observer => {
    promise
      .then(result => {
        observer.next(result);
      })
      .catch(error => {
        observer.error(error);
      })
      .finally(() => {
        observer.complete();
      });
  });
}

export function getDefaultTitleForService(service) {
  switch (service) {
    case "netflix":
      return "Netflix";
    case "viaplay":
      return "Viaplay";
    case "hbonordic":
      return "HBO Nordic";
    case "filmcentralen":
      return "Filmcentralen";
    case "mitcfu":
      return "Mit CFU";
    default:
      return service;
  }
}
