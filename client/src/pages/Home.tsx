import React, { useState, useRef, useCallback } from "react";
import { defaultResumeData, ResumeData, ProjectItem, WorkItem, EduItem, ActionItem } from "@/lib/resumeData";
import ResumePreview from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";
import { Download, Plus, Trash2, ChevronDown, ChevronRight, Save, FolderOpen, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ── 多版本简历持久化 ──
const STORAGE_KEY = "resume_versions_v1";

interface ResumeVersion {
  id: string;
  name: string;
  data: ResumeData;
  updatedAt: number;
}

function loadVersions(): ResumeVersion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVersions(versions: ResumeVersion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
}
// PDF 导出改用浏览器原生 print 方式，避免 html2canvas 颜色兴容性问题

export default function Home() {
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true, work: true, edu: false, projects: true, advantages: false,
  });
  const previewRef = useRef<HTMLDivElement>(null);

  // ── 版本管理状态 ──
  const [versions, setVersions] = useState<ResumeVersion[]>(loadVersions);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  // 保存当前内容为新版本或覆盖已有版本
  const handleSave = useCallback(() => {
    const name = saveName.trim() || `简历 ${new Date().toLocaleDateString("zh-CN")}`;
    const now = Date.now();
    let newVersions: ResumeVersion[];
    if (activeVersionId) {
      // 覆盖当前版本
      newVersions = versions.map((v) =>
        v.id === activeVersionId ? { ...v, name, data, updatedAt: now } : v
      );
    } else {
      // 新建版本
      const id = `v_${now}`;
      const newV: ResumeVersion = { id, name, data, updatedAt: now };
      newVersions = [newV, ...versions];
      setActiveVersionId(id);
    }
    setVersions(newVersions);
    saveVersions(newVersions);
    setSaveDialogOpen(false);
    setSaveName("");
    toast.success(`已保存「${name}」`);
  }, [saveName, activeVersionId, versions, data]);

  // 另存为新版本
  const handleSaveAs = useCallback(() => {
    const name = saveName.trim() || `简历 ${new Date().toLocaleDateString("zh-CN")}`;
    const id = `v_${Date.now()}`;
    const newV: ResumeVersion = { id, name, data, updatedAt: Date.now() };
    const newVersions = [newV, ...versions];
    setVersions(newVersions);
    saveVersions(newVersions);
    setActiveVersionId(id);
    setSaveDialogOpen(false);
    setSaveName("");
    toast.success(`已另存为「${name}」`);
  }, [saveName, versions, data]);

  // 切换版本
  const switchVersion = useCallback((v: ResumeVersion) => {
    setData(v.data);
    setActiveVersionId(v.id);
    setSaveName(v.name);
    setShowVersionPanel(false);
    toast.success(`已切换到「${v.name}」`);
  }, []);

  // 删除版本
  const deleteVersion = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newVersions = versions.filter((v) => v.id !== id);
    setVersions(newVersions);
    saveVersions(newVersions);
    if (activeVersionId === id) setActiveVersionId(null);
    toast.success("已删除");
  }, [versions, activeVersionId]);

  // 新建空白简历
  const handleNew = useCallback(() => {
    setData(defaultResumeData);
    setActiveVersionId(null);
    setSaveName("");
    setShowVersionPanel(false);
    toast.success("已新建空白简历");
  }, []);

  const toggle = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const setBasic = (key: string, val: string) =>
    setData((d) => ({ ...d, basic: { ...d.basic, [key]: val } }));

  const setAdvantage = (i: number, val: string) =>
    setData((d) => {
      const a = [...d.advantages];
      a[i] = val;
      return { ...d, advantages: a };
    });

  const addAdvantage = () =>
    setData((d) => ({ ...d, advantages: [...d.advantages, ""] }));

  const removeAdvantage = (i: number) =>
    setData((d) => ({ ...d, advantages: d.advantages.filter((_, idx) => idx !== i) }));

  // Work
  const setWork = (id: string, key: keyof WorkItem, val: string) =>
    setData((d) => ({ ...d, work: d.work.map((w) => (w.id === id ? { ...w, [key]: val } : w)) }));

  const setWorkBullet = (id: string, bi: number, val: string) =>
    setData((d) => ({
      ...d,
      work: d.work.map((w) =>
        w.id === id ? { ...w, bullets: w.bullets.map((b, i) => (i === bi ? val : b)) } : w
      ),
    }));

  const addWorkBullet = (id: string) =>
    setData((d) => ({
      ...d,
      work: d.work.map((w) => (w.id === id ? { ...w, bullets: [...w.bullets, ""] } : w)),
    }));

  const removeWorkBullet = (id: string, bi: number) =>
    setData((d) => ({
      ...d,
      work: d.work.map((w) =>
        w.id === id ? { ...w, bullets: w.bullets.filter((_, i) => i !== bi) } : w
      ),
    }));

  // Education
  const setEdu = (id: string, key: keyof EduItem, val: string) =>
    setData((d) => ({ ...d, education: d.education.map((e) => (e.id === id ? { ...e, [key]: val } : e)) }));

  // Projects
  const setProject = (id: string, key: keyof ProjectItem, val: string) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, [key]: val } : p)),
    }));

  const setProjectAction = (pid: string, type: "actions" | "results", idx: number, field: keyof ActionItem, val: string) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === pid
          ? {
              ...p,
              [type]: p[type].map((a, i) => (i === idx ? { ...a, [field]: val } : a)),
            }
          : p
      ),
    }));

  const addProjectAction = (pid: string, type: "actions" | "results") =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === pid ? { ...p, [type]: [...p[type], { label: "", content: "" }] } : p
      ),
    }));

  const removeProjectAction = (pid: string, type: "actions" | "results", idx: number) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === pid ? { ...p, [type]: p[type].filter((_, i) => i !== idx) } : p
      ),
    }));

  const exportPDF = useCallback(() => {
    // 使用浏览器原生 print 导出 PDF，避免 html2canvas 颜色兴容性问题
    const printStyle = document.createElement("style");
    printStyle.id = "__resume-print-style";
    printStyle.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body > * { display: none !important; }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        #resume-print-root {
          display: block !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 210mm !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 99999 !important;
        }
        #resume-print-root #resume-preview {
          transform: none !important;
          width: 210mm !important;
          box-shadow: none !important;
        }
        /* 强制打印背景色和背景图片 */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(printStyle);

    // 创建专用打印容器
    const printRoot = document.createElement("div");
    printRoot.id = "resume-print-root";
    const el = document.getElementById("resume-preview");
    if (!el) return;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.width = "210mm";
    printRoot.appendChild(clone);
    document.body.appendChild(printRoot);

    window.print();

    // 打印完成后清理
    setTimeout(() => {
      document.getElementById("__resume-print-style")?.remove();
      document.getElementById("resume-print-root")?.remove();
    }, 1000);
  }, []);

  // Preview scale to fit right panel
  const PREVIEW_W = 794;
  const panelW = 820;
  const previewScale = panelW / PREVIEW_W;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ── LEFT: Editor ── */}
      <div className="w-[420px] flex-shrink-0 flex flex-col bg-white border-r border-slate-200 shadow-sm" style={{ height: '100vh' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-[#0d2137] to-[#1a5fa8]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-white font-bold text-base tracking-wide">简历编辑器</h1>
              {activeVersionId && (
                <p className="text-blue-200 text-xs mt-0.5 truncate max-w-[180px]">
                  {versions.find((v) => v.id === activeVersionId)?.name ?? ""}
                </p>
              )}
              {!activeVersionId && <p className="text-blue-200 text-xs mt-0.5">未保存</p>}
            </div>
            <Button
              onClick={exportPDF}
              size="sm"
              className="bg-white text-[#1a5fa8] hover:bg-blue-50 font-semibold text-xs px-3 h-8"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              导出 PDF
            </Button>
          </div>
          {/* 版本管理工具栏 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => { setSaveName(versions.find(v => v.id === activeVersionId)?.name ?? ""); setSaveDialogOpen(true); }}
              className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white border-0"
            >
              <Save className="w-3 h-3 mr-1" />
              {activeVersionId ? "保存" : "保存简历"}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowVersionPanel((v) => !v)}
              className="flex-1 h-7 text-xs bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <FolderOpen className="w-3 h-3 mr-1" />
              我的简历 {versions.length > 0 && `(${versions.length})`}
            </Button>
            <Button
              size="sm"
              onClick={handleNew}
              className="h-7 text-xs bg-white/10 hover:bg-white/20 text-white border-0 px-2"
              title="新建空白简历"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 版本列表面板 */}
        {showVersionPanel && (
          <div className="border-b border-slate-200 bg-slate-50 max-h-52 overflow-y-auto">
            {versions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">暂无保存的简历</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {versions.map((v) => (
                  <li
                    key={v.id}
                    onClick={() => switchVersion(v)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                      v.id === activeVersionId ? "bg-blue-50 border-l-2 border-blue-500" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">{v.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(v.updatedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteVersion(v.id, e)}
                      className="ml-2 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <div className="px-5 py-4 space-y-4">
            {/* 基本信息 */}
            <EditorSection title="基本信息" open={openSections.basic} onToggle={() => toggle("basic")}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["name", "姓名"], ["gender", "性别"], ["age", "年龄"], ["experience", "工作年限"],
                  ["jobTarget", "求职意向"], ["salary", "期望薪资"], ["city", "期望城市"],
                  ["phone", "手机号"], ["email", "邮箱"],
                ].map(([k, label]) => (
                  <div key={k} className={k === "jobTarget" || k === "email" ? "col-span-2" : ""}>
                    <Label className="text-xs text-slate-500 mb-1 block">{label}</Label>
                    <Input
                      value={(data.basic as unknown as Record<string, string>)[k] ?? ""}
                      onChange={(e) => setBasic(k, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <Label className="text-xs text-slate-500 mb-1 block">照片链接</Label>
                  <Input
                    value={data.basic.photoUrl}
                    onChange={(e) => setBasic("photoUrl", e.target.value)}
                    className="h-8 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </EditorSection>

            <Separator />

            {/* 工作经历 */}
            <EditorSection title="工作经历" open={openSections.work} onToggle={() => toggle("work")}>
              {data.work.map((w) => (
                <div key={w.id} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs text-slate-500 mb-1 block">公司名称</Label>
                      <Input value={w.company} onChange={(e) => setWork(w.id, "company", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">职位</Label>
                      <Input value={w.role} onChange={(e) => setWork(w.id, "role", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">时间</Label>
                      <Input value={w.period} onChange={(e) => setWork(w.id, "period", e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <Label className="text-xs text-slate-500 block">工作描述</Label>
                  {w.bullets.map((b, bi) => (
                    <div key={bi} className="flex gap-1.5">
                      <Textarea
                        value={b}
                        onChange={(e) => setWorkBullet(w.id, bi, e.target.value)}
                        className="text-sm min-h-[64px] flex-1"
                      />
                      <button onClick={() => removeWorkBullet(w.id, bi)} className="text-slate-400 hover:text-red-500 mt-1 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addWorkBullet(w.id)} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> 添加描述
                  </button>
                </div>
              ))}
            </EditorSection>

            <Separator />

            {/* 教育经历 */}
            <EditorSection title="教育经历" open={openSections.edu} onToggle={() => toggle("edu")}>
              {data.education.map((e) => (
                <div key={e.id} className="grid grid-cols-2 gap-2 mb-3">
                  <div className="col-span-2">
                    <Label className="text-xs text-slate-500 mb-1 block">学校</Label>
                    <Input value={e.school} onChange={(ev) => setEdu(e.id, "school", ev.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">学历/专业</Label>
                    <Input value={e.degree} onChange={(ev) => setEdu(e.id, "degree", ev.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">时间</Label>
                    <Input value={e.period} onChange={(ev) => setEdu(e.id, "period", ev.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-slate-500 mb-1 block">备注（选填）</Label>
                    <Input value={e.note ?? ""} onChange={(ev) => setEdu(e.id, "note", ev.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
              ))}
              <div className="mt-2">
                <Label className="text-xs text-slate-500 mb-1 block">个人优势（逗号分隔）</Label>
                <Input
                  value={data.certs.join("、")}
                  onChange={(e) => setData((d) => ({ ...d, certs: e.target.value.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) }))}
                  className="h-8 text-sm"
                />
              </div>
            </EditorSection>

            <Separator />

            {/* 项目经历 */}
            <EditorSection title="项目经历" open={openSections.projects} onToggle={() => toggle("projects")}>
              {data.projects.map((p, pi) => (
                <div key={p.id} className="mb-5">
                  {pi > 0 && <Separator className="mb-4" />}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="col-span-2">
                      <Label className="text-xs text-slate-500 mb-1 block">项目名称</Label>
                      <Input value={p.title} onChange={(e) => setProject(p.id, "title", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">角色</Label>
                      <Input value={p.role} onChange={(e) => setProject(p.id, "role", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">时间</Label>
                      <Input value={p.period} onChange={(e) => setProject(p.id, "period", e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">背景</Label>
                      <Textarea value={p.background} onChange={(e) => setProject(p.id, "background", e.target.value)} className="text-sm min-h-[72px]" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">任务</Label>
                      <Textarea value={p.task} onChange={(e) => setProject(p.id, "task", e.target.value)} className="text-sm min-h-[56px]" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block font-medium text-blue-600">方案（Action）</Label>
                      {p.actions.map((a, ai) => (
                        <div key={ai} className="border border-slate-200 rounded-md p-2 mb-2 bg-slate-50">
                          <div className="flex gap-1.5 mb-1.5">
                            <Input
                              placeholder="标签（如：机制设计）"
                              value={a.label}
                              onChange={(e) => setProjectAction(p.id, "actions", ai, "label", e.target.value)}
                              className="h-7 text-xs flex-1"
                            />
                            <button onClick={() => removeProjectAction(p.id, "actions", ai)} className="text-slate-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <Textarea
                            placeholder="内容"
                            value={a.content}
                            onChange={(e) => setProjectAction(p.id, "actions", ai, "content", e.target.value)}
                            className="text-sm min-h-[56px]"
                          />
                        </div>
                      ))}
                      <button onClick={() => addProjectAction(p.id, "actions")} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> 添加方案条目
                      </button>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block font-medium text-blue-600">成果（Result）</Label>
                      {p.results.map((r, ri) => (
                        <div key={ri} className="border border-slate-200 rounded-md p-2 mb-2 bg-slate-50">
                          <div className="flex gap-1.5 mb-1.5">
                            <Input
                              placeholder="标签（可留空）"
                              value={r.label}
                              onChange={(e) => setProjectAction(p.id, "results", ri, "label", e.target.value)}
                              className="h-7 text-xs flex-1"
                            />
                            <button onClick={() => removeProjectAction(p.id, "results", ri)} className="text-slate-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <Textarea
                            placeholder="成果内容"
                            value={r.content}
                            onChange={(e) => setProjectAction(p.id, "results", ri, "content", e.target.value)}
                            className="text-sm min-h-[56px]"
                          />
                        </div>
                      ))}
                      <button onClick={() => addProjectAction(p.id, "results")} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> 添加成果条目
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </EditorSection>

            <Separator />

            {/* 个人优势 */}
            <EditorSection title="个人优势" open={openSections.advantages} onToggle={() => toggle("advantages")}>
              {data.advantages.map((a, i) => (
                <div key={i} className="flex gap-1.5 mb-2">
                  <Textarea
                    value={a}
                    onChange={(e) => setAdvantage(i, e.target.value)}
                    className="text-sm min-h-[72px] flex-1"
                  />
                  <button onClick={() => removeAdvantage(i)} className="text-slate-400 hover:text-red-500 mt-1 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={addAdvantage} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                <Plus className="w-3 h-3" /> 添加优势
              </button>
            </EditorSection>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Preview ── */}
      <div className="flex-1 overflow-auto bg-slate-200 flex flex-col">
        <div className="px-6 py-3 bg-slate-300 border-b border-slate-300 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">实时预览</span>
          <span className="text-xs text-slate-500">编辑左侧内容，右侧实时同步</span>
        </div>
        <div className="flex-1 overflow-auto p-6 flex justify-center">
          <div
            ref={previewRef}
            style={{
              width: `${PREVIEW_W * previewScale}px`,
              height: "fit-content",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              position: "relative",
            }}
          >
            <ResumePreview data={data} scale={previewScale} />
            {/* A4 分页线叠加层 */}
            <PageLines previewW={PREVIEW_W} scale={previewScale} />
          </div>
        </div>
      </div>
      {/* 保存对话框 */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">保存简历</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm text-slate-600 mb-1.5 block">简历名称</Label>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={`简历 ${new Date().toLocaleDateString("zh-CN")}`}
              className="h-9"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            {activeVersionId && (
              <Button variant="outline" size="sm" onClick={handleSaveAs} className="text-xs">
                另存为新版本
              </Button>
            )}
            <Button size="sm" onClick={handleSave} className="bg-[#1a5fa8] hover:bg-[#1550a0] text-white text-xs">
              <Save className="w-3.5 h-3.5 mr-1" />
              {activeVersionId ? "覆盖保存" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// A4 尺寸：210mm × 297mm，96dpi 下 794px × 1123px
// 分页线组件：在预览层叠加红色虚线标示每页边界
function PageLines({ previewW, scale }: { previewW: number; scale: number }) {
  // A4 高度像素（794px 宽对应 1123px 高）
  const A4_H_PX = Math.round(previewW * (297 / 210));
  const scaledA4H = A4_H_PX * scale;

  // 获取预览内容实际高度（渲染后）
  const [totalH, setTotalH] = React.useState(0);
  React.useEffect(() => {
    const el = document.getElementById("resume-preview");
    if (el) setTotalH(el.offsetHeight * scale);
  });

  if (totalH === 0) return null;

  const lines: number[] = [];
  let y = scaledA4H;
  while (y < totalH) {
    lines.push(y);
    y += scaledA4H;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {lines.map((lineY, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${lineY}px`,
            left: 0,
            right: 0,
            height: "2px",
            background: "rgba(220, 38, 38, 0.7)",
            borderTop: "2px dashed rgba(220, 38, 38, 0.8)",
          }}
        >
          <span
            style={{
              position: "absolute",
              right: "8px",
              top: "-18px",
              fontSize: "10px",
              color: "rgba(220,38,38,0.9)",
              background: "rgba(255,255,255,0.9)",
              padding: "1px 5px",
              borderRadius: "3px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            第 {i + 1} 页结束
          </span>
        </div>
      ))}
    </div>
  );
}

function EditorSection({
  title, open, onToggle, children,
}: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}
