import React from "react";
import { X, Minimize2, Maximize2, Download } from "lucide-react";
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

  if (!state || (state.status !== "rendering" && state.status !== "invoking" && state.status !== "done")) {
    return null;
  }

  const progress = Math.round((state.progress || 0) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl transition-all duration-300 ${
          isMinimized 
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
                <div className="text-green-600 dark:text-green-400">
                  ✅ Rendering completed successfully!
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

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {state.status === "invoking" ? "Preparing..." : "Processing..."}
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
                  We'll notify you when rendering is complete.
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