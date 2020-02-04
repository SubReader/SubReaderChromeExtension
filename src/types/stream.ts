export interface IStream {
  id: string;
  setState: (data: any) => void;
  setSubtitles: (data: any) => void;
  setInfo: (data: any) => void;
  socket: any;
}

export interface IStreamEntry {
  id: string;
  status: string;
  supportedServices: Array<string>;
  stream: IStream | null;
  error: Error | null;
}
