export default function DossierTracking() {
  return (
    <div
      style={{
        overflow: "hidden",
        height: "440px",
        width: "100%",
        borderRadius: "12px",
        border: "1px solid #ddd",
      }}
    >
      <iframe
        src="https://www.mahakim.ma/#/suivi/dossier-suivi"
        title="Mahakim Tracking"
        style={{
          width: "100%", // 👈 عرض ثابت
          height: "950px",
          border: "none",

          // 👇 أهم شيء
          transform: "scale(1) translateY(-160px)",

          // 👇 يمنع الانزلاقات الغريبة
          transformOrigin: "top left",
        }}
      />
    </div>
  )
}