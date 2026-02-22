import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Header } from "@/components/builder/Header";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { useBuilderState } from "@/hooks/useBuilderState";
import { getProject, updateProject, saveChatMessage, getChatMessages } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types/builder";
import { Loader2 } from "lucide-react";

const Builder = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("Cargando...");
  const [loadingProject, setLoadingProject] = useState(true);

  const { mode, setMode, messages, setMessages, preview, setPreview, isTyping, sendMessage } = useBuilderState();

  // Load project data
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        const project = await getProject(projectId);
        setProjectName(project.name);

        // Load existing HTML into preview
        if (project.html) {
          setPreview(prev => ({ ...prev, html: project.html!, status: "ready" }));
        }

        // Load chat messages
        const chatMsgs = await getChatMessages(projectId);
        if (chatMsgs && chatMsgs.length > 0) {
          const restored: Message[] = chatMsgs.map((m: { id: string; role: string; content: string; plan: unknown; created_at: string }) => ({
            id: m.id,
            role: m.role as "user" | "system",
            content: m.content,
            timestamp: new Date(m.created_at),
            plan: m.plan as Message["plan"],
          }));
          setMessages(prev => [prev[0], ...restored]); // Keep welcome + restored
        }
      } catch (err) {
        console.error("Error loading project:", err);
        navigate("/dashboard");
      } finally {
        setLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Auto-save HTML to project when preview changes
  useEffect(() => {
    if (!projectId || preview.status !== "ready" || loadingProject) return;

    const saveTimeout = setTimeout(() => {
      updateProject(projectId, { html: preview.html }).catch(console.error);
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [preview.html, preview.status, projectId, loadingProject]);

  // Wrap sendMessage to also save chat messages
  const handleSend = async (content: string) => {
    if (projectId) {
      saveChatMessage(projectId, "user", content).catch(console.error);
    }
    await sendMessage(content);
  };

  if (loadingProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header projectName={projectName} projectId={projectId} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <ChatPanel
            mode={mode}
            onModeChange={setMode}
            messages={messages}
            isTyping={isTyping}
            onSend={handleSend}
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

export default Builder;
