import { ResumeData } from "@/lib/resumeData";

interface Props {
  data: ResumeData;
  scale?: number;
}

export default function ResumePreview({ data, scale = 1 }: Props) {
  const { basic, work, education, certs, projects, advantages } = data;

  return (
    <div
      id="resume-preview"
      style={{
        width: "794px",
        fontFamily: '"PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: "9.2pt",
        lineHeight: 1.52,
        color: "#1c1c1c",
        background: "#fff",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d2137 0%, #1a5fa8 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "stretch",
          minHeight: "120px",
        }}
      >
        {basic.photoUrl && (
          <div style={{ width: "90px", flexShrink: 0, overflow: "hidden" }}>
            <img
              src={basic.photoUrl}
              alt="照片"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
            />
          </div>
        )}
        <div style={{ flex: 1, padding: "14px 20px 12px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px" }}>
          <div style={{ fontSize: "26pt", fontWeight: 700, letterSpacing: "6px", color: "#fff", lineHeight: 1 }}>{basic.name}</div>
          <div style={{ display: "flex", flexWrap: "nowrap", gap: "5px" }}>
            {[
              `${basic.gender} · ${basic.age}`,
              basic.experience,
              `求职意向：${basic.jobTarget}`,
              `期望薪资：${basic.salary}`,
              `期望城市：${basic.city}`,
            ].map((tag, i) => (
              <span
                key={i}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "3px",
                  padding: "1px 8px",
                  fontSize: "8pt",
                  color: "#ddeeff",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div style={{ fontSize: "8.2pt", color: "rgba(255,255,255,0.82)", display: "flex", gap: "20px", whiteSpace: "nowrap" }}>
            <span>📱 {basic.phone}</span>
            <span>✉ {basic.email}</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "10px 18px 12px 18px" }}>
        {/* 工作经历 */}
        <Section title="工作经历">
          {work.map((w) => (
            <div key={w.id} style={{ marginBottom: "6px" }}>
              <ItemHeader title={w.company} role={w.role} period={w.period} />
              <ul style={{ paddingLeft: "14px", margin: 0 }}>
                {w.bullets.map((b, i) => (
                  <li key={i} style={{ marginBottom: "2.5px", textAlign: "justify" }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* 教育 + 证书 */}
        <div style={{ display: "flex", gap: "18px", marginBottom: "8px" }}>
          <div style={{ flex: 1.7 }}>
            <SectionTitle>教育经历</SectionTitle>
            {education.map((e) => (
              <div key={e.id} style={{ marginBottom: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: "7px", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, fontSize: "9.2pt", color: "#0d2137", whiteSpace: "nowrap" }}>{e.school}</span>
                    <span style={{ fontSize: "8.7pt", color: "#555", whiteSpace: "nowrap" }}>{e.degree}</span>
                  </div>
                  <span style={{ fontSize: "8.4pt", color: "#555", whiteSpace: "nowrap" }}>{e.period}</span>
                </div>
                {e.note && <div style={{ fontSize: "8.4pt", color: "#444", marginTop: "2px", paddingLeft: "2px" }}>{e.note}</div>}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <SectionTitle>资格证书</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
              {certs.map((c, i) => (
                <span key={i} style={{ background: "#e8f2fb", border: "1px solid #c8ddf0", borderRadius: "3px", padding: "3px 10px", fontSize: "8.7pt", color: "#1a5fa8" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 项目经历 */}
        <Section title="项目经历">
          {projects.map((p, idx) => (
            <div key={p.id}>
              {idx > 0 && <hr style={{ border: "none", borderTop: "0.5px dashed #c8ddf0", margin: "6px 0" }} />}
              <div style={{ marginBottom: "6px" }}>
                <ItemHeader title={p.title} role={p.role} period={p.period} />
                <ul style={{ paddingLeft: "14px", margin: 0 }}>
                  <li style={{ marginBottom: "2.5px", textAlign: "justify" }}>
                    <strong style={{ color: "#0d2137" }}>背景：</strong>{p.background}
                  </li>
                  <li style={{ marginBottom: "2.5px", textAlign: "justify" }}>
                    <strong style={{ color: "#0d2137" }}>任务：</strong>{p.task}
                  </li>
                  <li style={{ marginBottom: "2.5px" }}>
                    <strong style={{ color: "#0d2137" }}>方案：</strong>
                    <ul style={{ paddingLeft: "14px", margin: "1px 0 2px 0" }}>
                      {p.actions.map((a, i) => (
                        <li key={i} style={{ marginBottom: "1.5px", textAlign: "justify" }}>
                          {a.label && <strong style={{ color: "#0d2137" }}>{a.label}：</strong>}{a.content}
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li style={{ marginBottom: "2.5px" }}>
                    <strong style={{ color: "#0d2137" }}>成果：</strong>
                    {p.results.length === 1 && !p.results[0].label ? (
                      <span>{highlightNums(p.results[0].content)}</span>
                    ) : (
                      <ul style={{ paddingLeft: "14px", margin: "1px 0 2px 0" }}>
                        {p.results.map((r, i) => (
                          <li key={i} style={{ marginBottom: "1.5px", textAlign: "justify" }}>
                            {r.label && <strong style={{ color: "#0d2137" }}>{r.label}：</strong>}{highlightNums(r.content)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </Section>

        {/* 个人优势 */}
        <Section title="个人优势">
          <div style={{ display: "flex", gap: "8px" }}>
            {advantages.map((a, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "#e8f2fb",
                  borderLeft: "3px solid #2b8fe0",
                  borderRadius: "3px",
                  padding: "7px 11px",
                  fontSize: "8.7pt",
                  lineHeight: 1.52,
                  color: "#1c1c1c",
                }}
              >
                {a}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function highlightNums(text: string) {
  const parts = text.split(/(\d[\d,./万%+–\-]*[万%+单人次倍]?)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\d/.test(p) ? (
          <strong key={i} style={{ color: "#2b8fe0" }}>{p}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10pt",
        fontWeight: 700,
        color: "#1a5fa8",
        borderBottom: "1.5px solid #2b8fe0",
        paddingBottom: "2px",
        marginBottom: "5px",
        letterSpacing: "1px",
      }}
    >
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

function ItemHeader({ title, role, period }: { title: string; role: string; period: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", whiteSpace: "nowrap", marginBottom: "2px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <span style={{ fontWeight: 700, fontSize: "9.4pt", color: "#0d2137", whiteSpace: "nowrap" }}>{title}</span>
        <span style={{ fontSize: "8.6pt", color: "#2b8fe0", background: "#e8f2fb", padding: "1px 8px", borderRadius: "2px", whiteSpace: "nowrap" }}>{role}</span>
      </div>
      <span style={{ fontSize: "8.4pt", color: "#555", whiteSpace: "nowrap", flexShrink: 0 }}>{period}</span>
    </div>
  );
}
