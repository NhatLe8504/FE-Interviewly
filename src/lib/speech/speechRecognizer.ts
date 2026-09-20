export interface SpeechRecognizerCallbacks {
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class BrowserSpeechRecognizer {
  private recognition: any = null;
  private isListening = false;
  private accumulatedFinal = "";
  private currentInterim = "";
  private callbacks: SpeechRecognizerCallbacks;
  public provider: "webkitSpeechRecognition" | "SpeechRecognition" | "none" = "none";

  constructor(callbacks: SpeechRecognizerCallbacks = {}, language = "vi-VN") {
    this.callbacks = callbacks;
    if (typeof window === "undefined") return;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      this.provider = (window as any).SpeechRecognition
        ? "SpeechRecognition"
        : "webkitSpeechRecognition";
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = language;
        this.setupHandlers();
      } catch (err) {
        console.warn("SpeechRecognition initialization failed:", err);
        this.recognition = null;
        this.provider = "none";
      }
    } else {
      this.provider = "none";
    }
  }

  private setupHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const transcriptChunk = item[0]?.transcript || "";
        if (item.isFinal) {
          this.accumulatedFinal += (this.accumulatedFinal ? " " : "") + transcriptChunk.trim();
          this.callbacks.onFinalTranscript?.(this.accumulatedFinal);
        } else {
          interim += transcriptChunk;
        }
      }
      this.currentInterim = interim;
      this.callbacks.onInterimTranscript?.(interim);
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      this.callbacks.onError?.(event.error || "speech_recognition_error");
    };

    this.recognition.onend = () => {
      // If still supposed to be listening (e.g. Chrome automatic pause), restart if needed
      if (this.isListening && this.recognition) {
        try {
          this.recognition.start();
        } catch {
          // ignore
        }
      } else {
        this.callbacks.onEnd?.();
      }
    };
  }

  public start(): void {
    if (!this.recognition) return;
    this.accumulatedFinal = "";
    this.currentInterim = "";
    this.isListening = true;
    try {
      this.recognition.start();
    } catch {
      // Already running or not allowed
    }
  }

  public stop(): string {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    const full = (this.accumulatedFinal + " " + this.currentInterim).trim();
    return full;
  }

  public abort(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
    this.accumulatedFinal = "";
    this.currentInterim = "";
  }

  public getTranscript(): string {
    return (this.accumulatedFinal + " " + this.currentInterim).trim();
  }
}
