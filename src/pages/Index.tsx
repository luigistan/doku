import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Header } from "@/components/builder/Header";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { useBuilderState } from "@/hooks/useBuilderState";

const Index = () => {
  const { mode, setMode, messages, preview, setPreview, isTyping, sendMessage, confirmExecution, requestAdjustment } = useBuilderState();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header onOpenSettings={() => {}} onOpenCode={() => {}} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <ChatPanel
            mode={mode}
            onModeChange={setMode}
            messages={messages}
            isTyping={isTyping}
            onSend={sendMessage}
            onExecute={confirmExecution}
            onAskMore={requestAdjustment}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={40}>
          <PreviewPanel
            preview={preview}
            onViewportChange={(viewport) => setPreview((p) => ({ ...p, viewport }))}
            onRefresh={() => {
              const iframe = document.querySelector("iframe");
              if (iframe?.contentDocument) {
                iframe.contentDocument.open();
                iframe.contentDocument.write(preview.html);
                iframe.contentDocument.close();
              }
            }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
