export enum SERVICE {
  NETFLIX = "netflix",
  VIAPLAY = "viaplay",
  HBONORDIC = "hbonordic",
  FILMCENTRALEN = "filmcentralen",
  MITCFU = "mitcfu",
  URPLAY = "urplay",
  DRTV = "drtv",
}

export enum ACTION {
  INFO = "INFO",
  SUBTITLES = "SUBTITLES",
  STATE = "STATE",
  PROMOTE = "PROMOTE",
  GET_STREAMS = "GET_STREAMS",
}

// current order is used by sorting algorithm
export enum STATUS {
  RESOLVED = "RESOLVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED",
}
