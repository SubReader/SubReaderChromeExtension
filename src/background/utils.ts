import { Observable } from "apollo-boost";
import { SERVICE } from "./types";


export function observableFromPromise<T>(promise: Promise<T>): Observable<T> {
  return new Observable<T>(observer => {
    promise
      .then((result: T): void => {
        observer.next(result);
      })
      .catch((error: Error): void => {
        observer.error(error);
      })
      .finally((): void => {
        observer.complete();
      });
  });
}

export function getDefaultTitleForService(service: SERVICE): string {
  switch (service) {
    case SERVICE.NETFLIX:
      return "Netflix";
    case SERVICE.VIAPLAY:
      return "Viaplay";
    case SERVICE.HBONORDIC:
      return "HBO Nordic";
    case SERVICE.FILMCENTRALEN:
      return "Filmcentralen";
    case SERVICE.MITCFU:
      return "Mit CFU";
    default:
      return service;
  }
}
