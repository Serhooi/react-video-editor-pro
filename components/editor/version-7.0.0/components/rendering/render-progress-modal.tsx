import React from "react";
import { X, Minimize2, Maximize2, Download, Clock, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RenderProgressModalProps {
  state: any;
  onClose: () => void;
  onDownload?: (url: string) => void;
}

export const RenderProgressModal: React.FC<RenderProgressModalProps> = ({
  state,
  onClose,
  onDownload,
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [startTime] = React.useState(Date.now());
  const [elapsedTime, setElapsedTime] = React.useState(0);

  // Update elapsed time every second
  React.useEffect(() => {
    if (state.status === "rendering" || state.status === "invoking") {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.status, startTime]);

  if (!state || (state.status !== "rendering" && state.status !== "invoking" && state.status !== "done")) {
    return null;
  }

  const progress = Math.round((state.progress || 0) * 100);
  
  // Calculate estimated time remaining
  const estimatedTimeRemaining = progress > 0 ? Math.floor((elapsedTime / progress) * (100 - progress)) : 0;
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl transition-all duration-300 ${isMinimized
          ? "w-80 h-20"
          : "w-96 h-64"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {state.status === "done" ? "Video Ready!" : "Video Rendering"}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-6 space-y-4">
            {state.status === "done" ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Rendering completed successfully!</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total time: {formatTime(elapsedTime)}
                </div>
                {onDownload && state.url && (
                  <Button
                    onClick={() => onDownload(state.url)}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>

                {/* Status and timing info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {state.status === "invoking" ? (
                      <>
                        <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                        <span className="text-gray-600 dark:text-gray-400">Preparing render...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-600 dark:text-gray-400">Processing frames...</span>
                      </>
                    )}
                  </div>

                  {/* Time information */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Elapsed</div>
                      <div className="font-mono">{formatTime(elapsedTime)}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Remaining</div>
                      <div className="font-mono">
                        {estimatedTimeRemaining > 0 ? formatTime(estimatedTimeRemaining) : '--'}
                      </div>
                    </div>
                  </div>
                </div>

                {state.renderId && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Render ID
                    </div>
                    <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {state.renderId}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  You can minimize this window and continue working.
                  <br />
                  We&apos;ll notify you when rendering is complete.
                </div>
              </>
            )}
          </div>
        )}

        {/* Minimized content */}
        {isMinimized && (
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm">
                {state.status === "done" ? "Ready!" : `${progress}%`}
              </span>
            </div>
            {state.status === "done" && onDownload && state.url && (
              <Button
                size="sm"
                onClick={() => onDownload(state.url)}
                className="h-8"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};