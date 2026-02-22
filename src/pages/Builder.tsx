import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Header } from "@/components/builder/Header";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { ProjectSettings } from "@/components/builder/ProjectSettings";
import { CodeViewer } from "@/components/builder/CodeViewer";
import { useBuilderState } from "@/hooks/useBuilderState";
import { getProject, updateProject, saveChatMessage, getChatMessages, deleteProject } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types/builder";
import { Loader2 } from "lucide-react";

const Builder = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("Cargando...");
  const [isPublic, setIsPublic] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  const { mode, setMode, messages, setMessages, preview, setPreview, isTyping, sendMessage, confirmExecution, requestAdjustment } = useBuilderState();

  // Load project data
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        const project = await getProject(projectId);
        setProjectName(project.name);
        setIsPublic(project.is_public);

        if (project.html) {
          setPreview(prev => ({ ...prev, html: project.html!, status: "ready" }));
        }

        const chatMsgs = await getChatMessages(projectId);
        if (chatMsgs && chatMsgs.length > 0) {
          const restored: Message[] = chatMsgs.map((m: { id: string; role: string; content: string; plan: unknown; created_at: string }) => ({
            id: m.id,
            role: m.role as "user" | "system",
            content: m.content,
            timestamp: new Date(m.created_at),
            plan: m.plan as Message["plan"],
          }));
          setMessages(prev => [prev[0], ...restored]);
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

  // Auto-save HTML
  useEffect(() => {
    if (!projectId || preview.status !== "ready" || loadingProject) return;
    const saveTimeout = setTimeout(() => {
      updateProject(projectId, { html: preview.html }).catch(console.error);
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [preview.html, preview.status, projectId, loadingProject]);

  // Save chat messages on change
  useEffect(() => {
    if (!projectId || loadingProject || messages.length <= 1) return;
    const last = messages[messages.length - 1];
    if (last.id !== "welcome") {
      saveChatMessage(projectId, last.role, last.content, last.plan).catch(console.error);
    }
  }, [messages.length]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleUpdateName = (name: string) => {
    if (!projectId) return;
    setProjectName(name);
    updateProject(projectId, { name }).catch(console.error);
  };

  const handleTogglePublic = (pub: boolean) => {
    if (!projectId) return;
    setIsPublic(pub);
    updateProject(projectId, { is_public: pub }).catch(console.error);
  };

  const handleDelete = async () => {
    if (!projectId) return;
    await deleteProject(projectId);
    navigate("/dashboard");
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
      <Header
        projectName={projectName}
        projectId={projectId}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenCode={() => setCodeOpen(true)}
      />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <ChatPanel
            mode={mode}
            onModeChange={setMode}
            messages={messages}
            isTyping={isTyping}
            onSend={handleSend}
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
              setPreview((p) => ({ ...p, html: p.html + " " }));
              setTimeout(() => setPreview((p) => ({ ...p, html: p.html.trim() })), 50);
            }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <ProjectSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        projectName={projectName}
        projectId={projectId}
        isPublic={isPublic}
        onUpdateName={handleUpdateName}
        onTogglePublic={handleTogglePublic}
        onDelete={handleDelete}
      />

      <CodeViewer
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        html={preview.html}
        projectName={projectName}
      />
    </div>
  );
};

export default Builder;
