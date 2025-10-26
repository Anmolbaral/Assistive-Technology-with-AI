export interface VideoProps {
  src: string;
  caption?: string;
  poster?: string;
  captionsVtt?: string;
  transcript?: React.ReactNode;
}

export function Video({ src, caption, poster, captionsVtt, transcript }: VideoProps) {
  return (
    <figure className="my-8">
      <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
        <video
          controls
          className="w-full h-full"
          poster={poster}
          aria-label={caption || "Instructional video"}
        >
          <source src={src} type="video/mp4" />
          {captionsVtt && (
            <track
              kind="captions"
              src={captionsVtt}
              srcLang="en"
              label="English"
              default
            />
          )}
          <p className="p-4">
            Your browser doesn't support video. Please{" "}
            <a href={src} className="text-primary underline">
              download the video
            </a>{" "}
            instead.
          </p>
        </video>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">
          {caption}
        </figcaption>
      )}
      {transcript && (
        <details className="mt-4 border rounded-lg p-4">
          <summary className="cursor-pointer font-semibold hover:text-primary">
            View Transcript
          </summary>
          <div className="mt-3 prose prose-sm max-w-none">{transcript}</div>
        </details>
      )}
    </figure>
  );
}

