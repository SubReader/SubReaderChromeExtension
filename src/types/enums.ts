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
  INFO = "info",
  SUBTITLES = "subtitles",
  STATE = "state",
  PROMOTE = "promote",
  GET_STREAMS = "getStreams",
  GET_PAYMENT_URL = "getPaymentUrl",
}

// current order is used by sorting algorithm
export enum STATUS {
  RESOLVED = "RESOLVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED",
}
